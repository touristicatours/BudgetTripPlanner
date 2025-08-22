"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placesService = exports.PlacesService = void 0;
const lru_cache_1 = require("lru-cache");
// Cache configuration - 1 hour TTL, max 1000 entries
const placesCache = new lru_cache_1.LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 60, // 1 hour
    updateAgeOnGet: true,
});
class PlacesService {
    constructor() {
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
        if (!this.apiKey) {
            console.warn('GOOGLE_PLACES_API_KEY not found. Places service will return mock data.');
        }
    }
    /**
     * Search for places using Google Places API
     * @param latitude - Latitude coordinate
     * @param longitude - Longitude coordinate
     * @param query - Search query (optional for nearby search)
     * @param radius - Search radius in meters (default: 5000)
     * @param type - Place type filter (optional)
     * @returns Array of places
     */
    async getPlaces(latitude, longitude, query, radius = 5000, type) {
        const cacheKey = this.generateCacheKey(latitude, longitude, query, radius, type);
        // Check cache first
        const cached = placesCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        // If no API key, return mock data
        if (!this.apiKey) {
            const mockPlaces = this.getMockPlaces(latitude, longitude, query, type);
            placesCache.set(cacheKey, mockPlaces);
            return mockPlaces;
        }
        try {
            let places = [];
            // Use Text Search if query is provided, otherwise use Nearby Search
            if (query) {
                places = await this.textSearch(query, latitude, longitude, radius, type);
            }
            else {
                places = await this.nearbySearch(latitude, longitude, radius, type);
            }
            // Cache the results
            placesCache.set(cacheKey, places);
            return places;
        }
        catch (error) {
            console.error('Google Places API error:', error);
            // Fallback to mock data on error
            const mockPlaces = this.getMockPlaces(latitude, longitude, query, type);
            placesCache.set(cacheKey, mockPlaces);
            return mockPlaces;
        }
    }
    /**
     * Perform a text search using Google Places API
     */
    async textSearch(query, latitude, longitude, radius, type) {
        const url = new URL(`${this.baseUrl}/textsearch/json`);
        url.searchParams.set('query', query);
        url.searchParams.set('location', `${latitude},${longitude}`);
        url.searchParams.set('radius', radius.toString());
        url.searchParams.set('key', this.apiKey);
        if (type) {
            url.searchParams.set('type', type);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${data.status}`);
        }
        return this.transformPlaces(data.results || []);
    }
    /**
     * Perform a nearby search using Google Places API
     */
    async nearbySearch(latitude, longitude, radius, type) {
        const url = new URL(`${this.baseUrl}/nearbysearch/json`);
        url.searchParams.set('location', `${latitude},${longitude}`);
        url.searchParams.set('radius', radius.toString());
        url.searchParams.set('key', this.apiKey);
        if (type) {
            url.searchParams.set('type', type);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status}`);
        }
        const data = await response.json();
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${data.status}`);
        }
        return this.transformPlaces(data.results || []);
    }
    /**
     * Transform Google Places API response to our simplified format
     */
    transformPlaces(googlePlaces) {
        return googlePlaces.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            types: place.types,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
            },
            photo_reference: place.photos?.[0]?.photo_reference,
        }));
    }
    /**
     * Generate a cache key for the given parameters
     */
    generateCacheKey(latitude, longitude, query, radius, type) {
        return `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${query || 'nearby'}_${radius}_${type || 'all'}`;
    }
    /**
     * Get mock places data for development/testing
     */
    getMockPlaces(latitude, longitude, query, type) {
        const basePlaces = [
            {
                id: 'mock_restaurant_1',
                name: 'Le Petit Bistrot',
                address: '123 Rue de la Paix, Paris',
                rating: 4.5,
                user_ratings_total: 1250,
                price_level: 2,
                types: ['restaurant', 'food', 'establishment'],
                location: {
                    lat: latitude + 0.001,
                    lng: longitude + 0.001,
                },
            },
            {
                id: 'mock_museum_1',
                name: 'Musée du Louvre',
                address: 'Rue de Rivoli, 75001 Paris',
                rating: 4.7,
                user_ratings_total: 8900,
                price_level: 3,
                types: ['museum', 'point_of_interest', 'establishment'],
                location: {
                    lat: latitude + 0.002,
                    lng: longitude + 0.002,
                },
            },
            {
                id: 'mock_park_1',
                name: 'Jardin des Tuileries',
                address: 'Place de la Concorde, 75001 Paris',
                rating: 4.3,
                user_ratings_total: 3200,
                price_level: 0,
                types: ['park', 'point_of_interest', 'establishment'],
                location: {
                    lat: latitude - 0.001,
                    lng: longitude - 0.001,
                },
            },
            {
                id: 'mock_cafe_1',
                name: 'Café de Flore',
                address: '172 Boulevard Saint-Germain, 75006 Paris',
                rating: 4.2,
                user_ratings_total: 2100,
                price_level: 2,
                types: ['cafe', 'food', 'establishment'],
                location: {
                    lat: latitude + 0.003,
                    lng: longitude + 0.003,
                },
            },
        ];
        // Filter by type if specified
        if (type) {
            return basePlaces.filter(place => place.types.some(t => t === type || t === 'establishment'));
        }
        return basePlaces;
    }
    /**
     * Clear the places cache
     */
    clearCache() {
        placesCache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: placesCache.size,
            max: placesCache.max,
        };
    }
}
exports.PlacesService = PlacesService;
// Export a singleton instance
exports.placesService = new PlacesService();
