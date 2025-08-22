const { spawn } = require('child_process');
const path = require('path');

// Test data
const testItinerary = {
  days: [
    {
      date: '2024-01-15',
      activities: [
        {
          name: 'Louvre Museum',
          type: 'museum',
          rating: 4.5,
          user_ratings_total: 15000,
          price_level: 3,
          start_time: '09:00',
          end_time: '12:00',
          address: 'Rue de Rivoli, 75001 Paris'
        },
        {
          name: 'Eiffel Tower',
          type: 'attraction',
          rating: 4.2,
          user_ratings_total: 25000,
          price_level: 4,
          start_time: '14:00',
          end_time: '16:00',
          address: 'Champ de Mars, 75007 Paris'
        },
        {
          name: 'Le Jules Verne Restaurant',
          type: 'restaurant',
          rating: 4.8,
          user_ratings_total: 2000,
          price_level: 4,
          start_time: '19:00',
          end_time: '21:00',
          address: 'Eiffel Tower, 75007 Paris'
        }
      ]
    },
    {
      date: '2024-01-16',
      activities: [
        {
          name: 'Notre-Dame Cathedral',
          type: 'church',
          rating: 4.3,
          user_ratings_total: 8000,
          price_level: 1,
          start_time: '10:00',
          end_time: '11:30',
          address: '6 Parvis Notre-Dame, 75004 Paris'
        },
        {
          name: 'Seine River Cruise',
          type: 'outdoor',
          rating: 4.1,
          user_ratings_total: 5000,
          price_level: 3,
          start_time: '14:00',
          end_time: '15:30',
          address: 'Port de la Bourdonnais, 75007 Paris'
        }
      ]
    }
  ]
};

const testUserProfile = {
  interests: ['art', 'culture', 'food'],
  budget: 2, // Moderate budget
  pace: 'moderate',
  travel_style: 'family',
  mobility_needs: false
};

const testWeatherForecast = {
  '2024-01-15': {
    condition: 'Rain',
    temperature: 12,
    precipitation_chance: 80,
    humidity: 85
  },
  '2024-01-16': {
    condition: 'Clear',
    temperature: 18,
    precipitation_chance: 10,
    humidity: 60
  }
};

async function testProactiveTips() {
  console.log('🧪 Testing Proactive Tips Generation...\n');

  try {
    const result = await callPythonEngine({
      proactive_tips: true,
      itinerary: testItinerary,
      user_profile: testUserProfile,
      weather_forecast: testWeatherForecast
    });

    if (result.status === 'success' && result.proactive_tips) {
      console.log('✅ Proactive tips generated successfully!');
      console.log(`📊 Found ${result.proactive_tips.length} tips:\n`);

      result.proactive_tips.forEach((tip, index) => {
        console.log(`${index + 1}. ${tip.type.toUpperCase()} (${tip.severity})`);
        console.log(`   ${tip.message}`);
        console.log(`   Action: ${tip.action_type}`);
        console.log('');
      });

      // Test applying a tip
      if (result.proactive_tips.length > 0) {
        console.log('🧪 Testing Tip Application...\n');
        await testTipApplication(testItinerary, testUserProfile, result.proactive_tips[0]);
      }
    } else {
      console.log('❌ Failed to generate proactive tips');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error testing proactive tips:', error.message);
  }
}

async function testTipApplication(itinerary, userProfile, tip) {
  try {
    const result = await callPythonEngine({
      apply_tip: true,
      itinerary,
      user_profile: userProfile,
      tip
    });

    if (result.status === 'success') {
      console.log('✅ Tip applied successfully!');
      console.log('Modified itinerary structure:', Object.keys(result.modified_itinerary));
      
      // Check for specific modifications based on tip type
      if (tip.action_type === 'reschedule_outdoor') {
        const day = result.modified_itinerary.days.find(d => d.date === tip.action_data.day_date);
        if (day && day.weather_note) {
          console.log('✅ Weather note added:', day.weather_note);
        }
      }
    } else {
      console.log('❌ Failed to apply tip');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error applying tip:', error.message);
  }
}

async function callPythonEngine(inputData) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(__dirname, 'ai/recommendation_engine.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath]);

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
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      } else {
        reject(new Error(`Python process failed with code ${code}: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Send input data to Python process
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
  });
}

async function testWeatherIntegration() {
  console.log('\n🌤️ Testing Weather Integration...\n');

  try {
    // Test without weather forecast
    const resultWithoutWeather = await callPythonEngine({
      proactive_tips: true,
      itinerary: testItinerary,
      user_profile: testUserProfile
    });

    console.log(`✅ Tips without weather: ${resultWithoutWeather.proactive_tips?.length || 0}`);

    // Test with weather forecast
    const resultWithWeather = await callPythonEngine({
      proactive_tips: true,
      itinerary: testItinerary,
      user_profile: testUserProfile,
      weather_forecast: testWeatherForecast
    });

    console.log(`✅ Tips with weather: ${resultWithWeather.proactive_tips?.length || 0}`);

    // Check if weather tips were generated
    const weatherTips = resultWithWeather.proactive_tips?.filter(tip => tip.type === 'weather') || [];
    console.log(`🌧️ Weather-specific tips: ${weatherTips.length}`);

  } catch (error) {
    console.error('❌ Error testing weather integration:', error.message);
  }
}

async function testDifferentUserProfiles() {
  console.log('\n👥 Testing Different User Profiles...\n');

  const profiles = [
    {
      name: 'Budget Traveler',
      profile: { interests: ['budget'], budget: 1, pace: 'slow' }
    },
    {
      name: 'Luxury Traveler',
      profile: { interests: ['luxury'], budget: 4, pace: 'relaxed' }
    },
    {
      name: 'Family with Kids',
      profile: { interests: ['family'], budget: 2, pace: 'moderate', travel_style: 'family' }
    },
    {
      name: 'Adventure Seeker',
      profile: { interests: ['hiking', 'outdoor'], budget: 2, pace: 'fast' }
    }
  ];

  for (const { name, profile } of profiles) {
    try {
      const result = await callPythonEngine({
        proactive_tips: true,
        itinerary: testItinerary,
        user_profile: profile
      });

      console.log(`${name}: ${result.proactive_tips?.length || 0} tips`);
    } catch (error) {
      console.log(`${name}: Error - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Proactive AI Assistant Tests\n');
  console.log('=' .repeat(50));

  await testProactiveTips();
  await testWeatherIntegration();
  await testDifferentUserProfiles();

  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testProactiveTips,
  testWeatherIntegration,
  testDifferentUserProfiles
};
