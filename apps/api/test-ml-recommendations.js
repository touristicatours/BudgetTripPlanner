// Test script for ML-powered recommendation engine
const { recommendationService } = require('./dist/services/recommendation_service');
const { itineraryService } = require('./dist/services/itinerary_service');

async function testMLRecommendations() {
  console.log('🤖 Testing ML-Powered Recommendation Engine...\n');

  try {
    // Test 1: Check Python dependencies
    console.log('🔍 Test 1: Checking Python ML dependencies...');
    const pythonAvailable = await recommendationService.checkPythonDependencies();
    console.log(`Python ML Engine Status: ${pythonAvailable ? '✅ Available' : '⚠️ Using fallback'}\n`);

    // Test 2: Test user profile normalization
    console.log('👤 Test 2: Testing user profile normalization...');
    const normalizedInterests = recommendationService.normalizeUserInterests(['museums', 'dining', 'parks']);
    const normalizedBudget = recommendationService.normalizeBudget('moderate');
    console.log(`Normalized interests: ${normalizedInterests.join(', ')}`);
    console.log(`Normalized budget: ${normalizedBudget}\n`);

    // Test 3: Test recommendation service directly
    console.log('🎯 Test 3: Testing direct recommendation service...');
    const userProfile = {
      interests: ['art', 'food', 'culture'],
      budget: 2,
      pace: 'moderate'
    };

    const sampleActivities = [
      {
        id: 'test_museum',
        name: 'Test Art Museum',
        types: ['museum', 'art_gallery', 'establishment'],
        rating: 4.5,
        price_level: 2,
        user_ratings_total: 1200,
        address: 'Test Museum Address',
        location: { lat: 48.8606, lng: 2.3376 }
      },
      {
        id: 'test_restaurant',
        name: 'Test French Restaurant',
        types: ['restaurant', 'food', 'establishment'],
        rating: 4.2,
        price_level: 3,
        user_ratings_total: 850,
        address: 'Test Restaurant Address',
        location: { lat: 48.8566, lng: 2.3522 }
      },
      {
        id: 'test_park',
        name: 'Test City Park',
        types: ['park', 'point_of_interest'],
        rating: 4.0,
        price_level: 0,
        user_ratings_total: 500,
        address: 'Test Park Address',
        location: { lat: 48.8550, lng: 2.3500 }
      }
    ];

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userProfile,
      sampleActivities,
      3
    );

    console.log(`Generated ${recommendations.length} recommendations:`);
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.activity.name} (Score: ${rec.score.toFixed(3)})`);
    });

    // Test 4: Test full itinerary generation with ML
    console.log('\n🗓️ Test 4: Testing ML-powered itinerary generation...');
    const itineraryRequest = {
      destination: 'Paris',
      startDate: '2024-06-15',
      endDate: '2024-06-17',
      travelers: 2,
      budgetTotal: 800,
      currency: 'USD',
      pace: 'moderate',
      interests: ['art', 'food', 'culture'],
      dietary: [],
      mustSee: ['Eiffel Tower']
    };

    const itinerary = await itineraryService.generateItinerary(itineraryRequest);
    
    console.log(`📋 Generated ${itinerary.totalDays}-day itinerary:`);
    console.log(`💰 Estimated total: ${itinerary.estimatedTotal} ${itinerary.currency}`);
    
    itinerary.days.forEach((day, index) => {
      console.log(`\n📅 Day ${index + 1} (${day.date}):`);
      day.items.forEach(item => {
        const mlScore = item.notes?.includes('ML Score') ? 
          ` 🎯 ${item.notes.split('ML Score: ')[1]?.split(' ')[0] || ''}` : '';
        console.log(`  ${item.time} - ${item.title}${mlScore}`);
      });
      console.log(`  💵 Day total: ${day.subtotal} ${itinerary.currency}`);
    });

    console.log('\n✅ All ML recommendation tests completed successfully!');
    
    if (!pythonAvailable) {
      console.log('\n💡 Note: Python ML dependencies not available. Using fallback recommendations.');
      console.log('   Run "./setup-ml.sh" to install ML dependencies for enhanced recommendations.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Run "./setup-ml.sh" to install Python dependencies');
    console.log('  2. Check that Python 3.8+ is installed');
    console.log('  3. Verify that the API server dependencies are installed');
  }
}

// Run the test
testMLRecommendations();
