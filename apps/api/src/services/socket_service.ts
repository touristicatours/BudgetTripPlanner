import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { collaborationService } from './collaboration_service';

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  tripId: string;
  sessionId: string;
}

export class SocketService {
  private io: SocketIOServer;
  private userSessions: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join trip room
      socket.on('join_trip', async (data: { tripId: string; userId: string; userName: string; userEmail: string }) => {
        try {
          // Check if user has access to trip
          const hasAccess = await collaborationService.hasAccess(data.tripId, data.userId);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to this trip' });
            return;
          }

          // Join collaboration session
          const session = await collaborationService.joinSession(data.tripId, data.userId);
          
          // Store user session
          const user: SocketUser = {
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            tripId: data.tripId,
            sessionId: session.sessionId
          };
          
          this.userSessions.set(socket.id, user);
          
          // Join socket room
          socket.join(data.tripId);
          
          // Update last seen
          await this.updateLastSeen(session.sessionId);
          
          // Notify others in the trip
          socket.to(data.tripId).emit('user_joined', {
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail
          });
          
          // Send current active users to the new user
          const activeUsers = await collaborationService.getActiveCollaborators(data.tripId);
          socket.emit('active_users', activeUsers);
          
          console.log(`User ${data.userName} joined trip ${data.tripId}`);
        } catch (error) {
          console.error('Error joining trip:', error);
          socket.emit('error', { message: 'Failed to join trip' });
        }
      });

      // Leave trip
      socket.on('leave_trip', async () => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          try {
            await collaborationService.leaveSession(user.sessionId);
            socket.leave(user.tripId);
            
            // Notify others
            socket.to(user.tripId).emit('user_left', {
              userId: user.id,
              userName: user.name
            });
            
            this.userSessions.delete(socket.id);
            console.log(`User ${user.name} left trip ${user.tripId}`);
          } catch (error) {
            console.error('Error leaving trip:', error);
          }
        }
      });

      // Send message
      socket.on('send_message', async (data: { message: string }) => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          try {
            const message = await collaborationService.sendMessage(user.tripId, user.id, data.message);
            
            // Broadcast to all users in the trip
            this.io.to(user.tripId).emit('new_message', {
              id: message.id,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              message: data.message,
              createdAt: message.createdAt
            });
            
            // Update last seen
            await this.updateLastSeen(user.sessionId);
          } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
          }
        }
      });

      // Update itinerary
      socket.on('update_itinerary', async (data: { itineraryId: string; itineraryData: any }) => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          try {
            const itinerary = await collaborationService.updateItinerary(
              user.tripId,
              data.itineraryId,
              data.itineraryData,
              user.id
            );
            
            // Broadcast to all users in the trip
            socket.to(user.tripId).emit('itinerary_updated', {
              itineraryId: data.itineraryId,
              itineraryData: data.itineraryData,
              updatedBy: {
                id: user.id,
                name: user.name
              },
              version: itinerary.version,
              updatedAt: itinerary.updatedAt
            });
            
            // Update last seen
            await this.updateLastSeen(user.sessionId);
          } catch (error) {
            console.error('Error updating itinerary:', error);
            socket.emit('error', { message: 'Failed to update itinerary' });
          }
        }
      });

      // Activity feedback
      socket.on('activity_feedback', async (data: { activityId: string; feedback: 'like' | 'dislike' }) => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          try {
            // Broadcast to all users in the trip
            socket.to(user.tripId).emit('activity_feedback_received', {
              activityId: data.activityId,
              feedback: data.feedback,
              userId: user.id,
              userName: user.name
            });
            
            // Update last seen
            await this.updateLastSeen(user.sessionId);
          } catch (error) {
            console.error('Error processing activity feedback:', error);
          }
        }
      });

      // Typing indicator
      socket.on('typing_start', () => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          socket.to(user.tripId).emit('user_typing', {
            userId: user.id,
            userName: user.name
          });
        }
      });

      socket.on('typing_stop', () => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          socket.to(user.tripId).emit('user_stopped_typing', {
            userId: user.id
          });
        }
      });

      // Heartbeat to keep session active
      socket.on('heartbeat', async () => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          await this.updateLastSeen(user.sessionId);
        }
      });

      // Disconnect
      socket.on('disconnect', async () => {
        const user = this.userSessions.get(socket.id);
        if (user) {
          try {
            await collaborationService.leaveSession(user.sessionId);
            socket.to(user.tripId).emit('user_left', {
              userId: user.id,
              userName: user.name
            });
            
            this.userSessions.delete(socket.id);
            console.log(`User ${user.name} disconnected from trip ${user.tripId}`);
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      });
    });
  }

  private async updateLastSeen(sessionId: string) {
    try {
      await collaborationService.updateLastSeen(sessionId);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }

  // Get active users for a trip
  async getActiveUsers(tripId: string) {
    return await collaborationService.getActiveCollaborators(tripId);
  }

  // Send notification to trip
  sendNotification(tripId: string, notification: any) {
    this.io.to(tripId).emit('notification', notification);
  }

  // Send conflict resolution request
  sendConflictResolution(tripId: string, conflict: any) {
    this.io.to(tripId).emit('conflict_resolution_required', conflict);
  }
}
