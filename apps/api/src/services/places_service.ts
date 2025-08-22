import { LRUCache } from 'lru-cache';
import { redis, getCachedData, setCachedData } from '../lib/redis';

// Enhanced logging
import { logger } from '../lib/logger';

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  photo_reference?: string;
}

// Cache configuration - 1 hour TTL, max 1000 entries
const placesCache = new LRUCache<string, Place[]>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
});

export class PlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('GOOGLE_PLACES_API_KEY not found. Places service will return mock data.');
    }
  }

  /**
   * Batch search for places using Google Places API with concurrent requests
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param queries - Array of search queries to execute concurrently
   * @param radius - Search radius in meters (default: 5000)
   * @param types - Array of place types to search for
   * @returns Array of places from all queries
   */
  async getPlacesBatch(
    latitude: number,
    longitude: number,
    queries: string[],
    radius: number = 5000,
    types?: string[]
  ): Promise<Place[]> {
    const startTime = Date.now();
    logger.info(`Starting batch places search for ${queries.length} queries at (${latitude}, ${longitude})`);

    try {
      // Create batch cache key
      const batchCacheKey = this.generateBatchCacheKey(latitude, longitude, queries, radius, types);
      
      // Check Redis cache first (for longer-term storage)
      const cachedResult = await getCachedData<Place[]>(batchCacheKey);
      if (cachedResult) {
        logger.info(`Batch cache hit: ${cachedResult.length} places found in Redis`);
        return cachedResult;
      }

      // Check local cache
      const localCached = placesCache.get(batchCacheKey);
      if (localCached) {
        logger.info(`Local cache hit: ${localCached.length} places found`);
        return localCached;
      }

      // If no API key, return mock data
      if (!this.apiKey) {
        const mockPlaces = this.getMockPlacesBatch(latitude, longitude, queries, types);
        placesCache.set(batchCacheKey, mockPlaces);
        await setCachedData(batchCacheKey, mockPlaces, 3600); // 1 hour in Redis
        logger.info(`Mock data returned: ${mockPlaces.length} places`);
        return mockPlaces;
      }

      // Execute concurrent API calls
      const allPlaces = await this.executeConcurrentSearches(latitude, longitude, queries, radius, types);
      
      // Cache results
      placesCache.set(batchCacheKey, allPlaces);
      await setCachedData(batchCacheKey, allPlaces, 3600); // 1 hour in Redis
      
      const duration = Date.now() - startTime;
      logger.info(`Batch search completed in ${duration}ms: ${allPlaces.length} places found`);
      
      return allPlaces;
    } catch (error) {
      logger.error('Batch Google Places API error:', error);
      
      // Fallback to mock data on error
      const mockPlaces = this.getMockPlacesBatch(latitude, longitude, queries, types);
      logger.info(`Fallback to mock data: ${mockPlaces.length} places`);
      return mockPlaces;
    }
  }

  /**
   * Execute multiple searches concurrently using Promise.all
   */
  private async executeConcurrentSearches(
    latitude: number,
    longitude: number,
    queries: string[],
    radius: number,
    types?: string[]
  ): Promise<Place[]> {
    const searchPromises = queries.map(async (query, index) => {
      const startTime = Date.now();
      try {
        logger.debug(`Executing search ${index + 1}/${queries.length}: "${query}"`);
        
        const places = await this.getPlaces(latitude, longitude, query, radius, types?.[index]);
        
        const duration = Date.now() - startTime;
        logger.debug(`Search "${query}" completed in ${duration}ms: ${places.length} places`);
        
        return places;
      } catch (error) {
        logger.error(`Search "${query}" failed:`, error);
        return [];
      }
    });

    // Execute all searches concurrently
    const results = await Promise.all(searchPromises);
    
    // Flatten and deduplicate results
    const allPlaces = this.deduplicatePlaces(results.flat());
    
    logger.info(`Concurrent searches completed: ${allPlaces.length} unique places found`);
    return allPlaces;
  }

  /**
   * Deduplicate places by place ID
   */
  private deduplicatePlaces(places: Place[]): Place[] {
    const seen = new Set<string>();
    return places.filter(place => {
      if (seen.has(place.id)) {
        return false;
      }
      seen.add(place.id);
      return true;
    });
  }

  /**
   * Generate cache key for batch requests
   */
  private generateBatchCacheKey(
    latitude: number,
    longitude: number,
    queries: string[],
    radius: number,
    types?: string[]
  ): string {
    const queriesStr = queries.sort().join('|');
    const typesStr = types ? types.sort().join('|') : '';
    return `places_batch:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${queriesStr}:${radius}:${typesStr}`;
  }

  /**
   * Search for places using Google Places API (single query - kept for backward compatibility)
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param query - Search query (optional for nearby search)
   * @param radius - Search radius in meters (default: 5000)
   * @param type - Place type filter (optional)
   * @returns Array of places
   */
  async getPlaces(
    latitude: number,
    longitude: number,
    query?: string,
    radius: number = 5000,
    type?: string
  ): Promise<Place[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(latitude, longitude, query, radius, type);
    
    logger.debug(`Searching places: ${query || 'nearby'} at (${latitude}, ${longitude})`);
    
    // Check cache first
    const cached = placesCache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cached.length} places found`);
      return cached;
    }

    // If no API key, return mock data
    if (!this.apiKey) {
      const mockPlaces = this.getMockPlaces(latitude, longitude, query, type);
      placesCache.set(cacheKey, mockPlaces);
      return mockPlaces;
    }

    try {
      let places: Place[] = [];

      // Use Text Search if query is provided, otherwise use Nearby Search
      if (query) {
        places = await this.textSearch(query, latitude, longitude, radius, type);
      } else {
        places = await this.nearbySearch(latitude, longitude, radius, type);
      }

      // Cache the results
      placesCache.set(cacheKey, places);
      
      const duration = Date.now() - startTime;
      logger.info(`Places search completed in ${duration}ms: ${places.length} places found`);
      
      return places;
    } catch (error) {
      logger.error('Google Places API error:', error);
      
      // Fallback to mock data on error
      const mockPlaces = this.getMockPlaces(latitude, longitude, query, type);
      placesCache.set(cacheKey, mockPlaces);
      return mockPlaces;
    }
  }

  /**
   * Perform a text search using Google Places API
   */
  private async textSearch(
    query: string,
    latitude: number,
    longitude: number,
    radius: number,
    type?: string
  ): Promise<Place[]> {
    const startTime = Date.now();
    const url = new URL(`${this.baseUrl}/textsearch/json`);
    
    url.searchParams.set('query', query);
    url.searchParams.set('location', `${latitude},${longitude}`);
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('key', this.apiKey);
    
    if (type) {
      url.searchParams.set('type', type);
    }

    logger.debug(`Text search URL: ${url.toString().replace(this.apiKey, '***')}`);

    const response = await fetch(url.toString());
    const data = await response.json() as GooglePlacesResponse;
    
    const duration = Date.now() - startTime;
    logger.debug(`Text search API call completed in ${duration}ms`);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return this.transformPlaces(data.results || []);
  }

  /**
   * Perform a nearby search using Google Places API
   */
  private async nearbySearch(
    latitude: number,
    longitude: number,
    radius: number,
    type?: string
  ): Promise<Place[]> {
    const startTime = Date.now();
    const url = new URL(`${this.baseUrl}/nearbysearch/json`);
    
    url.searchParams.set('location', `${latitude},${longitude}`);
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('key', this.apiKey);
    
    if (type) {
      url.searchParams.set('type', type);
    }

    logger.debug(`Nearby search URL: ${url.toString().replace(this.apiKey, '***')}`);

    const response = await fetch(url.toString());
    const data = await response.json() as GooglePlacesResponse;
    
    const duration = Date.now() - startTime;
    logger.debug(`Nearby search API call completed in ${duration}ms`);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return this.transformPlaces(data.results || []);
  }

  /**
   * Transform Google Places API response to our Place interface
   */
  private transformPlaces(googlePlaces: GooglePlace[]): Place[] {
    return googlePlaces.map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      types: place.types,
      location: place.geometry.location,
      photo_reference: place.photos?.[0]?.photo_reference
    }));
  }

  /**
   * Generate cache key for single request
   */
  private generateCacheKey(
    latitude: number,
    longitude: number,
    query?: string,
    radius?: number,
    type?: string
  ): string {
    const lat = latitude.toFixed(4);
    const lng = longitude.toFixed(4);
    const queryStr = query || 'nearby';
    const radiusStr = radius?.toString() || '5000';
    const typeStr = type || 'all';
    return `places:${lat}:${lng}:${queryStr}:${radiusStr}:${typeStr}`;
  }

  /**
   * Get mock places for testing/fallback
   */
  private getMockPlaces(
    latitude: number,
    longitude: number,
    query?: string,
    type?: string
  ): Place[] {
    const basePlaces = [
      {
        id: 'mock_1',
        name: query ? `${query} - Mock Place 1` : 'Mock Restaurant 1',
        address: '123 Mock Street, Mock City',
        rating: 4.2,
        user_ratings_total: 150,
        price_level: 2,
        types: type ? [type] : ['restaurant'],
        location: { lat: latitude + 0.001, lng: longitude + 0.001 }
      },
      {
        id: 'mock_2',
        name: query ? `${query} - Mock Place 2` : 'Mock Museum 1',
        address: '456 Mock Avenue, Mock City',
        rating: 4.5,
        user_ratings_total: 300,
        price_level: 1,
        types: type ? [type] : ['museum'],
        location: { lat: latitude - 0.001, lng: longitude - 0.001 }
      }
    ];

    return basePlaces;
  }

  /**
   * Get mock places for batch requests
   */
  private getMockPlacesBatch(
    latitude: number,
    longitude: number,
    queries: string[],
    types?: string[]
  ): Place[] {
    const allPlaces: Place[] = [];
    
    queries.forEach((query, index) => {
      const type = types?.[index];
      const mockPlaces = this.getMockPlaces(latitude, longitude, query, type);
      allPlaces.push(...mockPlaces);
    });

    return this.deduplicatePlaces(allPlaces);
  }

  /**
   * Clear the places cache
   */
  clearCache(): void {
    placesCache.clear();
    logger.info('Places cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; max: number; ttl: number } {
    return {
      size: placesCache.size,
      max: placesCache.max,
      ttl: placesCache.ttl
    };
  }
}

// Export singleton instance
export const placesService = new PlacesService();
