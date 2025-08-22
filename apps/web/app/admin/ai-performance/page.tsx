"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BarChart3,
  UserCheck,
  Zap
} from 'lucide-react';

interface FeedbackStats {
  positive: Array<{
    activityName: string;
    category: string;
    count: number;
    percentage: number;
  }>;
  negative: Array<{
    activityName: string;
    category: string;
    count: number;
    percentage: number;
  }>;
  totalFeedback: number;
  positiveRate: number;
}

interface UserProfile {
  userId: string;
  name: string;
  email?: string;
}

interface ProfileEvolution {
  userId: string;
  changes: Array<{
    timestamp: string;
    interest: string;
    oldValue: number;
    newValue: number;
    change: number;
    confidence: number;
  }>;
  currentProfile: Record<string, number>;
}

interface ABTestResult {
  beforeFeedback: {
    count: number;
    averageRating: number;
    totalItineraries: number;
  };
  afterFeedback: {
    count: number;
    averageRating: number;
    totalItineraries: number;
  };
  improvement: number;
  significance: boolean;
}

interface SystemHealth {
  apiConnections: {
    googlePlaces: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
    openai: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
    redis: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
  };
  mlEngine: {
    status: 'healthy' | 'warning' | 'error';
    lastCallTime: number;
    averageResponseTime: number;
    recentCalls: Array<{
      timestamp: string;
      duration: number;
      success: boolean;
      error?: string;
    }>;
  };
  cacheStats: {
    hitRate: number;
    totalRequests: number;
    cacheSize: number;
  };
}

export default function AIPerformanceDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [profileEvolution, setProfileEvolution] = useState<ProfileEvolution | null>(null);
  const [abTestResult, setAbTestResult] = useState<ABTestResult | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Basic auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth-check');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login or show auth form
          const username = prompt('Admin Username:');
          const password = prompt('Admin Password:');
          
          if (username && password) {
            const authResponse = await fetch('/api/admin/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            
            if (authResponse.ok) {
              setIsAuthenticated(true);
            } else {
              alert('Invalid credentials');
              window.location.href = '/';
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Load profile evolution when user changes
  useEffect(() => {
    if (selectedUser) {
      loadProfileEvolution(selectedUser);
    }
  }, [selectedUser]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [feedbackRes, usersRes, abTestRes, healthRes] = await Promise.all([
        fetch('/api/admin/feedback-stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/ab-test-results'),
        fetch('/api/admin/system-health')
      ]);

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        setFeedbackStats(feedbackData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
        if (usersData.users.length > 0 && !selectedUser) {
          setSelectedUser(usersData.users[0].userId);
        }
      }

      if (abTestRes.ok) {
        const abTestData = await abTestRes.json();
        setAbTestResult(abTestData);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setSystemHealth(healthData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfileEvolution = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/profile-evolution?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfileEvolution(data);
      }
    } catch (error) {
      console.error('Failed to load profile evolution:', error);
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <Activity className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading AI Performance Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p>Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Performance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor AI recommendations, user feedback, and system health</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/subscription-analytics', '_blank')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Subscription Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/strategic-insights', '_blank')}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Strategic Insights
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.apiConnections ? 
                Object.values(systemHealth.apiConnections).filter(api => api.status === 'healthy').length + '/3' : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              APIs operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Engine</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.mlEngine.status === 'healthy' ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.mlEngine.averageResponseTime ? 
                `${systemHealth.mlEngine.averageResponseTime}ms avg` : 
                'No recent calls'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.cacheStats.hitRate ? 
                `${Math.round(systemHealth.cacheStats.hitRate)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.cacheStats.totalRequests || 0} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackStats?.positiveRate ? 
                `${Math.round(feedbackStats.positiveRate)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {feedbackStats?.totalFeedback || 0} total feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Feedback Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positive Feedback */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Most Liked Activities
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackStats?.positive.slice(0, 5).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.activityName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Negative Feedback */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Most Disliked Activities
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Dislikes</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackStats?.negative.slice(0, 5).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.activityName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Evolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            User Profile Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    {user.name} ({user.email || user.userId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profileEvolution ? (
            <div className="space-y-4">
              {/* Current Profile */}
              <div>
                <h4 className="font-semibold mb-2">Current Interest Profile</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profileEvolution.currentProfile).map(([interest, score]) => (
                    <Badge key={interest} variant="outline">
                      {interest}: {score.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Evolution Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Recent Changes</h4>
                <div className="space-y-2">
                  {profileEvolution.changes.slice(0, 10).map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{change.interest}</span>
                        <span className={`text-sm ${change.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change.change > 0 ? '+' : ''}{change.change.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(change.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a user to view profile evolution</p>
          )}
        </CardContent>
      </Card>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            A/B Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {abTestResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Before Feedback Learning</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {abTestResult.beforeFeedback.averageRating.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {abTestResult.beforeFeedback.count} itineraries rated
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">After Feedback Learning</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {abTestResult.afterFeedback.averageRating.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {abTestResult.afterFeedback.count} itineraries rated
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Improvement</h4>
                    <p className="text-sm text-gray-600">
                      Average rating change after feedback learning
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${abTestResult.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {abTestResult.improvement > 0 ? '+' : ''}{abTestResult.improvement.toFixed(2)}
                    </div>
                    <Badge variant={abTestResult.significance ? 'default' : 'secondary'}>
                      {abTestResult.significance ? 'Statistically Significant' : 'Not Significant'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No A/B test data available</p>
          )}
        </CardContent>
      </Card>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* API Connections */}
            <div>
              <h4 className="font-semibold mb-2">API Connections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemHealth?.apiConnections && Object.entries(systemHealth.apiConnections).map(([api, status]) => (
                  <div key={api} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium capitalize">{api.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <span className={`${getStatusColor(status.status)}`}>
                        {getStatusIcon(status.status)}
                      </span>
                      <span className="text-sm">{status.responseTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Engine Recent Calls */}
            <div>
              <h4 className="font-semibold mb-2">ML Engine Recent Calls</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemHealth?.mlEngine.recentCalls.slice(0, 10).map((call, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{call.duration}ms</TableCell>
                      <TableCell>
                        {call.success ? (
                          <Badge variant="default">Success</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-red-600">
                        {call.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
