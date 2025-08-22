"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itineraryService = exports.ItineraryService = void 0;
const places_service_1 = require("./places_service");
const recommendation_service_1 = require("./recommendation_service");
class ItineraryService {
    /**
     * Generate an itinerary with real-time place data and ML-powered recommendations
     */
    async generateItinerary(request) {
        const { destination, startDate, endDate, budgetTotal, currency = 'USD', interests, mustSee, pace = 'moderate', travelers = 2 } = request;
        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const dailyBudgetTarget = budgetTotal / totalDays;
        // Get destination coordinates
        const coordinates = await this.getDestinationCoordinates(destination);
        // Create user profile for ML recommendations
        const userProfile = {
            interests: recommendation_service_1.RecommendationService.normalizeUserInterests(interests),
            budget: recommendation_service_1.RecommendationService.normalizeBudget(Math.ceil(dailyBudgetTarget / 100)), // Convert to 1-4 scale
            pace: pace,
            group_size: travelers
        };
        // Generate base itinerary structure with ML-powered recommendations
        const days = [];
        let estimatedTotal = 0;
        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            // Step 1: Fetch available activities from Places Service
            const availableActivities = await this.getAvailableActivitiesForDay(coordinates, interests, mustSee, i);
            // Step 2: Rank them using the ML recommendation engine
            const rankedActivities = await this.getRankedActivities(userProfile, availableActivities, i);
            // Step 3: Build itinerary with top-ranked activities
            const items = await this.createDayActivitiesFromRanked(rankedActivities, dailyBudgetTarget, currency);
            const subtotal = items.reduce((sum, item) => sum + item.estCost, 0);
            estimatedTotal += subtotal;
            days.push({
                date: dateStr,
                summary: `Day ${i + 1} in ${destination}`,
                items,
                subtotal
            });
        }
        return {
            currency,
            totalDays,
            dailyBudgetTarget,
            estimatedTotal,
            days
        };
    }
    /**
     * Get destination coordinates (simplified implementation)
     */
    async getDestinationCoordinates(destination) {
        // Common destination coordinates (in production, use a geocoding service)
        const commonDestinations = {
            'paris': { lat: 48.8566, lng: 2.3522 },
            'london': { lat: 51.5074, lng: -0.1278 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'tokyo': { lat: 35.6762, lng: 139.6503 },
            'rome': { lat: 41.9028, lng: 12.4964 },
            'barcelona': { lat: 41.3851, lng: 2.1734 },
            'amsterdam': { lat: 52.3676, lng: 4.9041 },
            'berlin': { lat: 52.5200, lng: 13.4050 },
            'madrid': { lat: 40.4168, lng: -3.7038 },
            'vienna': { lat: 48.2082, lng: 16.3738 },
        };
        const normalizedDestination = destination.toLowerCase().trim();
        // Try exact match first
        if (commonDestinations[normalizedDestination]) {
            return commonDestinations[normalizedDestination];
        }
        // Try partial matches
        for (const [city, coords] of Object.entries(commonDestinations)) {
            if (normalizedDestination.includes(city) || city.includes(normalizedDestination)) {
                return coords;
            }
        }
        // Default to Paris if no match found
        console.warn(`No coordinates found for destination: ${destination}, using Paris as default`);
        return { lat: 48.8566, lng: 2.3522 };
    }
    /**
     * Get available activities for a specific day (Step 1 of ML flow)
     */
    async getAvailableActivitiesForDay(coordinates, interests, mustSee, dayIndex) {
        const places = [];
        // Get must-see places first (day 1 priority)
        if (dayIndex === 0 && mustSee.length > 0) {
            for (const mustSeeItem of mustSee) {
                try {
                    const mustSeePlaces = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, mustSeeItem, 10000, // Larger radius for must-see items
                    'point_of_interest');
                    places.push(...mustSeePlaces.slice(0, 2));
                }
                catch (error) {
                    console.warn(`Failed to find must-see place: ${mustSeeItem}`, error);
                }
            }
        }
        // Get a broader set of activities for ML ranking
        const searchRadius = 5000;
        const categories = ['restaurant', 'museum', 'park', 'point_of_interest', 'shopping_mall'];
        for (const category of categories) {
            try {
                const categoryPlaces = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, undefined, searchRadius, category);
                places.push(...categoryPlaces.slice(0, 5)); // Get more options for ML to rank
            }
            catch (error) {
                console.warn(`Failed to get places for category: ${category}`, error);
            }
        }
        // Remove duplicates based on place ID
        const uniquePlaces = places.filter((place, index, array) => array.findIndex(p => p.id === place.id) === index);
        return uniquePlaces;
    }
    /**
     * Rank activities using ML recommendation engine (Step 2 of ML flow)
     */
    async getRankedActivities(userProfile, availableActivities, dayIndex) {
        try {
            const recommendations = await recommendation_service_1.recommendationService.getPersonalizedRecommendations(userProfile, availableActivities, 8 // Get more than we need to have options
            );
            console.log(`🎯 Day ${dayIndex + 1}: Generated ${recommendations.length} ML recommendations from ${availableActivities.length} activities`);
            return recommendations;
        }
        catch (error) {
            console.warn('ML recommendation engine failed, using fallback ranking:', error);
            // Fallback to the original method
            return this.fallbackRanking(userProfile, availableActivities);
        }
    }
    /**
     * Fallback ranking method when ML engine is unavailable
     */
    fallbackRanking(userProfile, activities) {
        return activities.map((activity, index) => ({
            activity,
            score: Math.random() * 0.3 + (activity.rating || 3.5) / 5.0, // Simple scoring
            rank: index + 1
        })).sort((a, b) => b.score - a.score);
    }
    /**
     * Create day activities from ranked recommendations (Step 3 of ML flow)
     */
    async createDayActivitiesFromRanked(rankedActivities, dailyBudgetTarget, currency) {
        const activities = [];
        const times = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
        // Add breakfast
        activities.push({
            time: '08:00',
            title: 'Breakfast at local café',
            category: 'food',
            estCost: 15,
            notes: 'Start your day with coffee and pastries',
            booking: { type: 'none' }
        });
        // Add activities from ML recommendations
        const selectedActivities = rankedActivities.slice(0, Math.min(rankedActivities.length, times.length - 1));
        for (let i = 0; i < selectedActivities.length; i++) {
            const { activity: place, score } = selectedActivities[i];
            const time = times[i];
            // Determine category based on place types
            let category = 'sightseeing';
            if (place.types.includes('restaurant') || place.types.includes('food')) {
                category = 'food';
            }
            else if (place.types.includes('park')) {
                category = 'activity';
            }
            // Estimate cost based on place type and price level
            let estCost = 0;
            if (category === 'food') {
                estCost = place.price_level ? (place.price_level * 15) : 25;
            }
            else if (place.types.includes('museum')) {
                estCost = place.price_level ? (place.price_level * 10) : 15;
            }
            else {
                estCost = place.price_level ? (place.price_level * 5) : 0;
            }
            activities.push({
                time,
                title: place.name,
                category,
                lat: place.location.lat,
                lng: place.location.lng,
                estCost,
                notes: `${place.address}${place.rating ? ` (${place.rating}★)` : ''} • ML Score: ${score.toFixed(2)}`,
                placeId: place.id,
                booking: {
                    type: place.types.includes('museum') ? 'ticket' : 'none',
                    operator: place.types.includes('museum') ? place.name : undefined
                }
            });
        }
        // Add dinner if we haven't included a food activity recently
        const lastFoodActivity = activities.reverse().find(a => a.category === 'food');
        activities.reverse(); // Restore order
        if (!lastFoodActivity || activities.indexOf(lastFoodActivity) < activities.length - 2) {
            activities.push({
                time: '19:00',
                title: 'Dinner at local restaurant',
                category: 'food',
                estCost: 35,
                notes: 'Enjoy local cuisine',
                booking: { type: 'none' }
            });
        }
        return activities;
    }
    /**
     * Legacy method - kept for backward compatibility
     * Get places for a specific day based on interests and must-see items
     */
    async getPlacesForDay(coordinates, interests, mustSee, dayIndex) {
        const places = [];
        // Map interests to place types
        const interestToType = {
            'culture': 'museum',
            'art': 'museum',
            'history': 'museum',
            'food': 'restaurant',
            'dining': 'restaurant',
            'nature': 'park',
            'outdoors': 'park',
            'shopping': 'store',
            'nightlife': 'bar',
            'architecture': 'point_of_interest',
        };
        // Get must-see places first (day 1 priority)
        if (dayIndex === 0 && mustSee.length > 0) {
            for (const mustSeeItem of mustSee.slice(0, 2)) {
                try {
                    const mustSeePlaces = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, mustSeeItem, 10000, // Larger radius for must-see items
                    'point_of_interest');
                    places.push(...mustSeePlaces.slice(0, 1));
                }
                catch (error) {
                    console.warn(`Failed to find must-see place: ${mustSeeItem}`, error);
                }
            }
        }
        // Get places based on interests
        for (const interest of interests) {
            const placeType = interestToType[interest.toLowerCase()];
            if (placeType) {
                try {
                    const interestPlaces = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, undefined, 5000, placeType);
                    places.push(...interestPlaces.slice(0, 2));
                }
                catch (error) {
                    console.warn(`Failed to find places for interest: ${interest}`, error);
                }
            }
        }
        // Add some variety if we don't have enough places
        if (places.length < 3) {
            try {
                const nearbyPlaces = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, undefined, 3000);
                places.push(...nearbyPlaces.slice(0, 3 - places.length));
            }
            catch (error) {
                console.warn('Failed to get nearby places', error);
            }
        }
        return places.slice(0, 4); // Limit to 4 places per day
    }
    /**
     * Create day activities from places
     */
    async createDayActivities(places, dailyBudgetTarget, currency) {
        const activities = [];
        const times = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
        // Add breakfast
        activities.push({
            time: '08:00',
            title: 'Breakfast at local café',
            category: 'food',
            estCost: 15,
            notes: 'Start your day with coffee and pastries',
            booking: { type: 'none' }
        });
        // Add activities based on places
        for (let i = 0; i < Math.min(places.length, times.length - 1); i++) {
            const place = places[i];
            const time = times[i];
            // Determine category based on place types
            let category = 'sightseeing';
            if (place.types.includes('restaurant') || place.types.includes('food')) {
                category = 'food';
            }
            else if (place.types.includes('park')) {
                category = 'activity';
            }
            // Estimate cost based on place type and price level
            let estCost = 0;
            if (category === 'food') {
                estCost = place.price_level ? (place.price_level * 15) : 25;
            }
            else if (place.types.includes('museum')) {
                estCost = place.price_level ? (place.price_level * 10) : 15;
            }
            else {
                estCost = place.price_level ? (place.price_level * 5) : 0;
            }
            activities.push({
                time,
                title: place.name,
                category,
                lat: place.location.lat,
                lng: place.location.lng,
                estCost,
                notes: `${place.address}${place.rating ? ` (${place.rating}★)` : ''}`,
                placeId: place.id,
                booking: {
                    type: place.types.includes('museum') ? 'ticket' : 'none',
                    operator: place.types.includes('museum') ? place.name : undefined
                }
            });
        }
        // Add dinner
        activities.push({
            time: '19:00',
            title: 'Dinner at local restaurant',
            category: 'food',
            estCost: 35,
            notes: 'Enjoy local cuisine',
            booking: { type: 'none' }
        });
        return activities;
    }
    /**
     * Enrich existing itinerary with real place data
     */
    async enrichItinerary(itinerary, destination) {
        const coordinates = await this.getDestinationCoordinates(destination);
        for (const day of itinerary.days) {
            for (const item of day.items) {
                // If item has a generic title, try to find a real place
                if (!item.placeId && this.isGenericTitle(item.title)) {
                    try {
                        const places = await places_service_1.placesService.getPlaces(coordinates.lat, coordinates.lng, item.title, 5000);
                        if (places.length > 0) {
                            const place = places[0];
                            item.title = place.name;
                            item.lat = place.location.lat;
                            item.lng = place.location.lng;
                            item.placeId = place.id;
                            item.notes = `${place.address}${place.rating ? ` (${place.rating}★)` : ''}`;
                        }
                    }
                    catch (error) {
                        console.warn(`Failed to enrich item: ${item.title}`, error);
                    }
                }
            }
        }
        return itinerary;
    }
    /**
     * Check if a title is generic and needs enrichment
     */
    isGenericTitle(title) {
        const genericTitles = [
            'breakfast', 'lunch', 'dinner', 'coffee', 'cafe', 'restaurant',
            'museum', 'park', 'attraction', 'sight', 'landmark', 'shopping',
            'walk', 'tour', 'visit'
        ];
        const normalizedTitle = title.toLowerCase();
        return genericTitles.some(generic => normalizedTitle.includes(generic));
    }
}
exports.ItineraryService = ItineraryService;
// Export a singleton instance
exports.itineraryService = new ItineraryService();
