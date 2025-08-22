import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get users who have provided feedback
    const usersWithFeedback = await prisma.userFeedback.groupBy({
      by: ['userId'],
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      }
    });

    // Get user details for users with feedback
    const userIds = usersWithFeedback.map(u => u.userId);
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Add users without feedback (for demo purposes)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 20 // Limit to 20 users for performance
    });

    // Merge and deduplicate
    const userMap = new Map();
    allUsers.forEach(user => {
      userMap.set(user.id, user);
    });

    const uniqueUsers = Array.from(userMap.values()).map(user => ({
      userId: user.id,
      name: user.name || `User ${user.id.slice(0, 8)}`,
      email: user.email
    }));

    return NextResponse.json({
      users: uniqueUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      users: []
    }, { status: 500 });
  }
}
