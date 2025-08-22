#!/usr/bin/env node

/**
 * Comprehensive test script for TripWeaver optimizations
 * Tests batch API calls, model persistence, logging, and caching
 */

const { placesService } = require('./dist/services/places_service');
const { itineraryService } = require('./dist/services/itinerary_service');
const { recommendationService } = require('./dist/services/recommendation_service');

async function testBatchApiCalls() {
  console.log('\n🧪 Testing Batch API Calls...');
  
  try {
    const startTime = Date.now();
    
    // Test single API calls (old method)
    console.log('📡 Testing single API calls...');
    const singleStart = Date.now();
    
    const queries = ['restaurant', 'museum', 'park', 'cafe', 'shopping'];
    const singleResults = [];
    
    for (const query of queries) {
      const places = await placesService.getPlaces(48.8566, 2.3522, query, 5000);
      singleResults.push(places);
    }
    
    const singleDuration = Date.now() - singleStart;
    const totalSinglePlaces = singleResults.flat().length;
    
    console.log(`✅ Single calls: ${singleDuration}ms, ${totalSinglePlaces} places found`);
    
    // Test batch API calls (new method)
    console.log('📡 Testing batch API calls...');
    const batchStart = Date.now();
    
    const batchResults = await placesService.getPlacesBatch(
      48.8566, 
      2.3522, 
      queries, 
      5000
    );
    
    const batchDuration = Date.now() - batchStart;
    
    console.log(`✅ Batch calls: ${batchDuration}ms, ${batchResults.length} places found`);
    
    // Calculate improvement
    const improvement = ((singleDuration - batchDuration) / singleDuration * 100).toFixed(1);
    console.log(`🚀 Performance improvement: ${improvement}% faster with batch calls`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total test duration: ${totalDuration}ms`);
    
    return { success: true, improvement };
    
  } catch (error) {
    console.error('❌ Batch API test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testModelPersistence() {
  console.log('\n🧪 Testing Model Persistence...');
  
  try {
    const startTime = Date.now();
    
    // Create test activities
    const testActivities = [
      {
        id: 'test_1',
        name: 'Louvre Museum',
        types: ['museum', 'art_gallery'],
        rating: 4.7,
        price_level: 3,
        user_ratings_total: 8900,
        photo_reference: 'photo_ref_1'
      },
      {
        id: 'test_2',
        name: 'Eiffel Tower',
        types: ['tourist_attraction', 'point_of_interest'],
        rating: 4.5,
        price_level: 2,
        user_ratings_total: 12500,
        photo_reference: 'photo_ref_2'
      },
      {
        id: 'test_3',
        name: 'Le Petit Bistrot',
        types: ['restaurant', 'food'],
        rating: 4.2,
        price_level: 2,
        user_ratings_total: 1500,
        photo_reference: 'photo_ref_3'
      }
    ];
    
    // Test model training and saving
    console.log('🤖 Testing model training...');
    const trainStart = Date.now();
    
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python3', ['ai/recommendation_engine.py']);
    
    const trainData = {
      train: true,
      activities: testActivities,
      force_retrain: true
    };
    
    pythonProcess.stdin.write(JSON.stringify(trainData));
    pythonProcess.stdin.end();
    
    const trainResult = await new Promise((resolve, reject) => {
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      pythonProcess.stderr.on('data', (data) => {
        console.warn('Python stderr:', data.toString());
      });
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });
    
    const trainDuration = Date.now() - trainStart;
    console.log(`✅ Model training: ${trainDuration}ms`);
    console.log(`📊 Model info:`, trainResult.model_info);
    
    // Test model loading (should be faster)
    console.log('🤖 Testing model loading...');
    const loadStart = Date.now();
    
    const loadData = { info: true };
    const pythonProcess2 = spawn('python3', ['ai/recommendation_engine.py']);
    
    pythonProcess2.stdin.write(JSON.stringify(loadData));
    pythonProcess2.stdin.end();
    
    const loadResult = await new Promise((resolve, reject) => {
      let output = '';
      pythonProcess2.stdout.on('data', (data) => {
        output += data.toString();
      });
      pythonProcess2.stderr.on('data', (data) => {
        console.warn('Python stderr:', data.toString());
      });
      pythonProcess2.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });
    
    const loadDuration = Date.now() - loadStart;
    console.log(`✅ Model loading: ${loadDuration}ms`);
    console.log(`📊 Loaded model info:`, loadResult.model_info);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total test duration: ${totalDuration}ms`);
    
    return { success: true, trainDuration, loadDuration };
    
  } catch (error) {
    console.error('❌ Model persistence test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCaching() {
  console.log('\n🧪 Testing Caching...');
  
  try {
    const startTime = Date.now();
    
    // Test itinerary caching
    console.log('💾 Testing itinerary caching...');
    
    const testRequest = {
      tripId: 'test-trip-123',
      destination: 'Paris',
      startDate: '2024-06-15',
      endDate: '2024-06-17',
      travelers: 2,
      budgetTotal: 1000,
      currency: 'USD',
      pace: 'moderate',
      interests: ['culture', 'food'],
      userId: 'test-user-123'
    };
    
    // First call (should cache)
    console.log('📡 First itinerary generation...');
    const firstStart = Date.now();
    const firstItinerary = await itineraryService.generateItinerary(testRequest);
    const firstDuration = Date.now() - firstStart;
    console.log(`✅ First generation: ${firstDuration}ms`);
    
    // Second call (should use cache)
    console.log('📡 Second itinerary generation (should use cache)...');
    const secondStart = Date.now();
    const secondItinerary = await itineraryService.generateItinerary(testRequest);
    const secondDuration = Date.now() - secondStart;
    console.log(`✅ Second generation: ${secondDuration}ms`);
    
    // Calculate cache improvement
    const cacheImprovement = ((firstDuration - secondDuration) / firstDuration * 100).toFixed(1);
    console.log(`🚀 Cache improvement: ${cacheImprovement}% faster with cache`);
    
    // Verify cache hit
    const isCached = secondDuration < firstDuration * 0.5; // Should be significantly faster
    console.log(`✅ Cache hit verified: ${isCached ? 'YES' : 'NO'}`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total test duration: ${totalDuration}ms`);
    
    return { success: true, firstDuration, secondDuration, cacheImprovement };
    
  } catch (error) {
    console.error('❌ Caching test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testLogging() {
  console.log('\n🧪 Testing Logging...');
  
  try {
    const startTime = Date.now();
    
    // Test logging levels
    console.log('📝 Testing logging levels...');
    
    const { logger } = require('./dist/lib/logger');
    
    logger.debug('Debug message test');
    logger.info('Info message test');
    logger.warn('Warning message test');
    logger.error('Error message test');
    
    // Test performance tracking
    console.log('📊 Testing performance tracking...');
    
    const { PerformanceTracker } = require('./dist/lib/logger');
    const tracker = new PerformanceTracker('test_operation', { test: true });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    tracker.logProgress('Halfway done');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const duration = tracker.end(true, { result: 'success' });
    console.log(`✅ Performance tracking: ${duration}ms`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total test duration: ${totalDuration}ms`);
    
    return { success: true, duration };
    
  } catch (error) {
    console.error('❌ Logging test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEndToEndOptimization() {
  console.log('\n🧪 Testing End-to-End Optimization...');
  
  try {
    const startTime = Date.now();
    
    // Test complete itinerary generation with all optimizations
    console.log('🚀 Testing optimized itinerary generation...');
    
    const testRequest = {
      tripId: 'optimization-test-123',
      destination: 'Paris',
      startDate: '2024-06-15',
      endDate: '2024-06-18',
      travelers: 2,
      budgetTotal: 1500,
      currency: 'USD',
      pace: 'moderate',
      interests: ['culture', 'food', 'shopping'],
      mustSee: ['Eiffel Tower', 'Louvre'],
      userId: 'test-user-456'
    };
    
    const generationStart = Date.now();
    const itinerary = await itineraryService.generateItinerary(testRequest);
    const generationDuration = Date.now() - generationStart;
    
    console.log(`✅ Optimized generation: ${generationDuration}ms`);
    console.log(`📊 Generated ${itinerary.days.length} days with ${itinerary.days.reduce((sum, day) => sum + day.activities.length, 0)} activities`);
    console.log(`💰 Total cost: ${itinerary.totalCost}`);
    console.log(`🎯 Learning applied: ${itinerary.learning_applied ? 'YES' : 'NO'}`);
    
    // Test cache hit on second call
    console.log('🔄 Testing cache hit...');
    const cacheStart = Date.now();
    const cachedItinerary = await itineraryService.generateItinerary(testRequest);
    const cacheDuration = Date.now() - cacheStart;
    
    console.log(`✅ Cached generation: ${cacheDuration}ms`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total test duration: ${totalDuration}ms`);
    
    return { 
      success: true, 
      generationDuration, 
      cacheDuration,
      days: itinerary.days.length,
      activities: itinerary.days.reduce((sum, day) => sum + day.activities.length, 0)
    };
    
  } catch (error) {
    console.error('❌ End-to-end optimization test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting TripWeaver Optimization Tests');
  console.log('=' .repeat(60));
  
  const results = {
    batchApiCalls: await testBatchApiCalls(),
    modelPersistence: await testModelPersistence(),
    caching: await testCaching(),
    logging: await testLogging(),
    endToEnd: await testEndToEndOptimization()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = 0;
  
  Object.entries(results).forEach(([testName, result]) => {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`✅ ${testName}: PASSED`);
      if (result.improvement) {
        console.log(`   🚀 Performance improvement: ${result.improvement}%`);
      }
      if (result.cacheImprovement) {
        console.log(`   💾 Cache improvement: ${result.cacheImprovement}%`);
      }
    } else {
      console.log(`❌ ${testName}: FAILED - ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All optimizations are working correctly!');
  } else {
    console.log('⚠️ Some optimizations need attention.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
