import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get feedback statistics from the database
    const allFeedback = await prisma.userFeedback.findMany({
      where: {
        action: { in: ['liked', 'disliked'] }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const totalFeedback = allFeedback.length;
    const positiveFeedback = allFeedback.filter(f => f.action === 'liked');
    const negativeFeedback = allFeedback.filter(f => f.action === 'disliked');
    const positiveRate = totalFeedback > 0 ? (positiveFeedback.length / totalFeedback) * 100 : 0;

    // Group by activity for positive feedback
    const positiveStats = positiveFeedback.reduce((acc, feedback) => {
      const key = feedback.activityName;
      if (!acc[key]) {
        acc[key] = {
          activityName: feedback.activityName,
          category: feedback.category || 'Unknown',
          count: 0,
          percentage: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);

    // Group by activity for negative feedback
    const negativeStats = negativeFeedback.reduce((acc, feedback) => {
      const key = feedback.activityName;
      if (!acc[key]) {
        acc[key] = {
          activityName: feedback.activityName,
          category: feedback.category || 'Unknown',
          count: 0,
          percentage: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate percentages and sort
    const positiveArray = Object.values(positiveStats)
      .map((stat: any) => ({
        ...stat,
        percentage: (stat.count / positiveFeedback.length) * 100
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    const negativeArray = Object.values(negativeStats)
      .map((stat: any) => ({
        ...stat,
        percentage: (stat.count / negativeFeedback.length) * 100
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      positive: positiveArray,
      negative: negativeArray,
      totalFeedback,
      positiveRate
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch feedback statistics',
      positive: [],
      negative: [],
      totalFeedback: 0,
      positiveRate: 0
    }, { status: 500 });
  }
}
