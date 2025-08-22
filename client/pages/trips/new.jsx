import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Input, Select } from '../../components/ui/Kit';
import { AutoComplete } from '../../components/ui/AutoComplete';

export default function NewTripPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: '', 
    destination: '', 
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 2000,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create trip with more detailed data
      const trip = {
        id: Date.now().toString(),
        name: form.name,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: form.travelers,
        budget: form.budget,
        description: form.description,
        createdAt: new Date().toISOString(),
        status: 'planning'
      };

      // Save to localStorage
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      trips.unshift(trip);
      localStorage.setItem('trips', JSON.stringify(trips));

      // Redirect to trip detail page
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const calculateDays = () => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create a New Trip
        </h1>
        <p className="text-gray-600">
          Start planning your next adventure by creating a new trip
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Name *
            </label>
            <Input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="e.g., Summer Vacation to Japan"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination *
            </label>
            <AutoComplete
              value={form.destination}
              onChange={(e) => updateForm('destination', e.target.value)}
              placeholder="e.g., Tokyo, Japan"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => updateForm('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => updateForm('endDate', e.target.value)}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
          </div>

          {calculateDays() > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                📅 Trip Duration: <strong>{calculateDays()} days</strong>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Travelers
              </label>
              <Select
                value={form.travelers}
                onChange={(e) => updateForm('travelers', parseInt(e.target.value))}
                className="w-full"
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
                <option value={5}>5 people</option>
                <option value={6}>6+ people</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD)
              </label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) => updateForm('budget', parseInt(e.target.value))}
                placeholder="2000"
                min="100"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Add any notes about your trip plans..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400 resize-vertical"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.name || !form.destination || !form.startDate || !form.endDate}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4 mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Quick Tips */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>Choose a memorable name for your trip to easily identify it later</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>Set a realistic budget to help with planning and booking decisions</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>You can always edit trip details later from the trip page</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">•</span>
            <span>After creating a trip, you can start planning flights, hotels, and activities</span>
          </div>
        </div>
      </Card>
    </div>
  );
}



