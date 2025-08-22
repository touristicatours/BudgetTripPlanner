export interface Location {
  latitude: number;
  longitude: number;
}

export interface TravelTimeResponse {
  duration: number; // minutes
  distance: number; // meters
  trafficLevel: 'low' | 'medium' | 'high';
  route: {
    steps: Array<{
      instruction: string;
      distance: number;
      duration: number;
      travelMode: string;
    }>;
  };
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  location: Location;
  openingHours?: {
    openNow: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText?: string[];
  };
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types?: string[];
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
  waitTime?: number; // estimated wait time in minutes
  busyLevel?: 'not_busy' | 'slightly_busy' | 'moderately_busy' | 'very_busy';
}

export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Maps API key not found. Some features may not work.');
    }
  }

  /**
   * Get real-time travel time between two locations
   */
  async getTravelTime(
    origin: Location,
    destination: Location,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving',
    departureTime?: Date
  ): Promise<number> {
    try {
      const params = new URLSearchParams({
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        mode,
        key: this.apiKey
      });

      if (departureTime) {
        params.append('departure_time', Math.floor(departureTime.getTime() / 1000).toString());
      }

      const response = await fetch(
        `${this.baseUrl}/distancematrix/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const element = data.rows[0]?.elements[0];
      if (!element || element.status !== 'OK') {
        throw new Error(`No route found: ${element?.status}`);
      }

      // Return duration in minutes
      return Math.ceil(element.duration.value / 60);
    } catch (error) {
      console.error('Error getting travel time:', error);
      // Fallback: calculate rough estimate based on distance
      return this.calculateRoughTravelTime(origin, destination, mode);
    }
  }

  /**
   * Get detailed travel information including traffic
   */
  async getDetailedTravelTime(
    origin: Location,
    destination: Location,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving',
    departureTime?: Date
  ): Promise<TravelTimeResponse> {
    try {
      const params = new URLSearchParams({
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        key: this.apiKey
      });

      if (departureTime) {
        params.append('departure_time', Math.floor(departureTime.getTime() / 1000).toString());
      }

      const response = await fetch(
        `${this.baseUrl}/directions/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      // Calculate traffic level based on duration_in_traffic vs duration
      let trafficLevel: 'low' | 'medium' | 'high' = 'low';
      if (leg.duration_in_traffic && leg.duration) {
        const trafficRatio = leg.duration_in_traffic.value / leg.duration.value;
        if (trafficRatio > 1.5) trafficLevel = 'high';
        else if (trafficRatio > 1.2) trafficLevel = 'medium';
      }

      return {
        duration: Math.ceil(leg.duration.value / 60),
        distance: leg.distance.value,
        trafficLevel,
        route: {
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions,
            distance: step.distance.value,
            duration: step.duration.value,
            travelMode: step.travel_mode
          }))
        }
      };
    } catch (error) {
      console.error('Error getting detailed travel time:', error);
      // Fallback
      const duration = this.calculateRoughTravelTime(origin, destination, mode);
      return {
        duration,
        distance: this.calculateDistance(origin, destination),
        trafficLevel: 'low',
        route: { steps: [] }
      };
    }
  }

  /**
   * Get place details including opening hours and wait times
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'place_id,name,formatted_address,geometry,opening_hours,rating,user_ratings_total,price_level,types,photos',
        key: this.apiKey
      });

      const response = await fetch(
        `${this.baseUrl}/place/details/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const place = data.result;

      // Get current busy level (if available)
      const busyLevel = await this.getPlaceBusyLevel(placeId);

      // Estimate wait time based on busy level and place type
      const waitTime = this.estimateWaitTime(place.types || [], busyLevel);

      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          periods: place.opening_hours.periods,
          weekdayText: place.opening_hours.weekday_text
        } : undefined,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        types: place.types,
        photos: place.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })),
        waitTime,
        busyLevel
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Get current busy level for a place
   */
  private async getPlaceBusyLevel(placeId: string): Promise<'not_busy' | 'slightly_busy' | 'moderately_busy' | 'very_busy'> {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'current_opening_hours,popularity',
        key: this.apiKey
      });

      const response = await fetch(
        `${this.baseUrl}/place/details/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      // This is a simplified implementation
      // In a real implementation, you'd use the Popular Times API or similar
      const now = new Date();
      const hour = now.getHours();
      
      // Simulate busy levels based on time of day
      if (hour >= 12 && hour <= 14) return 'very_busy'; // Lunch time
      if (hour >= 18 && hour <= 20) return 'very_busy'; // Dinner time
      if (hour >= 10 && hour <= 16) return 'moderately_busy'; // Day time
      if (hour >= 20 || hour <= 8) return 'not_busy'; // Night time
      
      return 'slightly_busy';
    } catch (error) {
      console.error('Error getting busy level:', error);
      return 'moderately_busy'; // Default fallback
    }
  }

  /**
   * Estimate wait time based on place type and busy level
   */
  private estimateWaitTime(types: string[], busyLevel: string): number {
    let baseWaitTime = 0;

    // Base wait time by place type
    if (types.includes('restaurant')) {
      baseWaitTime = 15;
    } else if (types.includes('museum') || types.includes('tourist_attraction')) {
      baseWaitTime = 5;
    } else if (types.includes('store') || types.includes('shopping_mall')) {
      baseWaitTime = 3;
    } else if (types.includes('amusement_park') || types.includes('aquarium')) {
      baseWaitTime = 20;
    }

    // Adjust based on busy level
    switch (busyLevel) {
      case 'very_busy':
        return baseWaitTime * 3;
      case 'moderately_busy':
        return baseWaitTime * 2;
      case 'slightly_busy':
        return baseWaitTime * 1.5;
      default:
        return baseWaitTime;
    }
  }

  /**
   * Get real-time traffic conditions for a route
   */
  async getTrafficConditions(
    origin: Location,
    destination: Location
  ): Promise<{
    trafficLevel: 'low' | 'medium' | 'high';
    delay: number; // minutes
    alternativeRoutes: Array<{
      duration: number;
      distance: number;
      description: string;
    }>;
  }> {
    try {
      const normalTime = await this.getTravelTime(origin, destination, 'driving');
      const trafficTime = await this.getTravelTime(origin, destination, 'driving', new Date());
      
      const delay = Math.max(0, trafficTime - normalTime);
      
      let trafficLevel: 'low' | 'medium' | 'high' = 'low';
      if (delay > 15) trafficLevel = 'high';
      else if (delay > 5) trafficLevel = 'medium';

      // Get alternative routes
      const alternativeRoutes = await this.getAlternativeRoutes(origin, destination);

      return {
        trafficLevel,
        delay,
        alternativeRoutes
      };
    } catch (error) {
      console.error('Error getting traffic conditions:', error);
      return {
        trafficLevel: 'low',
        delay: 0,
        alternativeRoutes: []
      };
    }
  }

  /**
   * Get alternative routes to avoid traffic
   */
  private async getAlternativeRoutes(
    origin: Location,
    destination: Location
  ): Promise<Array<{
    duration: number;
    distance: number;
    description: string;
  }>> {
    try {
      const params = new URLSearchParams({
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        alternatives: 'true',
        key: this.apiKey
      });

      const response = await fetch(
        `${this.baseUrl}/directions/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      return data.routes.slice(1, 4).map((route: any) => {
        const leg = route.legs[0];
        return {
          duration: Math.ceil(leg.duration.value / 60),
          distance: leg.distance.value,
          description: this.generateRouteDescription(route)
        };
      });
    } catch (error) {
      console.error('Error getting alternative routes:', error);
      return [];
    }
  }

  /**
   * Generate a human-readable description of a route
   */
  private generateRouteDescription(route: any): string {
    const leg = route.legs[0];
    const duration = Math.ceil(leg.duration.value / 60);
    const distance = Math.round(leg.distance.value / 1000 * 10) / 10; // km

    // Check if route uses highways
    const hasHighway = route.legs[0].steps.some((step: any) => 
      step.html_instructions.includes('highway') || 
      step.html_instructions.includes('freeway')
    );

    if (hasHighway) {
      return `Highway route (${duration} min, ${distance} km)`;
    } else {
      return `Local route (${duration} min, ${distance} km)`;
    }
  }

  /**
   * Calculate rough travel time as fallback
   */
  private calculateRoughTravelTime(
    origin: Location,
    destination: Location,
    mode: string
  ): number {
    const distance = this.calculateDistance(origin, destination);
    
    // Rough speed estimates (km/h)
    const speeds = {
      driving: 30, // urban driving
      walking: 5,
      transit: 20,
      bicycling: 15
    };

    const speed = speeds[mode as keyof typeof speeds] || speeds.driving;
    return Math.ceil((distance / speed) * 60); // Convert to minutes
  }

  /**
   * Calculate distance between two points in kilometers
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Search for nearby places
   */
  async searchNearbyPlaces(
    location: Location,
    radius: number = 1000,
    type?: string
  ): Promise<Array<{
    placeId: string;
    name: string;
    location: Location;
    rating?: number;
    types: string[];
  }>> {
    try {
      const params = new URLSearchParams({
        location: `${location.latitude},${location.longitude}`,
        radius: radius.toString(),
        key: this.apiKey
      });

      if (type) {
        params.append('type', type);
      }

      const response = await fetch(
        `${this.baseUrl}/place/nearbysearch/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      return data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        rating: place.rating,
        types: place.types
      }));
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }
}
