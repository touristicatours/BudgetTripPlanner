import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FeedbackData {
  tripId: string;
  activityId: string;
  feedback: 'positive' | 'negative';
  timestamp: string;
  userAgent?: string;
  ip?: string;
  activityName?: string;
  category?: string;
  priceLevel?: number;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json();
    const { tripId, activityId, feedback, timestamp, activityName, category, priceLevel, metadata } = body;

    // Validate required fields
    if (!tripId || !activityId || !feedback || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: tripId, activityId, feedback, timestamp" },
        { status: 400 }
      );
    }

    if (!['positive', 'negative'].includes(feedback)) {
      return NextResponse.json(
        { error: "Feedback must be 'positive' or 'negative'" },
        { status: 400 }
      );
    }

    // Get additional context
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Get trip to find user ID
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true }
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Map feedback to action
    const action = feedback === 'positive' ? 'liked' : 'disliked';

    // Create feedback record in database
    const feedbackRecord = await prisma.userFeedback.create({
      data: {
        userId: trip.ownerId || 'anonymous',
        tripId,
        activityId,
        activityName: activityName || 'Unknown Activity',
        action,
        category,
        priceLevel,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Log the feedback for analytics
    console.log('📊 User Feedback Received:', {
      tripId,
      activityId,
      feedback,
      timestamp,
      userAgent: userAgent.substring(0, 100), // Truncate for logging
      ip: ip.substring(0, 15) // Truncate for logging
    });

    // Optional: Send feedback to ML engine for learning
    try {
      await sendFeedbackToMLEngine(feedbackRecord);
    } catch (mlError) {
      console.warn('Failed to send feedback to ML engine:', mlError);
      // Don't fail the request if ML engine is unavailable
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: {
        id: feedbackRecord.id,
        tripId,
        activityId,
        feedback,
        timestamp
      }
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { 
        error: "Failed to process feedback",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Send feedback to ML engine for potential model updates
async function sendFeedbackToMLEngine(feedbackRecord: any) {
  try {
    // In production, this would send feedback to your ML pipeline
    // for model retraining or online learning
    const mlEndpoint = process.env.ML_FEEDBACK_ENDPOINT;
    
    if (mlEndpoint) {
      const response = await fetch(mlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_feedback',
          data: feedbackRecord,
          model_version: '1.0.0'
        })
      });
      
      if (!response.ok) {
        throw new Error(`ML engine responded with status: ${response.status}`);
      }
      
      console.log('🤖 Feedback sent to ML engine for learning');
    }
  } catch (error) {
    console.error('Error sending feedback to ML engine:', error);
    throw error;
  }
}

// GET endpoint to retrieve feedback statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    const activityId = searchParams.get('activityId');
    const userId = searchParams.get('userId');

    if (!tripId && !userId) {
      return NextResponse.json(
        { error: "Either tripId or userId parameter is required" },
        { status: 400 }
      );
    }

    // Query feedback from database
    const whereClause: any = {};
    if (tripId) whereClause.tripId = tripId;
    if (activityId) whereClause.activityId = activityId;
    if (userId) whereClause.userId = userId;

    const feedback = await prisma.userFeedback.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalFeedback = feedback.length;
    const positiveFeedback = feedback.filter(f => f.action === 'liked').length;
    const negativeFeedback = feedback.filter(f => f.action === 'disliked').length;
    const positiveRate = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;

    const stats = {
      tripId,
      activityId,
      userId,
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      positiveRate: Math.round(positiveRate * 10) / 10,
      lastUpdated: feedback.length > 0 ? feedback[0].createdAt.toISOString() : new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('Error retrieving feedback statistics:', error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback statistics" },
      { status: 500 }
    );
  }
}
