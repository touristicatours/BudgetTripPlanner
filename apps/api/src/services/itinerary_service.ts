import { placesService, Place } from './places_service';
import { recommendationService } from './recommendation_service';
import { healthScoringService } from './health_scoring_service';
import { redis, getCachedData, setCachedData } from '../lib/redis';
import { logger, PerformanceTracker, logCacheHit, logCacheMiss, logCacheSet } from '../lib/logger';

export interface ItineraryActivity {
  id: string;
  name: string;
  category: string;
  timeOfDay: string;
  duration: string;
  cost: string;
  note?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  mlScore?: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface ItineraryRequest {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetTotal: number;
  currency: string;
  pace: 'relaxed' | 'moderate' | 'fast';
  interests: string[];
  dietary?: string[];
  mustSee?: string[];
  activitiesPerDay?: number;
  detailLevel?: 'concise' | 'detailed';
  userId?: string;
}

export interface ItineraryResponse {
  tripId: string;
  destination: string;
  days: ItineraryDay[];
  totalCost: string;
  summary: string;
  generatedAt: string;
  learning_applied?: boolean;
  health_score?: {
    overall_score: number;
    health_status: string;
    breakdown: any;
  };
  optimization_info?: {
    optimizations_applied: number;
    improvement: number;
    original_score: number;
  };
}

export class ItineraryService {
  private readonly CACHE_TTL = {
    ITINERARY: 3600, // 1 hour for full itineraries
    PLACES: 86400,   // 24 hours for place data
    COORDINATES: 604800 // 1 week for coordinates
  };

  /**
   * Generate an itinerary with real-time place data and ML-powered recommendations
   */
  async generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
    const tracker = new PerformanceTracker('generate_itinerary', {
      destination: request.destination,
      travelers: request.travelers,
      interests: request.interests,
      userId: request.userId
    });

    try {
      logger.info(`Starting itinerary generation for ${request.destination}`);

      // Check cache for complete itinerary
      const cacheKey = this.generateItineraryCacheKey(request);
      const cachedItinerary = await getCachedData<ItineraryResponse>(cacheKey);
      
      if (cachedItinerary) {
        logCacheHit(cacheKey, 'itinerary');
        tracker.end(true, { cached: true });
        return cachedItinerary;
      }

      logCacheMiss(cacheKey, 'itinerary');

      // Get destination coordinates
      const coordinates = await this.getDestinationCoordinates(request.destination);
      
      // Calculate trip duration
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Prepare user profile for ML recommendations
      const userProfile = {
        interests: recommendationService.normalizeUserInterests(request.interests),
        budget: recommendationService.normalizeBudget(Math.ceil(request.budgetTotal / tripDays / 100)),
        pace: request.pace,
        group_size: request.travelers
      };

      // Generate itinerary days
      const days: ItineraryDay[] = [];
      let totalCost = 0;

      for (let i = 0; i < tripDays; i++) {
        tracker.logProgress(`Generating day ${i + 1}/${tripDays}`);
        
        // Get available activities for this day using batch API calls
        const availableActivities = await this.getAvailableActivitiesForDay(
          coordinates, 
          request.interests, 
          request.mustSee || [], 
          i
        );

        // Rank activities using ML recommendations
        const rankedActivities = await this.getRankedActivities(userProfile, availableActivities, i);
        
        // Create day activities from ranked results
        const dayActivities = await this.createDayActivitiesFromRanked(
          rankedActivities, 
          request.budgetTotal / tripDays, 
          request.currency
        );

        // Calculate day cost
        const dayCost = dayActivities.reduce((sum, activity) => {
          const cost = this.parseCost(activity.cost);
          return sum + cost;
        }, 0);
        totalCost += dayCost;

        days.push({
          day: i + 1,
          date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activities: dayActivities
        });
      }

      // Create initial response
      const response: ItineraryResponse = {
        tripId: request.tripId,
        destination: request.destination,
        days,
        totalCost: `${request.currency} ${totalCost.toFixed(2)}`,
        summary: this.generateSummary(days, request),
        generatedAt: new Date().toISOString(),
        learning_applied: !!request.userId
      };

      // Calculate health score and auto-optimize if needed
      try {
        if (await healthScoringService.isAvailable()) {
          logger.info('Health scoring service available, calculating score');
          
          // Calculate initial health score
          const healthScore = await healthScoringService.calculateHealthScore(response, userProfile);
          response.health_score = {
            overall_score: healthScore.overall_score,
            health_status: healthScore.health_status,
            breakdown: healthScore.breakdown
          };

          logger.info(`Initial health score: ${healthScore.overall_score}/100 (${healthScore.health_status})`);

          // Auto-optimize if score is below 80
          if (healthScore.overall_score < 80) {
            logger.info('Health score below 80, starting auto-optimization');
            
            // Get all available activities for optimization
            const allAvailableActivities = await this.getAllAvailableActivities(coordinates, request.interests);
            
            const optimizationResult = await healthScoringService.autoOptimize(
              response,
              userProfile,
              allAvailableActivities,
              5 // max iterations
            );

            // Update response with optimized itinerary
            response.days = optimizationResult.itinerary.days;
            response.health_score = {
              overall_score: optimizationResult.health_score.overall_score,
              health_status: optimizationResult.health_score.health_status,
              breakdown: optimizationResult.health_score.breakdown
            };
            response.optimization_info = {
              optimizations_applied: optimizationResult.optimizations_applied,
              improvement: optimizationResult.improvement,
              original_score: optimizationResult.original_score
            };

            logger.info(`Optimization complete: ${optimizationResult.optimizations_applied} changes, score improved from ${optimizationResult.original_score} to ${optimizationResult.health_score.overall_score}`);
          }
        } else {
          logger.warn('Health scoring service not available, skipping quality optimization');
        }
      } catch (error) {
        logger.error('Error during health scoring/optimization:', error);
        // Continue without health scoring if it fails
      }

      // Cache the complete itinerary
      await setCachedData(cacheKey, response, this.CACHE_TTL.ITINERARY);
      logCacheSet(cacheKey, 'itinerary', this.CACHE_TTL.ITINERARY);

      tracker.end(true, { 
        days_generated: tripDays, 
        total_activities: days.reduce((sum, day) => sum + day.activities.length, 0),
        total_cost: totalCost,
        health_score: response.health_score?.overall_score,
        optimizations_applied: response.optimization_info?.optimizations_applied || 0,
        cached: false
      });

      return response;

    } catch (error) {
      logger.error('Error generating itinerary:', error);
      tracker.end(false, { error: error.message });
      throw error;
    }
  }

  /**
   * Get available activities for a day using batch API calls for efficiency
   */
  private async getAvailableActivitiesForDay(
    coordinates: { lat: number; lng: number },
    interests: string[],
    mustSee: string[],
    dayIndex: number
  ): Promise<Place[]> {
    const tracker = new PerformanceTracker('get_available_activities', { dayIndex, interests_count: interests.length });

    try {
      // Map interests to place types and queries
      const { placeTypes, searchQueries } = this.mapInterestsToQueries(interests, dayIndex);
      
      // Add must-see items to queries if it's day 1
      if (dayIndex === 0 && mustSee.length > 0) {
        searchQueries.push(...mustSee);
      }

      // Use batch API call for efficiency
      const allPlaces = await placesService.getPlacesBatch(
        coordinates.lat,
        coordinates.lng,
        searchQueries,
        5000,
        placeTypes
      );

      tracker.end(true, { 
        places_found: allPlaces.length,
        queries_executed: searchQueries.length,
        types_searched: placeTypes.length
      });

      return allPlaces;

    } catch (error) {
      logger.error('Error getting available activities:', error);
      tracker.end(false, { error: error.message });
      return [];
    }
  }

  /**
   * Map user interests to place types and search queries
   */
  private mapInterestsToQueries(interests: string[], dayIndex: number): { placeTypes: string[]; searchQueries: string[] } {
    const interestMapping: Record<string, { types: string[]; queries: string[] }> = {
      'culture': { types: ['museum', 'art_gallery'], queries: ['museum', 'art gallery', 'cultural center'] },
      'history': { types: ['museum', 'historical_site'], queries: ['historical site', 'monument', 'castle'] },
      'food': { types: ['restaurant', 'cafe'], queries: ['restaurant', 'cafe', 'local food'] },
      'dining': { types: ['restaurant', 'cafe'], queries: ['fine dining', 'restaurant', 'cafe'] },
      'nature': { types: ['park', 'natural_feature'], queries: ['park', 'garden', 'nature reserve'] },
      'outdoors': { types: ['park', 'recreation_area'], queries: ['outdoor activities', 'hiking', 'park'] },
      'shopping': { types: ['shopping_mall', 'store'], queries: ['shopping mall', 'market', 'boutique'] },
      'nightlife': { types: ['bar', 'night_club'], queries: ['bar', 'nightclub', 'entertainment'] },
      'entertainment': { types: ['amusement_park', 'movie_theater'], queries: ['entertainment', 'amusement park', 'theater'] },
      'relaxation': { types: ['spa', 'park'], queries: ['spa', 'wellness center', 'relaxation'] },
      'sports': { types: ['sports_facility', 'recreation_area'], queries: ['sports facility', 'gym', 'fitness center'] }
    };

    const placeTypes: string[] = [];
    const searchQueries: string[] = [];

    // Add default queries for variety
    const defaultQueries = ['attractions', 'points of interest', 'popular places'];
    searchQueries.push(...defaultQueries);

    // Map interests to types and queries
    interests.forEach(interest => {
      const mapping = interestMapping[interest.toLowerCase()];
      if (mapping) {
        placeTypes.push(...mapping.types);
        searchQueries.push(...mapping.queries);
      }
    });

    // Add day-specific queries for variety
    const daySpecificQueries = [
      'tourist attractions',
      'local favorites',
      'hidden gems'
    ];
    searchQueries.push(daySpecificQueries[dayIndex % daySpecificQueries.length]);

    return {
      placeTypes: [...new Set(placeTypes)], // Remove duplicates
      searchQueries: [...new Set(searchQueries)] // Remove duplicates
    };
  }

  /**
   * Get ranked activities using ML recommendations
   */
  private async getRankedActivities(
    userProfile: any,
    availableActivities: Place[],
    dayIndex: number
  ): Promise<Array<Place & { mlScore?: number }>> {
    const tracker = new PerformanceTracker('get_ranked_activities', { 
      activities_count: availableActivities.length,
      dayIndex 
    });

    try {
      // Convert places to activity format for ML engine
      const activities = availableActivities.map(place => ({
        id: place.id,
        name: place.name,
        types: place.types,
        rating: place.rating,
        price_level: place.price_level,
        user_ratings_total: place.user_ratings_total,
        photo_reference: place.photo_reference
      }));

      // Get ML recommendations
      const recommendations = await recommendationService.getPersonalizedRecommendations(
        userProfile,
        activities,
        Math.min(10, availableActivities.length) // Get top 10 or all if less
      );

      // Map recommendations back to places with scores
      const rankedPlaces = availableActivities.map(place => {
        const recommendation = recommendations.find(rec => rec.activity.id === place.id);
        return {
          ...place,
          mlScore: recommendation?.score || 0
        };
      });

      // Sort by ML score
      rankedPlaces.sort((a, b) => (b.mlScore || 0) - (a.mlScore || 0));

      tracker.end(true, { 
        ranked_count: rankedPlaces.length,
        top_score: rankedPlaces[0]?.mlScore || 0
      });

      return rankedPlaces;

    } catch (error) {
      logger.error('Error getting ranked activities:', error);
      tracker.end(false, { error: error.message });
      
      // Fallback to simple ranking
      return this.fallbackRanking(availableActivities);
    }
  }

  /**
   * Fallback ranking when ML is unavailable
   */
  private fallbackRanking(activities: Place[]): Array<Place & { mlScore?: number }> {
    return activities
      .map(activity => ({
        ...activity,
        mlScore: (activity.rating || 0) * 0.6 + (activity.user_ratings_total ? Math.min(activity.user_ratings_total / 1000, 1) : 0) * 0.4
      }))
      .sort((a, b) => (b.mlScore || 0) - (a.mlScore || 0));
  }

  /**
   * Create day activities from ranked places
   */
  private async createDayActivitiesFromRanked(
    rankedPlaces: Array<Place & { mlScore?: number }>,
    dailyBudgetTarget: number,
    currency: string
  ): Promise<ItineraryActivity[]> {
    const activities: ItineraryActivity[] = [];
    let remainingBudget = dailyBudgetTarget;

    // Activity categories and time slots
    const categories = ['Culture', 'Food', 'Entertainment', 'Relaxation'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    for (let i = 0; i < Math.min(rankedPlaces.length, 6); i++) {
      const place = rankedPlaces[i];
      const category = categories[i % categories.length];
      const timeSlot = timeSlots[i % timeSlots.length];

      // Estimate cost based on price level
      const estimatedCost = this.estimateCost(place.price_level || 1, currency);
      
      // Check if we can afford this activity
      if (estimatedCost > remainingBudget && i > 2) {
        continue; // Skip expensive activities if budget is tight
      }

      const activity: ItineraryActivity = {
        id: place.id,
        name: place.name,
        category,
        timeOfDay: timeSlot,
        duration: this.estimateDuration(category),
        cost: estimatedCost,
        note: this.generateActivityNote(place),
        placeId: place.id,
        lat: place.location.lat,
        lng: place.location.lng,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        price_level: place.price_level,
        mlScore: place.mlScore
      };

      activities.push(activity);
      remainingBudget -= this.parseCost(estimatedCost);
    }

    return activities;
  }

  /**
   * Get destination coordinates with caching
   */
  private async getDestinationCoordinates(destination: string): Promise<{ lat: number; lng: number }> {
    const cacheKey = `coordinates:${destination.toLowerCase()}`;
    
    // Check cache first
    const cached = await getCachedData<{ lat: number; lng: number }>(cacheKey);
    if (cached) {
      logCacheHit(cacheKey, 'coordinates');
      return cached;
    }

    logCacheMiss(cacheKey, 'coordinates');

    // Default coordinates for major cities (in production, use a geocoding service)
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'paris': { lat: 48.8566, lng: 2.3522 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'rome': { lat: 41.9028, lng: 12.4964 },
      'barcelona': { lat: 41.3851, lng: 2.1734 },
      'amsterdam': { lat: 52.3676, lng: 4.9041 },
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'prague': { lat: 50.0755, lng: 14.4378 },
      'vienna': { lat: 48.2082, lng: 16.3738 }
    };

    const normalizedDestination = destination.toLowerCase();
    const coordinates = cityCoordinates[normalizedDestination] || { lat: 48.8566, lng: 2.3522 }; // Default to Paris

    // Cache coordinates
    await setCachedData(cacheKey, coordinates, this.CACHE_TTL.COORDINATES);
    logCacheSet(cacheKey, 'coordinates', this.CACHE_TTL.COORDINATES);

    return coordinates;
  }

  /**
   * Generate cache key for itinerary
   */
  private generateItineraryCacheKey(request: ItineraryRequest): string {
    const keyParts = [
      'itinerary',
      request.destination.toLowerCase(),
      request.startDate,
      request.endDate,
      request.travelers,
      Math.round(request.budgetTotal),
      request.currency,
      request.pace,
      request.interests.sort().join('|'),
      request.userId || 'anonymous'
    ];
    return keyParts.join(':');
  }

  /**
   * Estimate activity cost based on price level
   */
  private estimateCost(priceLevel: number, currency: string): string {
    const baseCosts = {
      USD: [15, 30, 60, 120],
      EUR: [12, 25, 50, 100],
      GBP: [10, 20, 40, 80]
    };

    const costs = baseCosts[currency as keyof typeof baseCosts] || baseCosts.USD;
    const cost = costs[Math.min(priceLevel, costs.length - 1)];
    
    return `${currency} ${cost}`;
  }

  /**
   * Parse cost string to number
   */
  private parseCost(costString: string): number {
    const match = costString.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Estimate activity duration
   */
  private estimateDuration(category: string): string {
    const durations: Record<string, string> = {
      'Culture': '2-3 hours',
      'Food': '1-2 hours',
      'Entertainment': '2-4 hours',
      'Relaxation': '1-3 hours'
    };
    return durations[category] || '2 hours';
  }

  /**
   * Generate activity note
   */
  private generateActivityNote(place: Place): string {
    const notes = [];
    
    if (place.rating && place.rating >= 4.5) {
      notes.push('Highly rated');
    }
    
    if (place.user_ratings_total && place.user_ratings_total > 1000) {
      notes.push('Popular destination');
    }
    
    if (place.price_level === 0) {
      notes.push('Free entry');
    }
    
    return notes.join('. ');
  }

  /**
   * Generate itinerary summary
   */
  private generateSummary(days: ItineraryDay[], request: ItineraryRequest): string {
    const totalActivities = days.reduce((sum, day) => sum + day.activities.length, 0);
    const categories = new Set(days.flatMap(day => day.activities.map(activity => activity.category)));
    
    return `A ${days.length}-day ${request.pace} itinerary for ${request.travelers} traveler(s) with ${totalActivities} activities across ${categories.size} categories. Perfect for ${request.interests.join(', ')} interests.`;
  }

  /**
   * Enrich existing itinerary with real place data
   */
  async enrichItinerary(
    itinerary: ItineraryResponse,
    destination: string
  ): Promise<ItineraryResponse> {
    const tracker = new PerformanceTracker('enrich_itinerary', { destination });
    
    try {
      const coordinates = await this.getDestinationCoordinates(destination);
      
      for (const day of itinerary.days) {
        for (const item of day.activities) {
          // If item has a generic title, try to find a real place
          if (!item.placeId && this.isGenericTitle(item.name)) {
            try {
              const places = await placesService.getPlaces(
                coordinates.lat,
                coordinates.lng,
                item.name,
                5000
              );
              
              if (places.length > 0) {
                const place = places[0];
                item.name = place.name;
                item.lat = place.location.lat;
                item.lng = place.location.lng;
                item.placeId = place.id;
                item.note = `${place.address}${place.rating ? ` (${place.rating}★)` : ''}`;
              }
            } catch (error) {
              logger.warn(`Failed to enrich item: ${item.name}`, error);
            }
          }
        }
      }

      tracker.end(true, { days_enriched: itinerary.days.length });
      return itinerary;
    } catch (error) {
      logger.error('Error enriching itinerary:', error);
      tracker.end(false, { error: error.message });
      throw error;
    }
  }

  /**
   * Get all available activities for optimization purposes
   */
  private async getAllAvailableActivities(
    coordinates: { lat: number; lng: number },
    interests: string[]
  ): Promise<Place[]> {
    const tracker = new PerformanceTracker('get_all_available_activities', { interests_count: interests.length });

    try {
      // Map interests to place types and queries
      const { placeTypes, searchQueries } = this.mapInterestsToQueries(interests, 0);
      
      // Add some generic queries for variety
      const genericQueries = [
        'restaurant', 'cafe', 'museum', 'park', 'shopping', 'attraction', 'landmark'
      ];
      searchQueries.push(...genericQueries);

      // Use batch API call for efficiency
      const allPlaces = await placesService.getPlacesBatch(
        coordinates.lat,
        coordinates.lng,
        searchQueries,
        10000, // Larger radius for more options
        placeTypes
      );

      tracker.end(true, { places_found: allPlaces.length });
      return allPlaces;
    } catch (error) {
      logger.error('Error getting all available activities:', error);
      tracker.end(false, { error: error.message });
      return [];
    }
  }

  /**
   * Check if a title is generic and needs enrichment
   */
  private isGenericTitle(title: string): boolean {
    const genericTitles = [
      'breakfast', 'lunch', 'dinner', 'coffee', 'museum', 'park', 'shopping', 'sightseeing'
    ];
    return genericTitles.some(generic => title.toLowerCase().includes(generic));
  }
}

// Export singleton instance
export const itineraryService = new ItineraryService();
