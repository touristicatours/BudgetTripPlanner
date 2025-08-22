#!/usr/bin/env node

/**
 * Test script for Admin Dashboard functionality
 * Validates all API endpoints and dashboard features
 */

const BASE_URL = 'http://localhost:3000';

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard Functionality...\n');

  const results = {
    auth: await testAuthentication(),
    feedbackStats: await testFeedbackStats(),
    users: await testUsers(),
    profileEvolution: await testProfileEvolution(),
    abTestResults: await testABTestResults(),
    systemHealth: await testSystemHealth()
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
    console.log('🎉 All admin dashboard tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }

  return results;
}

async function testAuthentication() {
  try {
    console.log('🔐 Testing Authentication...');
    
    // Test auth check without session
    const authCheckResponse = await fetch(`${BASE_URL}/api/admin/auth-check`);
    const authCheckResult = await authCheckResponse.json();
    
    if (authCheckResult.authenticated === false) {
      console.log('   ✅ Auth check correctly returns false for unauthenticated user');
    } else {
      return { success: false, error: 'Auth check should return false for unauthenticated user' };
    }

    // Test login with valid credentials
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    if (!loginResponse.ok) {
      return { success: false, error: 'Login failed with valid credentials' };
    }

    const loginResult = await loginResponse.json();
    if (loginResult.authenticated === true) {
      console.log('   ✅ Login successful with valid credentials');
    } else {
      return { success: false, error: 'Login should return true for valid credentials' };
    }

    return { success: true, details: 'Authentication flow working correctly' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFeedbackStats() {
  try {
    console.log('📊 Testing Feedback Statistics...');
    
    const response = await fetch(`${BASE_URL}/api/admin/feedback-stats`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.positive || !data.negative || typeof data.totalFeedback !== 'number') {
      return { success: false, error: 'Invalid response structure' };
    }

    console.log(`   ✅ Retrieved ${data.totalFeedback} total feedback items`);
    console.log(`   ✅ ${data.positive.length} positive feedback categories`);
    console.log(`   ✅ ${data.negative.length} negative feedback categories`);
    console.log(`   ✅ ${data.positiveRate.toFixed(1)}% positive rate`);

    return { 
      success: true, 
      details: `${data.totalFeedback} feedback items, ${data.positiveRate.toFixed(1)}% positive rate` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testUsers() {
  try {
    console.log('👥 Testing Users API...');
    
    const response = await fetch(`${BASE_URL}/api/admin/users`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.users || !Array.isArray(data.users)) {
      return { success: false, error: 'Invalid response structure' };
    }

    console.log(`   ✅ Retrieved ${data.users.length} users`);
    
    if (data.users.length > 0) {
      const firstUser = data.users[0];
      console.log(`   ✅ Sample user: ${firstUser.name} (${firstUser.userId})`);
    }

    return { 
      success: true, 
      details: `${data.users.length} users retrieved` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testProfileEvolution() {
  try {
    console.log('🧠 Testing Profile Evolution...');
    
    // First get users to test with
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`);
    const usersData = await usersResponse.json();
    
    if (!usersData.users || usersData.users.length === 0) {
      return { success: false, error: 'No users available for testing' };
    }

    const testUserId = usersData.users[0].userId;
    const response = await fetch(`${BASE_URL}/api/admin/profile-evolution?userId=${testUserId}`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.userId || !data.changes || !data.currentProfile) {
      return { success: false, error: 'Invalid response structure' };
    }

    console.log(`   ✅ Profile evolution for user: ${data.userId}`);
    console.log(`   ✅ ${data.changes.length} profile changes`);
    console.log(`   ✅ ${Object.keys(data.currentProfile).length} current interests`);

    return { 
      success: true, 
      details: `${data.changes.length} changes, ${Object.keys(data.currentProfile).length} interests` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testABTestResults() {
  try {
    console.log('📈 Testing A/B Test Results...');
    
    const response = await fetch(`${BASE_URL}/api/admin/ab-test-results`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.beforeFeedback || !data.afterFeedback || typeof data.improvement !== 'number') {
      return { success: false, error: 'Invalid response structure' };
    }

    console.log(`   ✅ Before feedback: ${data.beforeFeedback.averageRating.toFixed(2)} avg rating`);
    console.log(`   ✅ After feedback: ${data.afterFeedback.averageRating.toFixed(2)} avg rating`);
    console.log(`   ✅ Improvement: ${data.improvement > 0 ? '+' : ''}${data.improvement.toFixed(2)}`);
    console.log(`   ✅ Significance: ${data.significance ? 'Yes' : 'No'}`);

    return { 
      success: true, 
      details: `${data.improvement > 0 ? '+' : ''}${data.improvement.toFixed(2)} improvement` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSystemHealth() {
  try {
    console.log('🏥 Testing System Health...');
    
    const response = await fetch(`${BASE_URL}/api/admin/system-health`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.apiConnections || !data.mlEngine || !data.cacheStats) {
      return { success: false, error: 'Invalid response structure' };
    }

    // Check API connections
    const healthyAPIs = Object.values(data.apiConnections).filter(api => api.status === 'healthy').length;
    console.log(`   ✅ ${healthyAPIs}/3 APIs healthy`);
    
    // Check ML engine
    console.log(`   ✅ ML Engine: ${data.mlEngine.status}`);
    console.log(`   ✅ Average response time: ${data.mlEngine.averageResponseTime}ms`);
    
    // Check cache stats
    console.log(`   ✅ Cache hit rate: ${data.cacheStats.hitRate.toFixed(1)}%`);
    console.log(`   ✅ Total requests: ${data.cacheStats.totalRequests}`);

    return { 
      success: true, 
      details: `${healthyAPIs}/3 APIs healthy, ${data.cacheStats.hitRate.toFixed(1)}% cache hit rate` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test dashboard page accessibility
async function testDashboardPage() {
  try {
    console.log('🌐 Testing Dashboard Page...');
    
    const response = await fetch(`${BASE_URL}/admin/ai-performance`);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();
    
    if (html.includes('AI Performance Dashboard')) {
      console.log('   ✅ Dashboard page loads successfully');
      return { success: true, details: 'Dashboard page accessible' };
    } else {
      return { success: false, error: 'Dashboard page content not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAdminDashboard().catch(console.error);
}

module.exports = { testAdminDashboard };
