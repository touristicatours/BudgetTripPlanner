#!/usr/bin/env node

/**
 * Test script for AI Explanation functionality
 * Validates explanation generation and itinerary summaries
 */

const BASE_URL = 'http://localhost:3000';

async function testAIExplanations() {
  console.log('🧪 Testing AI Explanation Functionality...\n');

  const results = {
    explanationAPI: await testExplanationAPI(),
    summaryAPI: await testSummaryAPI(),
    tooltipComponent: await testTooltipComponent(),
    summaryComponent: await testSummaryComponent()
  };

  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  let passedTests = 0;
  let totalTests = 0;

  Object.entries(results).forEach(([testName, result]) => {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`✅ ${testName}: PASSED`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    } else {
      console.log(`❌ ${testName}: FAILED - ${result.error}`);
    }
  });

  console.log(`\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All AI explanation tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }

  return results;
}

async function testExplanationAPI() {
  try {
    console.log('🔍 Testing AI Explanation API...');
    
    const testActivity = {
      name: 'Louvre Museum',
      rating: 4.6,
      price_level: 2,
      types: ['museum', 'art_gallery', 'tourist_attraction'],
      formatted_address: 'Rue de Rivoli, 75001 Paris, France',
      user_ratings_total: 125000
    };

    const testUserProfile = {
      userId: 'test-user-123',
      interests: ['art', 'culture', 'history'],
      budget: 3,
      pace: 'moderate'
    };

    const response = await fetch(`${BASE_URL}/api/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity: testActivity,
        userProfile: testUserProfile,
        decisionFactors: { ml_score: 0.85 }
      })
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.explanation || typeof data.explanation !== 'string') {
      return { success: false, error: 'Invalid explanation response structure' };
    }

    console.log(`   ✅ Generated explanation: "${data.explanation.substring(0, 100)}..."`);
    
    // Check if explanation contains expected elements
    const hasActivityName = data.explanation.includes('Louvre Museum');
    const hasInterest = data.explanation.includes('art') || data.explanation.includes('culture');
    const hasRating = data.explanation.includes('4.6') || data.explanation.includes('stars');

    if (hasActivityName && (hasInterest || hasRating)) {
      return { 
        success: true, 
        details: `Explanation generated successfully (${data.explanation.length} characters)` 
      };
    } else {
      return { success: false, error: 'Explanation missing expected content' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSummaryAPI() {
  try {
    console.log('📋 Testing AI Summary API...');
    
    const testUserProfile = {
      userId: 'test-user-123',
      interests: ['food', 'culture'],
      budget: 2,
      pace: 'relaxed'
    };

    const response = await fetch(`${BASE_URL}/api/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile: testUserProfile,
        destination: 'Paris',
        totalActivities: 8,
        dataPoints: 12500
      })
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.summary || !data.summary.optimized_for || !data.summary.based_on) {
      return { success: false, error: 'Invalid summary response structure' };
    }

    console.log(`   ✅ Generated summary with ${data.summary.optimized_for.length} optimization factors`);
    console.log(`   ✅ Based on ${data.summary.based_on.length} data sources`);

    return { 
      success: true, 
      details: `Summary generated with ${data.summary.optimized_for.length} optimizations` 
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testTooltipComponent() {
  try {
    console.log('💡 Testing Tooltip Component...');
    
    // Test if the component file exists and can be imported
    const fs = require('fs');
    const path = require('path');
    
    const componentPath = path.join(__dirname, 'components', 'AIExplanationTooltip.tsx');
    
    if (!fs.existsSync(componentPath)) {
      return { success: false, error: 'AIExplanationTooltip component not found' };
    }

    // Check if required dependencies are installed
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const hasRadixTooltip = packageJson.dependencies && packageJson.dependencies['@radix-ui/react-tooltip'];
    
    if (!hasRadixTooltip) {
      return { success: false, error: '@radix-ui/react-tooltip dependency not installed' };
    }

    console.log('   ✅ Component file exists');
    console.log('   ✅ Required dependencies installed');

    return { 
      success: true, 
      details: 'Tooltip component ready for use' 
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSummaryComponent() {
  try {
    console.log('📊 Testing Summary Component...');
    
    // Test if the component file exists
    const fs = require('fs');
    const path = require('path');
    
    const componentPath = path.join(__dirname, 'components', 'ItinerarySummary.tsx');
    
    if (!fs.existsSync(componentPath)) {
      return { success: false, error: 'ItinerarySummary component not found' };
    }

    console.log('   ✅ Component file exists');

    return { 
      success: true, 
      details: 'Summary component ready for use' 
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test explanation generation with different scenarios
async function testExplanationScenarios() {
  console.log('\n🎭 Testing Explanation Scenarios...\n');

  const scenarios = [
    {
      name: 'High-Rated Restaurant',
      activity: {
        name: 'Le Petit Bistrot',
        rating: 4.8,
        price_level: 2,
        types: ['restaurant', 'food'],
        user_ratings_total: 2500
      },
      userProfile: {
        interests: ['food', 'local cuisine'],
        budget: 2,
        pace: 'moderate'
      }
    },
    {
      name: 'Budget-Friendly Museum',
      activity: {
        name: 'Musée d\'Orsay',
        rating: 4.5,
        price_level: 1,
        types: ['museum', 'art_gallery'],
        user_ratings_total: 45000
      },
      userProfile: {
        interests: ['art', 'culture'],
        budget: 1,
        pace: 'relaxed'
      }
    },
    {
      name: 'Luxury Experience',
      activity: {
        name: 'Eiffel Tower Restaurant',
        rating: 4.2,
        price_level: 4,
        types: ['restaurant', 'tourist_attraction'],
        user_ratings_total: 15000
      },
      userProfile: {
        interests: ['luxury', 'fine dining'],
        budget: 4,
        pace: 'relaxed'
      }
    }
  ];

  for (const scenario of scenarios) {
    try {
      console.log(`Testing: ${scenario.name}`);
      
      const response = await fetch(`${BASE_URL}/api/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: scenario.activity,
          userProfile: scenario.userProfile
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ "${data.explanation.substring(0, 80)}..."`);
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAIExplanations()
    .then(() => testExplanationScenarios())
    .catch(console.error);
}

module.exports = { testAIExplanations, testExplanationScenarios };
