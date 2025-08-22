# Google Places API Integration Setup

This guide explains how to set up and use the Google Places API integration for real-time place data in TripWeaver.

## Overview

The Google Places API integration provides:
- Real-time place search using Google's comprehensive database
- Caching with 1-hour TTL to avoid API rate limits
- Fallback to mock data when API key is not available
- Integration with itinerary generation for dynamic trip planning

## Setup Instructions

### 1. Get a Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API (optional, for better destination handling)
4. Create credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### 2. Configure Environment Variables

Add the following environment variable to your `.env` file:

```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### 3. Install Dependencies

The required dependencies are already added to `package.json`:

```bash
npm install
```

## API Endpoints

### Places Search
```
GET /v1/places?lat={latitude}&lng={longitude}&query={search_query}&type={place_type}&radius={radius}
```

**Parameters:**
- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate
- `query` (optional): Search query for text search
- `type` (optional): Place type filter (restaurant, museum, park, cafe, hotel, attraction, poi)
- `radius` (optional): Search radius in meters (default: 5000)

**Response:**
```json
{
  "places": [
    {
      "id": "place_id",
      "name": "Place Name",
      "address": "Full Address",
      "rating": 4.5,
      "user_ratings_total": 1250,
      "price_level": 2,
      "types": ["restaurant", "food", "establishment"],
      "location": {
        "lat": 48.8566,
        "lng": 2.3522
      },
      "photo_reference": "photo_ref"
    }
  ],
  "count": 1,
  "query": "search_query",
  "location": { "lat": 48.8566, "lng": 2.3522 },
  "radius": 5000,
  "type": "restaurant"
}
```

### Cache Management
```
GET /v1/places/cache/stats
DELETE /v1/places/cache
```

### Enhanced Itinerary Generation
```
POST /v1/ai/itinerary
```

**Request Body:**
```json
{
  "tripId": "trip_123",
  "destination": "Paris",
  "startDate": "2024-06-15",
  "endDate": "2024-06-20",
  "travelers": 2,
  "budgetTotal": 2000,
  "currency": "USD",
  "pace": "moderate",
  "interests": ["culture", "food", "history"],
  "dietary": [],
  "mustSee": ["Eiffel Tower", "Louvre"]
}
```

## Features

### 1. Intelligent Caching
- LRU cache with 1-hour TTL
- Prevents API rate limit issues during development
- Cache statistics available via API

### 2. Graceful Fallbacks
- Returns mock data when API key is missing
- Handles API errors gracefully
- Continues to work in development without API key

### 3. Real-time Place Data
- Uses Google's comprehensive place database
- Includes ratings, reviews, and price levels
- Supports both text search and nearby search

### 4. Itinerary Integration
- Automatically enriches itineraries with real places
- Maps interests to appropriate place types
- Prioritizes must-see items in day 1

## Usage Examples

### Basic Place Search
```javascript
// Search for restaurants near Paris
const response = await fetch('/v1/places?lat=48.8566&lng=2.3522&type=restaurant&radius=3000');
const data = await response.json();
console.log(data.places);
```

### Generate Itinerary with Real Places
```javascript
const itineraryRequest = {
  tripId: 'trip_123',
  destination: 'Paris',
  startDate: '2024-06-15',
  endDate: '2024-06-20',
  travelers: 2,
  budgetTotal: 2000,
  currency: 'USD',
  pace: 'moderate',
  interests: ['culture', 'food'],
  mustSee: ['Eiffel Tower']
};

const response = await fetch('/v1/ai/itinerary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(itineraryRequest)
});

const itinerary = await response.json();
console.log(itinerary.days);
```

## Error Handling

The service handles various error scenarios:

1. **Missing API Key**: Returns mock data with warning
2. **API Rate Limits**: Uses cached data when available
3. **Network Errors**: Falls back to mock data
4. **Invalid Parameters**: Returns 400 error with details

## Development Notes

- Mock data is returned when `GOOGLE_PLACES_API_KEY` is not set
- Cache can be cleared via API endpoint for testing
- All API calls are logged for debugging
- Place types are mapped from interests automatically

## Troubleshooting

### Common Issues

1. **"API key not valid"**: Check that the API key is correct and the Places API is enabled
2. **"No results found"**: Try increasing the radius or using a different search query
3. **Rate limit errors**: The cache should handle this automatically, but you can increase cache TTL if needed

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=places-service
```

This will log all API calls and cache operations.

## Next Steps

Future enhancements could include:
- Geocoding service integration for better destination handling
- Photo URLs from Google Places API
- More sophisticated place type mapping
- Integration with booking APIs for real-time availability
