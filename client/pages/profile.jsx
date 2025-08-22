import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Input, Alert, Badge } from '../components/ui/Kit';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferences: {
      emailNotifications: true,
      travelDeals: true,
      tripReminders: true
    }
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    // Populate form with user data
    setFormData({
      firstName: userObj.firstName || userObj.name?.split(' ')[0] || '',
      lastName: userObj.lastName || userObj.name?.split(' ')[1] || '',
      email: userObj.email || '',
      phone: userObj.phone || '',
      preferences: {
        emailNotifications: userObj.preferences?.emailNotifications ?? true,
        travelDeals: userObj.preferences?.travelDeals ?? true,
        tripReminders: userObj.preferences?.tripReminders ?? true
      }
    });
    
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user data
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        preferences: formData.preferences,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('user');
      localStorage.removeItem('trips');
      localStorage.removeItem('bookings');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      {message && (
        <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
          {message}
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      emailNotifications: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Email notifications for trip updates</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.travelDeals}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      travelDeals: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Travel deals and promotions</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.tripReminders}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      tripReminders: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Trip reminders and check-ins</span>
              </label>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4 mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{user.name || 'User'}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <Badge variant="success" className="mt-2">
                  Active Account
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Member since:</p>
                <p className="text-sm font-medium">
                  {new Date(user.registeredAt || user.loggedInAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Trips:</span>
                <span className="text-sm font-medium">
                  {JSON.parse(localStorage.getItem('trips') || '[]').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Bookings:</span>
                <span className="text-sm font-medium">
                  {JSON.parse(localStorage.getItem('bookings') || '[]').length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Change Password
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                className="w-full"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
