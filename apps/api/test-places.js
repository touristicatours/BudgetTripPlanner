// Simple test script for Google Places API integration
const { placesService } = require('./dist/services/places_service');

async function testPlacesService() {
  console.log('🧪 Testing Google Places API Integration...\n');

  try {
    // Test 1: Search for restaurants in Paris
    console.log('📍 Test 1: Searching for restaurants in Paris...');
    const restaurants = await placesService.getPlaces(48.8566, 2.3522, undefined, 3000, 'restaurant');
    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.slice(0, 3).forEach(place => {
      console.log(`  - ${place.name} (${place.rating}★, ${place.price_level ? '$'.repeat(place.price_level) : 'N/A'})`);
    });

    // Test 2: Search for museums
    console.log('\n🏛️ Test 2: Searching for museums in Paris...');
    const museums = await placesService.getPlaces(48.8566, 2.3522, undefined, 5000, 'museum');
    console.log(`Found ${museums.length} museums:`);
    museums.slice(0, 3).forEach(place => {
      console.log(`  - ${place.name} (${place.rating}★, ${place.price_level ? '$'.repeat(place.price_level) : 'N/A'})`);
    });

    // Test 3: Text search for Eiffel Tower
    console.log('\n🗼 Test 3: Text search for "Eiffel Tower"...');
    const eiffelTower = await placesService.getPlaces(48.8566, 2.3522, 'Eiffel Tower', 10000);
    console.log(`Found ${eiffelTower.length} results for Eiffel Tower:`);
    eiffelTower.slice(0, 2).forEach(place => {
      console.log(`  - ${place.name} (${place.rating}★, ${place.address})`);
    });

    // Test 4: Cache statistics
    console.log('\n📊 Test 4: Cache statistics...');
    const cacheStats = placesService.getCacheStats();
    console.log(`Cache size: ${cacheStats.size}/${cacheStats.max}`);

    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 Note: If you see mock data, make sure to set GOOGLE_PLACES_API_KEY in your environment variables.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPlacesService();
