"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  Car, 
  Walking, 
  Train, 
  Plane,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Bell,
  Settings,
  ArrowRight,
  ArrowLeft,
  Timer,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface RealTimeStatus {
  currentActivity: {
    id: string;
    name: string;
    startTime: Date;
    endTime: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    status: 'upcoming' | 'current' | 'completed' | 'delayed';
    estimatedArrival?: Date;
    travelTime?: number;
  };
  nextActivity?: {
    id: string;
    name: string;
    startTime: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    travelTime: number;
    travelMode: 'walking' | 'driving' | 'transit';
  };
  timeline: {
    activities: Array<{
      id: string;
      name: string;
      startTime: Date;
      endTime: Date;
      status: 'completed' | 'current' | 'upcoming' | 'skipped';
      delay?: number;
    }>;
    totalDelay: number;
    estimatedCompletion: Date;
  };
  alerts: Array<{
    type: 'delay' | 'closure' | 'optimization' | 'weather';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    actionable: boolean;
    actionUrl?: string;
  }>;
}

export default function ExecutionMode() {
  const params = useParams();
  const tripId = params.id as string;
  
  const [isExecutionActive, setIsExecutionActive] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize execution mode
  useEffect(() => {
    initializeExecutionMode();
    return () => {
      cleanup();
    };
  }, [tripId]);

  const initializeExecutionMode = async () => {
    try {
      setIsLoading(true);
      
      // Start execution mode
      const response = await fetch('/api/execution/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tripId, 
          userId: 'demo-user' // In real app, get from auth
        })
      });

      if (response.ok) {
        setIsExecutionActive(true);
        await requestLocationPermission();
        startLocationTracking();
        startStatusUpdates();
      } else {
        setError('Failed to start execution mode');
      }
    } catch (error) {
      console.error('Error initializing execution mode:', error);
      setError('Failed to initialize execution mode');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);

        if (permission.state === 'granted') {
          getCurrentLocation();
        } else if (permission.state === 'prompt') {
          // Request permission
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              setLocationPermission('granted');
            },
            () => setLocationPermission('denied'),
            { enableHighAccuracy: true }
          );
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const startLocationTracking = () => {
    // Update location every 30 seconds
    locationIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        updateLocation(currentLocation.latitude, currentLocation.longitude);
      }
    }, 30000);
  };

  const startStatusUpdates = () => {
    // Update status every 60 seconds
    statusIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, 60000);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch('/api/execution/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          userId: 'demo-user',
          latitude,
          longitude,
          accuracy: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRealTimeStatus(data.status);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/execution/status?tripId=${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setRealTimeStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const cleanup = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
  };

  const stopExecution = async () => {
    try {
      await fetch('/api/execution/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
      });
      setIsExecutionActive(false);
      cleanup();
    } catch (error) {
      console.error('Error stopping execution:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'current': return <Play className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'walking': return <Walking className="w-4 h-4" />;
      case 'driving': return <Car className="w-4 h-4" />;
      case 'transit': return <Train className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Starting Execution Mode...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">{error}</p>
          <Button onClick={initializeExecutionMode} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isExecutionActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <h1 className="text-xl font-bold">Execution Mode</h1>
              <Badge variant={isExecutionActive ? 'default' : 'secondary'}>
                {isExecutionActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={stopExecution}
              >
                <Stop className="w-4 h-4" />
                Stop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Current Activity Card */}
        {realTimeStatus?.currentActivity && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Current Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{realTimeStatus.currentActivity.name}</h3>
                  <p className="text-sm text-gray-600">{realTimeStatus.currentActivity.location.address}</p>
                </div>
                <Badge variant={realTimeStatus.currentActivity.status === 'delayed' ? 'destructive' : 'default'}>
                  {realTimeStatus.currentActivity.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-sm text-gray-600">Start Time</div>
                  <div className="font-semibold">
                    {new Date(realTimeStatus.currentActivity.startTime).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-sm text-gray-600">End Time</div>
                  <div className="font-semibold">
                    {new Date(realTimeStatus.currentActivity.endTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {realTimeStatus.currentActivity.travelTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4" />
                  <span>Travel time: {realTimeStatus.currentActivity.travelTime} minutes</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Activity */}
        {realTimeStatus?.nextActivity && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Next Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{realTimeStatus.nextActivity.name}</h3>
                  <p className="text-sm text-gray-600">{realTimeStatus.nextActivity.location.address}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    {getTravelModeIcon(realTimeStatus.nextActivity.travelMode)}
                    <span>{realTimeStatus.nextActivity.travelTime} min</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(realTimeStatus.nextActivity.startTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {realTimeStatus?.alerts && realTimeStatus.alerts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alerts
            </h3>
            {realTimeStatus.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    {alert.actionable && (
                      <Button variant="outline" size="sm">
                        Action
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Timeline */}
        {realTimeStatus?.timeline && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Timeline</span>
                <div className="flex items-center gap-2">
                  {realTimeStatus.timeline.totalDelay > 0 && (
                    <Badge variant="destructive">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {realTimeStatus.timeline.totalDelay} min behind
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">
                    Complete by {realTimeStatus.timeline.estimatedCompletion.toLocaleTimeString()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeStatus.timeline.activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`${getStatusColor(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(activity.startTime).toLocaleTimeString()} - {new Date(activity.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    {activity.delay && activity.delay > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        +{activity.delay} min
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex-col">
                <Car className="w-6 h-6 mb-1" />
                <span className="text-sm">Call Taxi</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Walking className="w-6 h-6 mb-1" />
                <span className="text-sm">Walking Directions</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Plane className="w-6 h-6 mb-1" />
                <span className="text-sm">Check Flight</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Timer className="w-6 h-6 mb-1" />
                <span className="text-sm">Set Reminder</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card>
          <CardHeader>
            <CardTitle>Location Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  locationPermission === 'granted' ? 'bg-green-500' : 
                  locationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span>Location Tracking</span>
              </div>
              <Badge variant={
                locationPermission === 'granted' ? 'default' : 
                locationPermission === 'denied' ? 'destructive' : 'secondary'
              }>
                {locationPermission === 'granted' ? 'Active' : 
                 locationPermission === 'denied' ? 'Denied' : 'Requesting'}
              </Badge>
            </div>
            {currentLocation && (
              <div className="mt-2 text-sm text-gray-600">
                Current: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
