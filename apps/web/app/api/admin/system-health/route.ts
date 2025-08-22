import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Simulate system health data
    // In a real implementation, this would check actual API connections and system status
    const systemHealth = await getSystemHealth();

    return NextResponse.json(systemHealth);

  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch system health',
      apiConnections: {
        googlePlaces: { status: 'error', responseTime: 0 },
        openai: { status: 'error', responseTime: 0 },
        redis: { status: 'error', responseTime: 0 }
      },
      mlEngine: {
        status: 'error',
        lastCallTime: 0,
        averageResponseTime: 0,
        recentCalls: []
      },
      cacheStats: {
        hitRate: 0,
        totalRequests: 0,
        cacheSize: 0
      }
    }, { status: 500 });
  }
}

async function getSystemHealth() {
  // Simulate API health checks
  const apiConnections = {
    googlePlaces: {
      status: Math.random() > 0.1 ? 'healthy' : 'warning' as const,
      responseTime: Math.floor(Math.random() * 200) + 50
    },
    openai: {
      status: Math.random() > 0.05 ? 'healthy' : 'warning' as const,
      responseTime: Math.floor(Math.random() * 1000) + 200
    },
    redis: {
      status: Math.random() > 0.02 ? 'healthy' : 'warning' as const,
      responseTime: Math.floor(Math.random() * 10) + 1
    }
  };

  // Simulate ML engine status
  const mlEngine = {
    status: Math.random() > 0.05 ? 'healthy' : 'warning' as const,
    lastCallTime: Date.now() - Math.floor(Math.random() * 300000), // Random time within last 5 minutes
    averageResponseTime: Math.floor(Math.random() * 500) + 100,
    recentCalls: generateRecentCalls()
  };

  // Simulate cache statistics
  const cacheStats = {
    hitRate: Math.random() * 30 + 70, // 70-100% hit rate
    totalRequests: Math.floor(Math.random() * 10000) + 1000,
    cacheSize: Math.floor(Math.random() * 500) + 100
  };

  return {
    apiConnections,
    mlEngine,
    cacheStats
  };
}

function generateRecentCalls() {
  const calls = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(now - Math.random() * 3600000); // Random time within last hour
    const duration = Math.floor(Math.random() * 800) + 100;
    const success = Math.random() > 0.1; // 90% success rate
    
    calls.push({
      timestamp: timestamp.toISOString(),
      duration,
      success,
      error: success ? undefined : 'Model prediction failed'
    });
  }
  
  return calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
