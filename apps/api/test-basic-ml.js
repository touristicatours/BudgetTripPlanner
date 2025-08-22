// Basic test for ML integration without full build
const { RecommendationService } = require('./src/services/recommendation_service.ts');

console.log('🧪 Testing ML Integration (Basic)...\n');

try {
  // Test static methods
  console.log('📊 Testing static utility methods...');
  
  const interests = RecommendationService.normalizeUserInterests(['museums', 'dining', 'parks']);
  console.log(`✅ Normalized interests: ${interests.join(', ')}`);
  
  const budget = RecommendationService.normalizeBudget('moderate');
  console.log(`✅ Normalized budget: ${budget}`);
  
  console.log('\n✅ Basic ML integration test passed!');
  console.log('📝 Note: Full ML testing requires building the project first.');
  console.log('   Run: npm run test-ml (after setting up Python dependencies)');
  
} catch (error) {
  console.error('❌ Basic test failed:', error.message);
}
