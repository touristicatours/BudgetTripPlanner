import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Input, Textarea, Badge, Alert } from '../../components/ui/Kit';

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [trip, setTrip] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newParticipant, setNewParticipant] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (id) {
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      const foundTrip = trips.find(t => t.id === id);
      if (foundTrip) {
        setTrip(foundTrip);
        setEditData({
          name: foundTrip.name,
          destination: foundTrip.destination,
          startDate: foundTrip.startDate,
          endDate: foundTrip.endDate,
          budget: foundTrip.budget,
          travelers: foundTrip.travelers,
          itinerary: foundTrip.itinerary || ''
        });
      }
    }
  }, [id]);

  const handleSave = () => {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const updatedTrips = trips.map(t => 
      t.id === id ? { ...t, ...editData } : t
    );
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    setTrip({ ...trip, ...editData });
    setEditing(false);
  };

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) return;
    
    const updatedTrip = {
      ...trip,
      participants: [...(trip.participants || []), newParticipant.trim()]
    };
    
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const updatedTrips = trips.map(t => t.id === id ? updatedTrip : t);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    setTrip(updatedTrip);
    setNewParticipant('');
  };

  const handleCreateInvite = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip })
      });
      
      if (response.ok) {
        const { slug } = await response.json();
        const link = `${window.location.origin}/trips/join/${slug}`;
        setInviteLink(link);
      }
    } catch (error) {
      console.error('Failed to create invite:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  if (!trip) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  const days = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
          <p className="text-gray-600">Trip to {trip.destination}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Trip'}
          </Button>
          {editing && (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Trip Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-semibold text-gray-900">{days} days</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm text-gray-600">Travelers</p>
            <p className="font-semibold text-gray-900">{trip.travelers || 1}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-semibold text-gray-900">${trip.budget?.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm text-gray-600">Interests</p>
            <p className="font-semibold text-gray-900">{trip.interests?.length || 0}</p>
          </div>
        </div>
      </Card>

      {/* Selected Items */}
      {trip.selectedItems && (
        <div className="space-y-6">
          {/* Flight */}
          {trip.selectedItems.flight && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✈️ Selected Flight</h3>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">✈️</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{trip.selectedItems.flight.airline}</h4>
                    <p className="text-sm text-gray-600">
                      {trip.selectedItems.flight.depart?.slice(11, 16) || 'TBD'} → {trip.selectedItems.flight.arrive?.slice(11, 16) || 'TBD'} • {trip.selectedItems.flight.durationHours}h
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">${trip.selectedItems.flight.total}</p>
                  <p className="text-sm text-gray-500">per person</p>
                </div>
              </div>
            </Card>
          )}

          {/* Accommodation */}
          {trip.selectedItems.stay && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏨 Selected Accommodation</h3>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">🏨</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{trip.selectedItems.stay.name}</h4>
                    <p className="text-sm text-gray-600">
                      {trip.selectedItems.stay.type} • {trip.selectedItems.stay.stars}★ • {trip.selectedItems.stay.nights} nights
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-600">${trip.selectedItems.stay.total}</p>
                  <p className="text-sm text-gray-500">total</p>
                </div>
              </div>
            </Card>
          )}

          {/* Restaurant */}
          {trip.selectedItems.restaurant && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Selected Dining</h3>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">🍽️</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{trip.selectedItems.restaurant.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${trip.selectedItems.restaurant.pricePerMeal} per meal • {trip.selectedItems.restaurant.tags?.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${trip.selectedItems.restaurant.pricePerMeal}</p>
                  <p className="text-sm text-gray-500">per meal</p>
                </div>
              </div>
            </Card>
          )}

          {/* Activities */}
          {trip.selectedItems.activities && trip.selectedItems.activities.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Selected Activities</h3>
              <div className="space-y-3">
                {trip.selectedItems.activities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">🎯</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex gap-2 mt-1">
                          {activity.tags?.map(tag => (
                            <Badge key={tag} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">${activity.price}</p>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Total Cost */}
          {trip.totalCost && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Trip Cost</h3>
                  <p className="text-gray-600">All selected items combined</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">${trip.totalCost.toLocaleString()}</p>
                  <p className={`text-sm ${trip.budget >= trip.totalCost ? 'text-green-600' : 'text-red-600'}`}>
                    {trip.budget >= trip.totalCost ? 'Within budget' : 'Over budget'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Trip Details Form */}
      {editing && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Trip Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <Input
                value={editData.destination}
                onChange={(e) => setEditData({...editData, destination: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={editData.startDate}
                onChange={(e) => setEditData({...editData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={editData.endDate}
                onChange={(e) => setEditData({...editData, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <Input
                type="number"
                value={editData.budget}
                onChange={(e) => setEditData({...editData, budget: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
              <Input
                type="number"
                value={editData.travelers}
                onChange={(e) => setEditData({...editData, travelers: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Itinerary Notes</label>
            <Textarea
              value={editData.itinerary}
              onChange={(e) => setEditData({...editData, itinerary: e.target.value})}
              rows={4}
              placeholder="Add any additional notes or itinerary details..."
            />
          </div>
        </Card>
      )}

      {/* Participants */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 Trip Participants</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Add participant name"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
            />
            <Button onClick={handleAddParticipant}>Add</Button>
          </div>
          
          {trip.participants && trip.participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trip.participants.map((participant, index) => (
                <Badge key={index} variant="default">
                  {participant}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No participants added yet.</p>
          )}
        </div>
      </Card>

      {/* Invite Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 Invite Friends</h2>
        <div className="space-y-4">
          <Button onClick={handleCreateInvite} className="mb-4">
            Generate Invite Link
          </Button>
          
          {inviteLink && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this link with friends:</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button variant="outline" onClick={copyInviteLink}>
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


