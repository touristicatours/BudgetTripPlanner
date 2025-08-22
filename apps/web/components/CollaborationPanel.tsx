'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { io, Socket } from 'socket.io-client';

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface CollaborationMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: Date;
}

interface CollaborationPanelProps {
  tripId: string;
  userId: string;
  userName: string;
  userEmail: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CollaborationPanel({
  tripId,
  userId,
  userName,
  userEmail,
  isOpen,
  onToggle
}: CollaborationPanelProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen) return;

    // Connect to Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join trip room
    newSocket.emit('join_trip', {
      tripId,
      userId,
      userName,
      userEmail
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to collaboration server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from collaboration server');
    });

    newSocket.on('active_users', (users: CollaborationUser[]) => {
      setActiveUsers(users);
    });

    newSocket.on('user_joined', (user: { userId: string; userName: string; userEmail: string }) => {
      setActiveUsers(prev => [...prev, {
        id: user.userId,
        name: user.userName,
        email: user.userEmail,
        role: 'collaborator',
        isOnline: true,
        lastSeen: new Date()
      }]);
    });

    newSocket.on('user_left', (user: { userId: string; userName: string }) => {
      setActiveUsers(prev => prev.filter(u => u.id !== user.userId));
    });

    newSocket.on('new_message', (message: CollaborationMessage) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', (user: { userId: string; userName: string }) => {
      setTypingUsers(prev => [...prev.filter(id => id !== user.userId), user.userId]);
    });

    newSocket.on('user_stopped_typing', (user: { userId: string }) => {
      setTypingUsers(prev => prev.filter(id => id !== user.userId));
    });

    newSocket.on('itinerary_updated', (data: any) => {
      // Handle itinerary updates
      console.log('Itinerary updated by:', data.updatedBy.name);
    });

    newSocket.on('activity_feedback_received', (data: any) => {
      // Handle activity feedback
      console.log('Activity feedback:', data);
    });

    // Load existing messages
    loadMessages();

    // Set up heartbeat
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds

    return () => {
      newSocket.emit('leave_trip');
      newSocket.disconnect();
      clearInterval(heartbeatInterval);
    };
  }, [isOpen, tripId, userId, userName, userEmail]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/collaboration/trips/${tripId}/messages?userId=${userId}&limit=50`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', { message: newMessage });
    setNewMessage('');
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start');
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop');
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0"
        variant="default"
      >
        💬
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Collaboration</CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
          </div>
          
          {/* Active Users */}
          <div className="flex flex-wrap gap-1">
            {activeUsers.map(user => (
              <Badge key={user.id} variant="secondary" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                {user.name}
              </Badge>
            ))}
          </div>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="text-xs text-gray-500 italic">
              {typingUsers.length === 1 
                ? `${activeUsers.find(u => u.id === typingUsers[0])?.name || 'Someone'} is typing...`
                : 'Multiple people are typing...'
              }
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-2">
            {messages.map(message => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {message.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2 mt-1">
                  {message.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
