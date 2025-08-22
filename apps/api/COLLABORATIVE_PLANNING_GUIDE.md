# Collaborative Planning System Guide

## Overview

The Collaborative Planning System transforms TripWeaver from a solo planning tool into a social planning experience for groups. This system enables multiple users to collaborate on trip planning in real-time, with features like live chat, user presence, conflict resolution, and invitation management.

## Key Features

### 🎯 **Core Functionality**
- **Multi-User Trip Creation**: Create trips with multiple collaborators
- **Real-Time Collaboration**: Live updates across all connected users
- **Invitation System**: Invite users via email with unique tokens
- **Role-Based Access**: Creator, Collaborator, and Viewer roles
- **Live Chat**: Real-time messaging between collaborators
- **User Presence**: See who's currently online and active
- **Conflict Resolution**: Handle simultaneous edits gracefully

### 🔧 **Technical Features**
- **Socket.IO Integration**: Real-time bidirectional communication
- **Database Relationships**: Proper user-trip-collaborator associations
- **Session Management**: Track active collaboration sessions
- **Message Persistence**: Store and retrieve collaboration messages
- **Access Control**: Secure trip access with proper permissions

## Architecture

### Database Models

#### Trip Model
```typescript
model Trip {
  id          String   @id @default(cuid())
  name        String
  description String?
  destination String
  startDate   DateTime?
  endDate     DateTime?
  shareToken  String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  creatorId   String
  creator     User     @relation("TripCreator", fields: [creatorId], references: [id])
  collaborators TripCollaborator[]
  itineraries Itinerary[]
  invites     TripInvite[]
  sessions    CollaborationSession[]
  messages    CollaborationMessage[]
  conflicts   CollaborationConflict[]
}
```

#### TripCollaborator Model
```typescript
model TripCollaborator {
  id        String   @id @default(cuid())
  tripId    String
  userId    String
  role      String   @default("collaborator") // "creator", "collaborator", "viewer"
  joinedAt  DateTime @default(now())
  
  // Relationships
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([tripId, userId])
}
```

#### CollaborationSession Model
```typescript
model CollaborationSession {
  id        String   @id @default(cuid())
  tripId    String
  userId    String
  sessionId String   @unique
  isActive  Boolean  @default(true)
  lastSeen  DateTime @default(now())
  createdAt DateTime @default(now())
  
  // Relationships
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Services

#### CollaborationService
Handles all collaboration-related business logic:

- **Trip Management**: Create, update, and manage collaborative trips
- **Invitation System**: Send and manage user invitations
- **Session Management**: Handle user sessions and presence
- **Message Handling**: Send and retrieve collaboration messages
- **Access Control**: Verify user permissions and roles
- **Conflict Resolution**: Detect and manage editing conflicts

#### SocketService
Manages real-time communication:

- **Connection Management**: Handle Socket.IO connections
- **Room Management**: Organize users into trip-specific rooms
- **Event Broadcasting**: Send real-time updates to all collaborators
- **Presence Tracking**: Monitor user online/offline status
- **Typing Indicators**: Show when users are typing

## API Endpoints

### Trip Management
```
POST   /v1/collaboration/trips                    # Create new collaborative trip
GET    /v1/collaboration/trips/:tripId            # Get trip details
```

### Invitation System
```
POST   /v1/collaboration/invite                   # Send invitation
POST   /v1/collaboration/accept-invitation        # Accept invitation
```

### Collaboration Features
```
GET    /v1/collaboration/trips/:tripId/collaborators  # Get active collaborators
GET    /v1/collaboration/trips/:tripId/messages       # Get collaboration messages
POST   /v1/collaboration/messages                     # Send message
POST   /v1/collaboration/itinerary                    # Update itinerary
```

### Conflict Management
```
GET    /v1/collaboration/trips/:tripId/conflicts      # Get unresolved conflicts
POST   /v1/collaboration/conflicts/:conflictId/resolve # Resolve conflict
```

## Socket.IO Events

### Client to Server
```typescript
// Join trip collaboration
socket.emit('join_trip', {
  tripId: string,
  userId: string,
  userName: string,
  userEmail: string
});

// Leave trip
socket.emit('leave_trip');

// Send message
socket.emit('send_message', {
  message: string
});

// Update itinerary
socket.emit('update_itinerary', {
  itineraryId: string,
  itineraryData: any
});

// Activity feedback
socket.emit('activity_feedback', {
  activityId: string,
  feedback: 'like' | 'dislike'
});

// Typing indicators
socket.emit('typing_start');
socket.emit('typing_stop');

// Heartbeat
socket.emit('heartbeat');
```

### Server to Client
```typescript
// User joined
socket.on('user_joined', {
  userId: string,
  userName: string,
  userEmail: string
});

// User left
socket.on('user_left', {
  userId: string,
  userName: string
});

// New message
socket.on('new_message', {
  id: string,
  userId: string,
  userName: string,
  userEmail: string,
  message: string,
  createdAt: Date
});

// Itinerary updated
socket.on('itinerary_updated', {
  itineraryId: string,
  itineraryData: any,
  updatedBy: {
    id: string,
    name: string
  },
  version: number,
  updatedAt: Date
});

// Typing indicators
socket.on('user_typing', {
  userId: string,
  userName: string
});

socket.on('user_stopped_typing', {
  userId: string
});

// Active users
socket.on('active_users', CollaborationUser[]);
```

## Frontend Components

### CollaborationPanel
Real-time collaboration interface with:
- Live chat functionality
- User presence indicators
- Typing indicators
- Message history
- Connection status

### InviteCollaborators
Invitation management interface with:
- Email invitation form
- Role selection (Collaborator/Viewer)
- Invite status tracking
- Copy invite link functionality

## Usage Examples

### Creating a Collaborative Trip
```typescript
const trip = await collaborationService.createTrip({
  name: 'Paris Adventure 2024',
  description: 'A collaborative trip to Paris',
  destination: 'Paris, France',
  startDate: new Date('2024-06-15'),
  endDate: new Date('2024-06-22'),
  creatorId: 'user-123'
});
```

### Inviting Collaborators
```typescript
const invite = await collaborationService.inviteUser(
  tripId,
  'bob@example.com',
  'collaborator'
);
```

### Joining Collaboration Session
```typescript
const session = await collaborationService.joinSession(tripId, userId);
```

### Sending Messages
```typescript
const message = await collaborationService.sendMessage(
  tripId,
  userId,
  'Hello everyone! Welcome to our trip planning!'
);
```

## Security Considerations

### Access Control
- All endpoints verify user permissions before allowing access
- Trip collaborators are validated on every request
- Session tokens are validated for real-time connections

### Data Validation
- Input validation on all API endpoints
- SQL injection prevention through Prisma ORM
- XSS protection in message content

### Rate Limiting
- Message sending rate limits
- Invitation sending limits
- Session connection limits

## Performance Optimizations

### Database
- Indexed foreign keys for fast lookups
- Efficient queries with proper joins
- Connection pooling for database connections

### Real-Time Communication
- Room-based message broadcasting
- Efficient user presence tracking
- Heartbeat mechanism for connection health

### Caching
- User session caching
- Trip data caching for frequently accessed trips
- Message history caching

## Testing

### Test Coverage
- Unit tests for all service methods
- Integration tests for API endpoints
- Socket.IO event testing
- Database relationship testing

### Test Scripts
```bash
# Run collaboration system tests
node test-collaboration.js

# Run specific test suites
npm test -- --grep "collaboration"
```

## Deployment

### Environment Variables
```bash
# Database
DATABASE_URL="file:./dev.db"

# API Configuration
API_BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Socket.IO Configuration
SOCKET_CORS_ORIGIN="http://localhost:3000"
```

### Production Considerations
- Use Redis for Socket.IO adapter in production
- Implement proper SSL/TLS for WebSocket connections
- Set up monitoring for collaboration sessions
- Configure proper logging for debugging

## Troubleshooting

### Common Issues

#### Connection Problems
- Check Socket.IO server is running
- Verify CORS configuration
- Check network connectivity

#### Permission Errors
- Verify user is a trip collaborator
- Check user role permissions
- Validate session tokens

#### Real-Time Issues
- Check Socket.IO event handlers
- Verify room membership
- Monitor connection health

### Debug Mode
Enable debug logging:
```typescript
// In SocketService
this.io = new SocketIOServer(server, {
  cors: { origin: process.env.FRONTEND_URL },
  debug: process.env.NODE_ENV === 'development'
});
```

## Future Enhancements

### Planned Features
- **File Sharing**: Share documents and images in chat
- **Voice/Video Calls**: Integrated communication
- **Activity Voting**: Vote on proposed activities
- **Budget Tracking**: Collaborative budget management
- **Calendar Integration**: Sync with external calendars
- **Mobile App**: Native mobile collaboration

### Technical Improvements
- **WebRTC Integration**: Peer-to-peer communication
- **Offline Support**: Work offline, sync when online
- **Advanced Conflict Resolution**: Merge strategies for conflicts
- **Performance Monitoring**: Real-time performance metrics
- **Analytics**: Collaboration usage analytics

## Conclusion

The Collaborative Planning System provides a comprehensive solution for group travel planning, combining real-time communication, user management, and itinerary collaboration in a secure and scalable architecture. The system is designed to be extensible and can accommodate future enhancements while maintaining performance and security standards.
