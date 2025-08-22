'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InviteCollaboratorsProps {
  tripId: string;
  onInviteSent?: (invite: any) => void;
}

interface Invite {
  id: string;
  email: string;
  token: string;
  role: string;
  status: string;
  expiresAt: Date;
}

export default function InviteCollaborators({ tripId, onInviteSent }: InviteCollaboratorsProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('collaborator');
  const [isLoading, setIsLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState('');

  const sendInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/collaboration/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          email: email.trim(),
          role
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const newInvite = data.invite;
        setInvites(prev => [...prev, newInvite]);
        setEmail('');
        setRole('collaborator');
        
        if (onInviteSent) {
          onInviteSent(newInvite);
        }
      } else {
        setError(data.message || 'Failed to send invite');
      }
    } catch (error) {
      setError('Failed to send invite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/join-trip?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    // You could add a toast notification here
  };

  const formatExpiryDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Collaborators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collaborator">Collaborator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            onClick={sendInvite}
            disabled={isLoading || !email.trim()}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>

        {/* Invites List */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Recent Invites</h3>
            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{invite.email}</span>
                      <Badge className={`text-xs ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Role: {invite.role} • Expires: {formatExpiryDate(invite.expiresAt)}
                    </div>
                  </div>
                  <Button
                    onClick={() => copyInviteLink(invite.token)}
                    variant="outline"
                    size="sm"
                  >
                    Copy Link
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Collaborators can edit the itinerary and chat</li>
            <li>• Viewers can only view and comment</li>
            <li>• Invites expire in 7 days</li>
            <li>• Share the invite link with your travel companions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
