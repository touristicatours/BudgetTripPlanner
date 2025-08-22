# Quick Start Guide - Google Places API Integration

## 🚀 Get Started in 5 Minutes

### 1. Set Up API Key (Optional for Development)

For development, the service works without an API key using mock data. For production:

```bash
# Add to your .env file
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### 2. Install Dependencies

```bash
cd apps/api
npm install
```

### 3. Test the Integration

```bash
# Test with mock data (no API key needed)
node test-places.js
```

### 4. Use the API

#### Search for Places
```bash
curl "http://localhost:3000/v1/places?lat=48.8566&lng=2.3522&type=restaurant&radius=3000"
```

#### Generate Itinerary with Real Places
```bash
curl -X POST "http://localhost:3000/v1/ai/itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "test-trip",
    "destination": "Paris",
    "startDate": "2024-06-15",
    "endDate": "2024-06-17",
    "travelers": 2,
    "budgetTotal": 1000,
    "currency": "USD",
    "pace": "moderate",
    "interests": ["culture", "food"],
    "mustSee": ["Eiffel Tower"]
  }'
```

## 🎯 Key Features Ready to Use

### ✅ Real-time Place Search
- Search by location and type
- Get ratings, prices, and addresses
- Automatic caching (1-hour TTL)

### ✅ Enhanced Itinerary Generation
- Real places instead of generic activities
- Interest-based recommendations
- Must-see item prioritization

### ✅ Graceful Fallbacks
- Works without API key (mock data)
- Handles API errors automatically
- Cache management for testing

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/places` | GET | Search for places |
| `/v1/places/cache/stats` | GET | View cache statistics |
| `/v1/places/cache` | DELETE | Clear cache |
| `/v1/ai/itinerary` | POST | Generate itinerary with real places |

## 📝 Example Usage

### JavaScript/TypeScript
```javascript
// Search for restaurants
const response = await fetch('/v1/places?lat=48.8566&lng=2.3522&type=restaurant');
const data = await response.json();
console.log(data.places);

// Generate itinerary
const itineraryResponse = await fetch('/v1/ai/itinerary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tripId: 'my-trip',
    destination: 'Paris',
    startDate: '2024-06-15',
    endDate: '2024-06-20',
    travelers: 2,
    budgetTotal: 2000,
    interests: ['culture', 'food'],
    mustSee: ['Eiffel Tower']
  })
});
const itinerary = await itineraryResponse.json();
```

### Python
```python
import requests

# Search for places
response = requests.get('http://localhost:3000/v1/places', params={
    'lat': 48.8566,
    'lng': 2.3522,
    'type': 'restaurant',
    'radius': 3000
})
places = response.json()['places']

# Generate itinerary
itinerary_data = {
    'tripId': 'my-trip',
    'destination': 'Paris',
    'startDate': '2024-06-15',
    'endDate': '2024-06-20',
    'travelers': 2,
    'budgetTotal': 2000,
    'interests': ['culture', 'food'],
    'mustSee': ['Eiffel Tower']
}
response = requests.post('http://localhost:3000/v1/ai/itinerary', json=itinerary_data)
itinerary = response.json()
```

## 🧪 Testing

### Test Without API Key
The service automatically uses mock data when no API key is provided, making it perfect for development and testing.

### Test with Real API
1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API
3. Add the key to your environment variables
4. Run the test script to see real data

### Monitor Performance
```bash
# Check cache statistics
curl "http://localhost:3000/v1/places/cache/stats"

# Clear cache if needed
curl -X DELETE "http://localhost:3000/v1/places/cache"
```

## 🎉 What You Get

### Before (Static Data)
```json
{
  "name": "Generic Restaurant",
  "address": "123 Main St",
  "rating": 4.0
}
```

### After (Real-time Data)
```json
{
  "name": "Le Petit Bistrot",
  "address": "123 Rue de la Paix, 75001 Paris, France",
  "rating": 4.5,
  "user_ratings_total": 1250,
  "price_level": 2,
  "types": ["restaurant", "food", "establishment"],
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

## 🚀 Next Steps

1. **Start using the API** - It works immediately with mock data
2. **Get a Google Places API key** - For production use with real data
3. **Integrate with your frontend** - Use the endpoints in your UI
4. **Customize place types** - Add more specific search criteria
5. **Extend the service** - Add geocoding, photos, or booking integration

## 📞 Support

- **Documentation**: See `GOOGLE_PLACES_SETUP.md` for detailed setup
- **Implementation**: See `GOOGLE_PLACES_IMPLEMENTATION.md` for technical details
- **Testing**: Use `test-places.js` to verify functionality

The integration is production-ready and includes comprehensive error handling, caching, and fallbacks for reliable operation.
