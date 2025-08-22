import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's feedback history
    const userFeedback = await prisma.userFeedback.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Simulate profile evolution based on feedback
    // In a real implementation, this would come from the ML feedback analyzer
    const profileEvolution = simulateProfileEvolution(userId, userFeedback);

    return NextResponse.json(profileEvolution);

  } catch (error) {
    console.error('Error fetching profile evolution:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile evolution',
      userId: '',
      changes: [],
      currentProfile: {}
    }, { status: 500 });
  }
}

function simulateProfileEvolution(userId: string, feedback: any[]) {
  // Simulate interest categories
  const interestCategories = ['art', 'culture', 'food', 'nature', 'shopping', 'entertainment', 'sports', 'relaxation'];
  
  // Initialize base profile
  let currentProfile: Record<string, number> = {};
  interestCategories.forEach(interest => {
    currentProfile[interest] = Math.random() * 0.5 + 0.5; // Random base scores
  });

  const changes: Array<{
    timestamp: string;
    interest: string;
    oldValue: number;
    newValue: number;
    change: number;
    confidence: number;
  }> = [];

  // Simulate changes based on feedback
  feedback.forEach((feedbackItem, index) => {
    const timestamp = new Date(feedbackItem.createdAt);
    timestamp.setHours(timestamp.getHours() + index); // Spread out changes

    // Map activity categories to interests
    const categoryToInterests: Record<string, string[]> = {
      'museum': ['art', 'culture'],
      'restaurant': ['food'],
      'park': ['nature', 'relaxation'],
      'shopping_mall': ['shopping'],
      'amusement_park': ['entertainment'],
      'sports_facility': ['sports'],
      'spa': ['relaxation'],
      'art_gallery': ['art', 'culture']
    };

    const interests = categoryToInterests[feedbackItem.category || ''] || ['culture'];
    
    interests.forEach(interest => {
      if (currentProfile[interest] !== undefined) {
        const oldValue = currentProfile[interest];
        const change = feedbackItem.action === 'liked' ? 0.1 : -0.15;
        const newValue = Math.max(0, Math.min(1, oldValue + change));
        
        changes.push({
          timestamp: timestamp.toISOString(),
          interest,
          oldValue,
          newValue,
          change,
          confidence: Math.random() * 0.3 + 0.7 // Random confidence
        });

        currentProfile[interest] = newValue;
      }
    });
  });

  return {
    userId,
    changes: changes.slice(-20), // Last 20 changes
    currentProfile
  };
}
