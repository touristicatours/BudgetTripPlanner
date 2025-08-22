import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Button, Input, Alert, LoadingSpinner } from '../../../components/ui/Kit';

export default function JoinTripPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    fetch(`http://localhost:4000/api/invites/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Invite not found or expired');
        return r.json();
      })
      .then((d) => {
        setSnapshot(d.trip);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [slug]);

  const handleJoin = async () => {
    if (!snapshot || !participantName.trim()) return;
    
    setJoining(true);
    try {
      // Create a new trip based on the snapshot
      const newTrip = {
        id: Date.now().toString(),
        name: snapshot.name,
        destination: snapshot.destination,
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        travelers: snapshot.travelers || 1,
        budget: snapshot.budget,
        description: snapshot.description || '',
        participants: [...(snapshot.participants || []), participantName.trim()],
        selectedItems: snapshot.selectedItems || {},
        createdAt: new Date().toISOString(),
        status: 'planning',
        joinedFrom: slug
      };

      // Save to localStorage
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      trips.unshift(newTrip);
      localStorage.setItem('trips', JSON.stringify(trips));

      // Redirect to the new trip
      router.replace(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error('Error joining trip:', error);
      alert('Failed to join trip. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading trip invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitation Not Found</h2>
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
            <p className="text-gray-600 mb-6">
              This invitation link may have expired or the trip may have been deleted.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  const days = Math.max(1, Math.ceil((new Date(snapshot.endDate) - new Date(snapshot.startDate)) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600">
            Join this amazing trip and start planning together
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {snapshot.name}
            </h2>
            <p className="text-gray-600">
              Trip to {snapshot.destination}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-1">📅</div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-gray-900">{days} days</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="font-semibold text-gray-900">${snapshot.budget?.toLocaleString()}</p>
            </div>
          </div>

          {snapshot.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Trip Description:</p>
              <p className="text-sm">{snapshot.description}</p>
            </div>
          )}

          {snapshot.participants && snapshot.participants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Current participants:</p>
              <div className="flex flex-wrap gap-2">
                {snapshot.participants.map((participant, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <Input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={joining || !participantName.trim()}
              className="w-full"
              size="lg"
            >
              {joining ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Joining Trip...
                </>
              ) : (
                'Join This Trip'
              )}
            </Button>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}



