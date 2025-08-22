import { NextRequest, NextResponse } from "next/server";
import { RecommendationEngine } from "../../../../api/ai/recommendation_engine";

const recommendationEngine = new RecommendationEngine();

export async function POST(request: NextRequest) {
  try {
    const { userProfile, location, limit = 10, userId } = await request.json();

    if (!userProfile || !location) {
      return NextResponse.json(
        { error: 'User profile and location are required' },
        { status: 400 }
      );
    }

    // Get collective recommendations
    const recommendations = await recommendationEngine.get_collective_recommendations(
      userProfile,
      location,
      limit
    );

    // If user ID is provided, get personalized recommendations (blended)
    let personalizedRecommendations = [];
    if (userId) {
      personalizedRecommendations = await recommendationEngine.get_personalized_recommendations(
        userId,
        location,
        userProfile,
        limit
      );
    }

    return NextResponse.json({
      success: true,
      collectiveRecommendations: recommendations,
      personalizedRecommendations: personalizedRecommendations,
      message: 'Collective intelligence recommendations generated successfully'
    });

  } catch (error) {
    console.error('Error getting collective recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get collective recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!activityId || !location) {
      return NextResponse.json(
        { error: 'Activity ID and location are required' },
        { status: 400 }
      );
    }

    // Get correlated activities
    const correlatedActivities = await recommendationEngine.get_activity_correlations(
      activityId,
      location,
      limit
    );

    return NextResponse.json({
      success: true,
      correlatedActivities,
      message: 'Activity correlations retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting activity correlations:', error);
    return NextResponse.json(
      { error: 'Failed to get activity correlations' },
      { status: 500 }
    );
  }
}
