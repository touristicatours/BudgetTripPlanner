import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface CollaborationSession {
  id: string;
  tripId: string;
  userId: string;
  sessionId: string;
  isActive: boolean;
  lastSeen: Date;
}

export interface CollaborationMessage {
  id: string;
  tripId: string;
  userId: string;
  message: string;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
  };
}

export interface TripInvite {
  id: string;
  tripId: string;
  email: string;
  token: string;
  role: string;
  status: string;
  expiresAt: Date;
}

export class CollaborationService {
  // Create a new trip with creator
  async createTrip(tripData: {
    name: string;
    description?: string;
    destination: string;
    startDate?: Date;
    endDate?: Date;
    creatorId: string;
  }) {
    const trip = await prisma.trip.create({
      data: {
        ...tripData,
        collaborators: {
          create: {
            userId: tripData.creatorId,
            role: 'creator'
          }
        }
      },
      include: {
        collaborators: {
          include: {
            user: true
          }
        }
      }
    });

    return trip;
  }

  // Invite a user to collaborate on a trip
  async inviteUser(tripId: string, email: string, role: string = 'collaborator') {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.tripInvite.create({
      data: {
        tripId,
        email,
        token,
        role,
        expiresAt
      }
    });

    return invite;
  }

  // Accept an invitation
  async acceptInvitation(token: string, userId: string) {
    const invite = await prisma.tripInvite.findUnique({
      where: { token },
      include: { trip: true }
    });

    if (!invite) {
      throw new Error('Invalid invitation token');
    }

    if (invite.status !== 'pending') {
      throw new Error('Invitation has already been used or expired');
    }

    if (invite.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.tripCollaborator.findUnique({
      where: {
        tripId_userId: {
          tripId: invite.tripId,
          userId
        }
      }
    });

    if (existingCollaborator) {
      throw new Error('User is already a collaborator on this trip');
    }

    // Add user as collaborator
    await prisma.tripCollaborator.create({
      data: {
        tripId: invite.tripId,
        userId,
        role: invite.role
      }
    });

    // Mark invitation as accepted
    await prisma.tripInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted' }
    });

    return { success: true, tripId: invite.tripId };
  }

  // Join collaboration session
  async joinSession(tripId: string, userId: string) {
    const sessionId = randomBytes(16).toString('hex');
    
    const session = await prisma.collaborationSession.create({
      data: {
        tripId,
        userId,
        sessionId,
        isActive: true
      },
      include: {
        user: true
      }
    });

    return session;
  }

  // Leave collaboration session
  async leaveSession(sessionId: string) {
    await prisma.collaborationSession.update({
      where: { sessionId },
      data: { isActive: false }
    });
  }

  // Get active collaborators for a trip
  async getActiveCollaborators(tripId: string): Promise<CollaborationUser[]> {
    const sessions = await prisma.collaborationSession.findMany({
      where: {
        tripId,
        isActive: true,
        lastSeen: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 minutes
        }
      },
      include: {
        user: true
      }
    });

    return sessions.map(session => ({
      id: session.user.id,
      name: session.user.name || 'Unknown',
      email: session.user.email,
      role: 'collaborator', // You might want to get this from trip_collaborators
      isOnline: true,
      lastSeen: session.lastSeen
    }));
  }

  // Send a collaboration message
  async sendMessage(tripId: string, userId: string, message: string) {
    const collaborationMessage = await prisma.collaborationMessage.create({
      data: {
        tripId,
        userId,
        message
      },
      include: {
        user: true
      }
    });

    return collaborationMessage;
  }

  // Get messages for a trip
  async getMessages(tripId: string, limit: number = 50) {
    const messages = await prisma.collaborationMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: true
      }
    });

    return messages.reverse(); // Return in chronological order
  }

  // Update itinerary with conflict resolution
  async updateItinerary(tripId: string, itineraryId: string, data: any, userId: string) {
    // Check for conflicts
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId }
    });

    if (existingItinerary) {
      // Check if someone else is editing
      const activeSessions = await this.getActiveCollaborators(tripId);
      const otherActiveUsers = activeSessions.filter(user => user.id !== userId);

      if (otherActiveUsers.length > 0) {
        // Create conflict record
        await prisma.collaborationConflict.create({
          data: {
            tripId,
            itineraryId,
            userId,
            conflictType: 'activity_edit',
            description: `User ${userId} is editing itinerary while others are online`
          }
        });
      }
    }

    // Update itinerary
    const itinerary = await prisma.itinerary.upsert({
      where: { id: itineraryId },
      update: {
        data: JSON.stringify(data),
        version: {
          increment: 1
        }
      },
      create: {
        tripId,
        name: 'Main Itinerary',
        data: JSON.stringify(data),
        version: 1
      }
    });

    return itinerary;
  }

  // Resolve conflict
  async resolveConflict(conflictId: string, resolvedBy: string, resolution: string) {
    await prisma.collaborationConflict.update({
      where: { id: conflictId },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date()
      }
    });
  }

  // Get trip collaborators
  async getTripCollaborators(tripId: string) {
    const collaborators = await prisma.tripCollaborator.findMany({
      where: { tripId },
      include: {
        user: true
      }
    });

    return collaborators.map(collaborator => ({
      id: collaborator.user.id,
      name: collaborator.user.name || 'Unknown',
      email: collaborator.user.email,
      role: collaborator.role,
      joinedAt: collaborator.joinedAt
    }));
  }

  // Check if user has access to trip
  async hasAccess(tripId: string, userId: string): Promise<boolean> {
    const collaborator = await prisma.tripCollaborator.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId
        }
      }
    });

    return !!collaborator;
  }

  // Get user's role in trip
  async getUserRole(tripId: string, userId: string): Promise<string | null> {
    const collaborator = await prisma.tripCollaborator.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId
        }
      }
    });

    return collaborator?.role || null;
  }

  // Update last seen for a session
  async updateLastSeen(sessionId: string) {
    await prisma.collaborationSession.update({
      where: { sessionId },
      data: { lastSeen: new Date() }
    });
  }

  // Get unresolved conflicts for a trip
  async getUnresolvedConflicts(tripId: string) {
    const conflicts = await prisma.collaborationConflict.findMany({
      where: {
        tripId,
        resolved: false
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return conflicts;
  }
}

export const collaborationService = new CollaborationService();
