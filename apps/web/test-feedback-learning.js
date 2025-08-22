// Test script for feedback learning system
const { feedbackLearningService } = require('./dist/src/services/feedback-learning.service');

async function testFeedbackLearning() {
  console.log('🧠 Testing Feedback Learning System...\n');

  try {
    // Test 1: Check analyzer availability
    console.log('🔍 Test 1: Checking feedback analyzer availability...');
    const analyzerAvailable = await feedbackLearningService.checkAnalyzerAvailability();
    console.log(`Feedback Analyzer Status: ${analyzerAvailable ? '✅ Available' : '⚠️ Using fallback'}\n`);

    // Test 2: Analyze user feedback
    console.log('📊 Test 2: Analyzing user feedback...');
    const testUserId = 'test-user-123';
    
    try {
      const inferredPreferences = await feedbackLearningService.analyzeUserFeedback(testUserId);
      console.log(`✅ Analysis complete for user ${testUserId}:`);
      console.log(`   - Interests found: ${Object.keys(inferredPreferences.interests).length}`);
      console.log(`   - Categories analyzed: ${Object.keys(inferredPreferences.categoryAffinities).length}`);
      console.log(`   - Budget preference: ${inferredPreferences.budgetPreference.value.toFixed(2)} (confidence: ${inferredPreferences.budgetPreference.confidence.toFixed(2)})`);
      console.log(`   - Pace preference: ${inferredPreferences.pacePreference.value.toFixed(2)} (confidence: ${inferredPreferences.pacePreference.confidence.toFixed(2)})`);
      
      if (Object.keys(inferredPreferences.interests).length > 0) {
        console.log('\n   Top inferred interests:');
        const topInterests = Object.entries(inferredPreferences.interests)
          .sort(([,a], [,b]) => b.value - a.value)
          .slice(0, 3);
        
        topInterests.forEach(([interest, pref]) => {
          console.log(`     - ${interest}: ${pref.value.toFixed(2)} (confidence: ${pref.confidence.toFixed(2)})`);
        });
      }
    } catch (error) {
      console.log(`⚠️ No feedback data found for user ${testUserId} (this is expected for new users)`);
    }

    // Test 3: Enhanced user profile
    console.log('\n🎯 Test 3: Creating enhanced user profile...');
    const statedPreferences = {
      interests: ['culture', 'food'],
      budget: 2,
      pace: 'moderate',
      travelers: 2
    };

    const enhancedProfile = await feedbackLearningService.getEnhancedUserProfile(testUserId, statedPreferences);
    console.log('✅ Enhanced profile created:');
    console.log(`   - Original interests: ${statedPreferences.interests.join(', ')}`);
    console.log(`   - Enhanced interests: ${enhancedProfile.interests.join(', ')}`);
    console.log(`   - Original budget: ${statedPreferences.budget}`);
    console.log(`   - Enhanced budget: ${enhancedProfile.budget}`);
    console.log(`   - Original pace: ${statedPreferences.pace}`);
    console.log(`   - Enhanced pace: ${enhancedProfile.pace}`);

    if (enhancedProfile.inferredPreferences) {
      console.log('\n   Learning insights:');
      console.log(`     - Last analysis: ${enhancedProfile.inferredPreferences.lastAnalysis}`);
      console.log(`     - Budget confidence: ${enhancedProfile.inferredPreferences.confidenceScores.budget.toFixed(2)}`);
      console.log(`     - Pace confidence: ${enhancedProfile.inferredPreferences.confidenceScores.pace.toFixed(2)}`);
      console.log(`     - Interests count: ${enhancedProfile.inferredPreferences.confidenceScores.interestsCount}`);
    }

    // Test 4: Learning statistics
    console.log('\n📈 Test 4: Getting learning statistics...');
    const learningStats = await feedbackLearningService.getLearningStats(testUserId);
    console.log('✅ Learning statistics:');
    console.log(`   - Total feedback: ${learningStats.totalFeedback}`);
    console.log(`   - Last analysis: ${learningStats.lastAnalysis}`);
    console.log(`   - Budget confidence: ${learningStats.confidenceScores.budget.toFixed(2)}`);
    console.log(`   - Pace confidence: ${learningStats.confidenceScores.pace.toFixed(2)}`);
    console.log(`   - Interests confidence: ${learningStats.confidenceScores.interests.toFixed(2)}`);

    if (learningStats.topInferredInterests.length > 0) {
      console.log('\n   Top inferred interests:');
      learningStats.topInferredInterests.forEach(({ interest, value, confidence }) => {
        console.log(`     - ${interest}: ${value.toFixed(2)} (confidence: ${confidence.toFixed(2)})`);
      });
    }

    console.log('\n✅ All feedback learning tests completed successfully!');
    
    if (!analyzerAvailable) {
      console.log('\n💡 Note: Python feedback analyzer not available. Using fallback mode.');
      console.log('   Run "cd ai && python3 feedback_analyzer.py test-user-123" to test the analyzer directly.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Make sure the database is set up with the UserFeedback table');
    console.log('  2. Check that Python dependencies are installed');
    console.log('  3. Verify that the feedback analyzer script is accessible');
  }
}

// Run the test
testFeedbackLearning();
