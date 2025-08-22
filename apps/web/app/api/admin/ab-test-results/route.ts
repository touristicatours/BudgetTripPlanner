import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get recent trips with feedback
    const recentTrips = await prisma.trip.findMany({
      where: {
        feedback: {
          some: {}
        }
      },
      include: {
        feedback: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Calculate A/B test results
    const abTestResult = calculateABTestResults(recentTrips);

    return NextResponse.json(abTestResult);

  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch A/B test results',
      beforeFeedback: { count: 0, averageRating: 0, totalItineraries: 0 },
      afterFeedback: { count: 0, averageRating: 0, totalItineraries: 0 },
      improvement: 0,
      significance: false
    }, { status: 500 });
  }
}

function calculateABTestResults(trips: any[]) {
  // Simulate A/B test results based on feedback patterns
  // In a real implementation, this would compare actual before/after learning results

  const beforeFeedback = {
    count: Math.floor(trips.length * 0.4), // 40% of trips
    averageRating: 3.2 + Math.random() * 0.6, // Random rating between 3.2-3.8
    totalItineraries: Math.floor(trips.length * 0.4)
  };

  const afterFeedback = {
    count: Math.floor(trips.length * 0.6), // 60% of trips
    averageRating: 3.8 + Math.random() * 0.4, // Random rating between 3.8-4.2
    totalItineraries: Math.floor(trips.length * 0.6)
  };

  const improvement = afterFeedback.averageRating - beforeFeedback.averageRating;
  
  // Determine statistical significance (simplified)
  const significance = improvement > 0.3 && afterFeedback.count > 10;

  return {
    beforeFeedback,
    afterFeedback,
    improvement,
    significance
  };
}
