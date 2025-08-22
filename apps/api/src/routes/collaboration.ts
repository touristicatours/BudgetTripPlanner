import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { collaborationService } from '../services/collaboration_service';

interface CreateTripRequest {
  Body: {
    name: string;
    description?: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    creatorId: string;
  };
}

interface InviteUserRequest {
  Body: {
    tripId: string;
    email: string;
    role?: string;
  };
}

interface AcceptInvitationRequest {
  Body: {
    token: string;
    userId: string;
  };
}

interface UpdateItineraryRequest {
  Body: {
    tripId: string;
    itineraryId: string;
    itineraryData: any;
    userId: string;
  };
}

interface SendMessageRequest {
  Body: {
    tripId: string;
    message: string;
    userId: string;
  };
}

export async function collaborationRoutes(fastify: FastifyInstance) {
  // Create a new collaborative trip
  fastify.post<CreateTripRequest>('/v1/collaboration/trips', async (request, reply) => {
    try {
      const { name, description, destination, startDate, endDate, creatorId } = request.body;

      if (!name || !destination || !creatorId) {
        return reply.status(400).send({
          status: 'error',
          message: 'name, destination, and creatorId are required'
        });
      }

      const trip = await collaborationService.createTrip({
        name,
        description,
        destination,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        creatorId
      });

      return reply.send({
        status: 'success',
        trip
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get trip details
  fastify.get('/v1/collaboration/trips/:tripId', async (request, reply) => {
    try {
      const { tripId } = request.params as { tripId: string };
      const { userId } = request.query as { userId: string };

      if (!userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId is required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      // Get trip with collaborators
      const collaborators = await collaborationService.getTripCollaborators(tripId);
      const userRole = await collaborationService.getUserRole(tripId, userId);

      return reply.send({
        status: 'success',
        trip: {
          id: tripId,
          collaborators,
          userRole
        }
      });
    } catch (error) {
      console.error('Error getting trip:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Invite user to trip
  fastify.post<InviteUserRequest>('/v1/collaboration/invite', async (request, reply) => {
    try {
      const { tripId, email, role } = request.body;

      if (!tripId || !email) {
        return reply.status(400).send({
          status: 'error',
          message: 'tripId and email are required'
        });
      }

      const invite = await collaborationService.inviteUser(tripId, email, role);

      return reply.send({
        status: 'success',
        invite: {
          id: invite.id,
          email: invite.email,
          token: invite.token,
          expiresAt: invite.expiresAt
        }
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Accept invitation
  fastify.post<AcceptInvitationRequest>('/v1/collaboration/accept-invitation', async (request, reply) => {
    try {
      const { token, userId } = request.body;

      if (!token || !userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'token and userId are required'
        });
      }

      const result = await collaborationService.acceptInvitation(token, userId);

      return reply.send({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return reply.status(400).send({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to accept invitation'
      });
    }
  });

  // Get active collaborators
  fastify.get('/v1/collaboration/trips/:tripId/collaborators', async (request, reply) => {
    try {
      const { tripId } = request.params as { tripId: string };
      const { userId } = request.query as { userId: string };

      if (!userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId is required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      const collaborators = await collaborationService.getActiveCollaborators(tripId);

      return reply.send({
        status: 'success',
        collaborators
      });
    } catch (error) {
      console.error('Error getting collaborators:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get messages
  fastify.get('/v1/collaboration/trips/:tripId/messages', async (request, reply) => {
    try {
      const { tripId } = request.params as { tripId: string };
      const { userId, limit } = request.query as { userId: string; limit?: string };

      if (!userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId is required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      const messages = await collaborationService.getMessages(tripId, limit ? parseInt(limit) : 50);

      return reply.send({
        status: 'success',
        messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Send message (for non-Socket.IO fallback)
  fastify.post<SendMessageRequest>('/v1/collaboration/messages', async (request, reply) => {
    try {
      const { tripId, message, userId } = request.body;

      if (!tripId || !message || !userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'tripId, message, and userId are required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      const collaborationMessage = await collaborationService.sendMessage(tripId, userId, message);

      return reply.send({
        status: 'success',
        message: collaborationMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Update itinerary
  fastify.post<UpdateItineraryRequest>('/v1/collaboration/itinerary', async (request, reply) => {
    try {
      const { tripId, itineraryId, itineraryData, userId } = request.body;

      if (!tripId || !itineraryId || !itineraryData || !userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'tripId, itineraryId, itineraryData, and userId are required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      const itinerary = await collaborationService.updateItinerary(tripId, itineraryId, itineraryData, userId);

      return reply.send({
        status: 'success',
        itinerary
      });
    } catch (error) {
      console.error('Error updating itinerary:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get conflicts
  fastify.get('/v1/collaboration/trips/:tripId/conflicts', async (request, reply) => {
    try {
      const { tripId } = request.params as { tripId: string };
      const { userId } = request.query as { userId: string };

      if (!userId) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId is required'
        });
      }

      // Check access
      const hasAccess = await collaborationService.hasAccess(tripId, userId);
      if (!hasAccess) {
        return reply.status(403).send({
          status: 'error',
          message: 'Access denied'
        });
      }

      // Get unresolved conflicts
      const conflicts = await collaborationService.getUnresolvedConflicts(tripId);

      return reply.send({
        status: 'success',
        conflicts
      });
    } catch (error) {
      console.error('Error getting conflicts:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Resolve conflict
  fastify.post('/v1/collaboration/conflicts/:conflictId/resolve', async (request, reply) => {
    try {
      const { conflictId } = request.params as { conflictId: string };
      const { resolvedBy, resolution } = request.body as { resolvedBy: string; resolution: string };

      if (!resolvedBy || !resolution) {
        return reply.status(400).send({
          status: 'error',
          message: 'resolvedBy and resolution are required'
        });
      }

      await collaborationService.resolveConflict(conflictId, resolvedBy, resolution);

      return reply.send({
        status: 'success',
        message: 'Conflict resolved'
      });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });
}
