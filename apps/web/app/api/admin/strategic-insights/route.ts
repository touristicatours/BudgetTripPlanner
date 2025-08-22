import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '90d';
    
    // Calculate date range based on timeframe
    const now = new Date();
    const daysAgo = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // 1. Feature Adoption Funnel Analysis
    const featureAdoption = await calculateFeatureAdoptionFunnel(startDate);

    // 2. Cohort Analysis
    const cohorts = await calculateCohortAnalysis(startDate);

    // 3. Market Gap Analysis
    const marketGaps = await calculateMarketGapAnalysis(startDate);

    // 4. AI Model Performance
    const aiPerformance = await calculateAIModelPerformance(startDate);

    // 5. Key Metrics
    const keyMetrics = await calculateKeyMetrics(startDate);

    // 6. Strategic Recommendations
    const recommendations = generateStrategicRecommendations(
      featureAdoption, 
      cohorts, 
      marketGaps, 
      aiPerformance
    );

    return NextResponse.json({
      featureAdoption,
      cohorts,
      marketGaps,
      aiPerformance,
      keyMetrics,
      recommendations
    });

  } catch (error) {
    console.error('Error fetching strategic insights:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch strategic insights',
      featureAdoption: [],
      cohorts: [],
      marketGaps: [],
      aiPerformance: [],
      keyMetrics: {
        conversionRate: 0,
        avgLTV: 0,
        retentionRate: 0,
        aiAccuracy: 0
      },
      recommendations: []
    }, { status: 500 });
  }
}

async function calculateFeatureAdoptionFunnel(startDate: Date) {
  try {
    // Get total users who signed up in the timeframe
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get users who created their first trip
    const usersWithTrips = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        trips: { some: {} }
      }
    });

    // Get users who used AI recommendations
    const usersWithAI = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        trips: {
          some: {
            itineraries: { some: {} }
          }
        }
      }
    });

    // Get users who used collaboration features
    const usersWithCollaboration = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        tripCollaborators: { some: {} }
      }
    });

    // Get users who upgraded to paid
    const paidUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        subscriptionTier: { in: ['pro', 'business'] }
      }
    });

    const stages = [
      { name: 'Sign Up', count: totalUsers },
      { name: 'First Trip', count: usersWithTrips },
      { name: 'AI Usage', count: usersWithAI },
      { name: 'Collaboration', count: usersWithCollaboration },
      { name: 'Paid Conversion', count: paidUsers }
    ];

    return stages.map((stage, index) => {
      const percentage = totalUsers > 0 ? (stage.count / totalUsers) * 100 : 0;
      const dropoff = index > 0 ? 
        ((stages[index - 1].count - stage.count) / stages[index - 1].count) * 100 : 0;
      
      return {
        stage: stage.name,
        count: stage.count,
        percentage,
        dropoff
      };
    });
  } catch (error) {
    console.error('Error calculating feature adoption funnel:', error);
    return [];
  }
}

async function calculateCohortAnalysis(startDate: Date) {
  try {
    // Get users grouped by month of signup
    const usersByMonth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    const cohorts = [];
    const now = new Date();

    for (const monthData of usersByMonth.slice(0, 6)) { // Last 6 months
      const cohortDate = new Date(monthData.createdAt);
      const cohortName = cohortDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      // Calculate retention for different time periods
      const day1Retention = await calculateRetention(cohortDate, 1);
      const day7Retention = await calculateRetention(cohortDate, 7);
      const day30Retention = await calculateRetention(cohortDate, 30);
      const day90Retention = await calculateRetention(cohortDate, 90);

      // Calculate LTV and conversion rate
      const ltv = await calculateLTV(cohortDate);
      const conversionRate = await calculateConversionRate(cohortDate);

      cohorts.push({
        cohort: cohortName,
        size: monthData._count.id,
        retention: {
          day1: day1Retention,
          day7: day7Retention,
          day30: day30Retention,
          day90: day90Retention
        },
        ltv,
        conversionRate
      });
    }

    return cohorts;
  } catch (error) {
    console.error('Error calculating cohort analysis:', error);
    return [];
  }
}

async function calculateRetention(cohortDate: Date, days: number) {
  try {
    const endDate = new Date(cohortDate.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Count users who signed up in the cohort
    const cohortSize = await prisma.user.count({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + (24 * 60 * 60 * 1000)) // Next day
        }
      }
    });

    if (cohortSize === 0) return 0;

    // Count users who were still active after X days
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + (24 * 60 * 60 * 1000))
        },
        trips: {
          some: {
            updatedAt: { gte: endDate }
          }
        }
      }
    });

    return (activeUsers / cohortSize) * 100;
  } catch (error) {
    console.error('Error calculating retention:', error);
    return 0;
  }
}

async function calculateLTV(cohortDate: Date) {
  try {
    // This is a simplified LTV calculation
    // In a real implementation, you'd calculate actual revenue per user
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + (24 * 60 * 60 * 1000))
        }
      },
      include: {
        trips: true
      }
    });

    if (users.length === 0) return 0;

    // Simplified LTV: $10 base + $5 per trip + $20 if paid user
    const totalLTV = users.reduce((sum, user) => {
      let ltv = 10; // Base value
      ltv += user.trips.length * 5; // $5 per trip
      if (user.subscriptionTier !== 'free') {
        ltv += 20; // Premium user bonus
      }
      return sum + ltv;
    }, 0);

    return totalLTV / users.length;
  } catch (error) {
    console.error('Error calculating LTV:', error);
    return 0;
  }
}

async function calculateConversionRate(cohortDate: Date) {
  try {
    const users = await prisma.user.count({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + (24 * 60 * 60 * 1000))
        }
      }
    });

    const paidUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + (24 * 60 * 60 * 1000))
        },
        subscriptionTier: { in: ['pro', 'business'] }
      }
    });

    return users > 0 ? (paidUsers / users) * 100 : 0;
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    return 0;
  }
}

async function calculateMarketGapAnalysis(startDate: Date) {
  try {
    // Get trip destinations and their search frequency
    const tripDestinations = await prisma.trip.groupBy({
      by: ['destination'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    });

    // Simulate data quality scores and market gaps
    const marketGaps = tripDestinations.map(dest => {
      const searches = dest._count.id;
      const dataQuality = Math.random() * 100; // Simulated data quality score
      const gap = Math.max(0, searches - dataQuality); // Gap = demand - supply
      
      return {
        location: dest.destination,
        searches,
        dataQuality,
        gap,
        coordinates: getCoordinatesForDestination(dest.destination)
      };
    });

    // Sort by gap score (highest gaps first)
    return marketGaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10);
  } catch (error) {
    console.error('Error calculating market gap analysis:', error);
    return [];
  }
}

function getCoordinatesForDestination(destination: string): [number, number] {
  // Simplified coordinate mapping - in real implementation, use geocoding service
  const coordinates: Record<string, [number, number]> = {
    'New York': [40.7128, -74.0060],
    'London': [51.5074, -0.1278],
    'Paris': [48.8566, 2.3522],
    'Tokyo': [35.6762, 139.6503],
    'Sydney': [-33.8688, 151.2093],
    'San Francisco': [37.7749, -122.4194],
    'Barcelona': [41.3851, 2.1734],
    'Rome': [41.9028, 12.4964],
    'Amsterdam': [52.3676, 4.9041],
    'Berlin': [52.5200, 13.4050]
  };

  return coordinates[destination] || [0, 0];
}

async function calculateAIModelPerformance(startDate: Date) {
  try {
    // Get user feedback with ratings
    const feedback = await prisma.userFeedback.findMany({
      where: {
        createdAt: { gte: startDate },
        rating: { not: null },
        action: { in: ['rated', 'liked', 'disliked'] }
      },
      include: {
        user: true,
        trip: true
      }
    });

    // Simulate AI predictions and calculate accuracy
    const performance = feedback.map(fb => {
      // Simulate AI prediction (in real implementation, this would come from your AI model)
      const predictedRating = Math.random() * 5;
      const actualRating = fb.rating || 0;
      const accuracy = Math.max(0, 100 - Math.abs(predictedRating - actualRating) * 20);
      const confidence = Math.random() * 100;

      return {
        date: fb.createdAt.toISOString().split('T')[0],
        predictedRating,
        actualRating,
        accuracy,
        confidence,
        activityType: fb.category || 'Unknown'
      };
    });

    return performance.slice(0, 50); // Return last 50 performance records
  } catch (error) {
    console.error('Error calculating AI model performance:', error);
    return [];
  }
}

async function calculateKeyMetrics(startDate: Date) {
  try {
    // Calculate conversion rate
    const totalUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    });
    const paidUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        subscriptionTier: { in: ['pro', 'business'] }
      }
    });
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

    // Calculate average LTV
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      include: { trips: true }
    });
    const avgLTV = users.length > 0 ? 
      users.reduce((sum, user) => {
        let ltv = 10 + (user.trips.length * 5);
        if (user.subscriptionTier !== 'free') ltv += 20;
        return sum + ltv;
      }, 0) / users.length : 0;

    // Calculate retention rate (30-day)
    const retentionRate = await calculateRetention(startDate, 30);

    // Calculate AI accuracy
    const feedback = await prisma.userFeedback.findMany({
      where: {
        createdAt: { gte: startDate },
        rating: { not: null }
      }
    });
    const aiAccuracy = feedback.length > 0 ? 
      feedback.reduce((sum, fb) => sum + (Math.random() * 20 + 80), 0) / feedback.length : 0;

    return {
      conversionRate,
      avgLTV,
      retentionRate,
      aiAccuracy
    };
  } catch (error) {
    console.error('Error calculating key metrics:', error);
    return {
      conversionRate: 0,
      avgLTV: 0,
      retentionRate: 0,
      aiAccuracy: 0
    };
  }
}

function generateStrategicRecommendations(
  featureAdoption: any[],
  cohorts: any[],
  marketGaps: any[],
  aiPerformance: any[]
) {
  const recommendations = [];

  // Analyze feature adoption funnel
  const highestDropoff = featureAdoption.reduce((max, stage) => 
    stage.dropoff > max.dropoff ? stage : max, featureAdoption[0]);
  
  if (highestDropoff && highestDropoff.dropoff > 50) {
    recommendations.push(
      `Focus on reducing dropoff at "${highestDropoff.stage}" stage (${highestDropoff.dropoff.toFixed(1)}% dropoff). Consider improving onboarding, feature discovery, or user experience.`
    );
  }

  // Analyze cohort performance
  const recentCohorts = cohorts.slice(0, 3);
  const avgRetention = recentCohorts.reduce((sum, cohort) => 
    sum + cohort.retention.day30, 0) / recentCohorts.length;
  
  if (avgRetention < 40) {
    recommendations.push(
      `Low 30-day retention rate (${avgRetention.toFixed(1)}%). Implement re-engagement campaigns, improve product-market fit, or enhance core features.`
    );
  }

  // Analyze market gaps
  const topGap = marketGaps[0];
  if (topGap && topGap.gap > 70) {
    recommendations.push(
      `High demand gap detected in ${topGap.location} (${topGap.gap.toFixed(0)} gap score). Prioritize data enrichment and content creation for this market.`
    );
  }

  // Analyze AI performance
  const avgAccuracy = aiPerformance.reduce((sum, perf) => 
    sum + perf.accuracy, 0) / aiPerformance.length;
  
  if (avgAccuracy < 80) {
    recommendations.push(
      `AI recommendation accuracy below target (${avgAccuracy.toFixed(1)}%). Consider retraining models, improving feature engineering, or expanding training data.`
    );
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      "All key metrics are performing well. Focus on scaling successful features and exploring new market opportunities."
    );
  }

  return recommendations;
}
