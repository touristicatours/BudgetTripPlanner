#!/usr/bin/env node

/**
 * Test script for Itinerary Health Scoring functionality
 */

const { spawn } = require('child_process');

// Sample test data
const sampleItinerary = {
  destination: "Paris",
  days: [
    {
      day: 1,
      date: "2024-06-01",
      activities: [
        {
          name: "Eiffel Tower",
          category: "Landmark",
          timeOfDay: "morning",
          duration: "3 hours",
          cost: "€26",
          rating: 4.6,
          user_ratings_total: 150000,
          price_level: 3,
          types: ["tourist_attraction", "landmark"]
        },
        {
          name: "Louvre Museum",
          category: "Museum",
          timeOfDay: "afternoon",
          duration: "4 hours",
          cost: "€17",
          rating: 4.5,
          user_ratings_total: 120000,
          price_level: 2,
          types: ["museum", "art_gallery"]
        },
        {
          name: "Le Petit Bistrot",
          category: "Restaurant",
          timeOfDay: "evening",
          duration: "2 hours",
          cost: "€45",
          rating: 4.8,
          user_ratings_total: 500,
          price_level: 2,
          types: ["restaurant", "food"]
        }
      ]
    },
    {
      day: 2,
      date: "2024-06-02",
      activities: [
        {
          name: "Arc de Triomphe",
          category: "Landmark",
          timeOfDay: "morning",
          duration: "2 hours",
          cost: "€13",
          rating: 4.4,
          user_ratings_total: 80000,
          price_level: 2,
          types: ["tourist_attraction", "landmark"]
        },
        {
          name: "Champs-Élysées",
          category: "Shopping",
          timeOfDay: "afternoon",
          duration: "3 hours",
          cost: "€0",
          rating: 4.2,
          user_ratings_total: 45000,
          price_level: 0,
          types: ["shopping_mall", "street"]
        }
      ]
    }
  ]
};

const sampleUserProfile = {
  interests: ["art", "culture", "food"],
  budget: "moderate",
  pace: "moderate",
  group_size: 2
};

const sampleAvailableActivities = [
  {
    name: "Musée d'Orsay",
    rating: 4.7,
    user_ratings_total: 95000,
    price_level: 2,
    types: ["museum", "art_gallery"]
  },
  {
    name: "Notre-Dame Cathedral",
    rating: 4.6,
    user_ratings_total: 110000,
    price_level: 0,
    types: ["church", "tourist_attraction"]
  },
  {
    name: "Montmartre",
    rating: 4.5,
    user_ratings_total: 65000,
    price_level: 0,
    types: ["neighborhood", "tourist_attraction"]
  }
];

async function testHealthScoring() {
  console.log('🧪 Testing Itinerary Health Scoring...\n');

  try {
    // Test 1: Calculate Health Score
    console.log('📊 Test 1: Calculating Health Score...');
    const healthScoreResult = await callPythonEngine({
      health_score: true,
      itinerary: sampleItinerary,
      user_profile: sampleUserProfile
    });

    if (healthScoreResult.status === 'success') {
      const score = healthScoreResult.health_score;
      console.log(`   ✅ Health Score: ${score.overall_score}/100 (${score.health_status})`);
      console.log(`   📈 Breakdown:`);
      Object.entries(score.breakdown).forEach(([category, data]) => {
        console.log(`      ${category}: ${data.score}/${data.max_score}`);
      });
    } else {
      console.log(`   ❌ Failed: ${healthScoreResult.message}`);
    }

    // Test 2: Auto-Optimization
    console.log('\n🔄 Test 2: Auto-Optimization...');
    const optimizationResult = await callPythonEngine({
      auto_optimize: true,
      itinerary: sampleItinerary,
      user_profile: sampleUserProfile,
      available_activities: sampleAvailableActivities,
      max_iterations: 3
    });

    if (optimizationResult.status === 'success') {
      const result = optimizationResult.optimization_result;
      console.log(`   ✅ Optimization Complete:`);
      console.log(`      Original Score: ${result.original_score}/100`);
      console.log(`      Final Score: ${result.health_score.overall_score}/100`);
      console.log(`      Improvement: +${result.improvement}`);
      console.log(`      Optimizations Applied: ${result.optimizations_applied}`);
    } else {
      console.log(`   ❌ Failed: ${optimizationResult.message}`);
    }

    // Test 3: Service Info
    console.log('\nℹ️  Test 3: Service Information...');
    const infoResult = await callPythonEngine({ info: true });

    if (infoResult.status === 'success') {
      console.log(`   ✅ Service Available`);
      console.log(`   📋 Model Info: ${JSON.stringify(infoResult.model_info, null, 2)}`);
    } else {
      console.log(`   ❌ Service Unavailable: ${infoResult.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function callPythonEngine(input) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['ai/recommendation_engine.py'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      } else {
        reject(new Error(`Python process failed with code ${code}: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();
  });
}

// Run tests
testHealthScoring().then(() => {
  console.log('\n🎉 Health scoring tests completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});
