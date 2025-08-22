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
  Zap,
  Map,
  Target,
  DollarSign,
  Globe,
  ArrowRight,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to avoid SSR issues
const { Chart: ChartJS, registerables } = require('chart.js');
const { Doughnut, Line, Bar, Radar } = require('react-chartjs-2');

// Register Chart.js components
ChartJS.register(...registerables);

interface FeatureAdoptionData {
  stage: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface CohortData {
  cohort: string;
  size: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  ltv: number;
  conversionRate: number;
}

interface MarketGapData {
  location: string;
  searches: number;
  dataQuality: number;
  gap: number;
  coordinates: [number, number];
}

interface AIModelPerformance {
  date: string;
  predictedRating: number;
  actualRating: number;
  accuracy: number;
  confidence: number;
  activityType: string;
}

interface StrategicInsights {
  featureAdoption: FeatureAdoptionData[];
  cohorts: CohortData[];
  marketGaps: MarketGapData[];
  aiPerformance: AIModelPerformance[];
  recommendations: string[];
  keyMetrics: {
    conversionRate: number;
    avgLTV: number;
    retentionRate: number;
    aiAccuracy: number;
  };
}

export default function StrategicInsightsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<StrategicInsights | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('90d');
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Basic auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth-check');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
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
      loadStrategicInsights();
    }
  }, [isAuthenticated, selectedTimeframe]);

  const loadStrategicInsights = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/strategic-insights?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load strategic insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDropoffColor = (dropoff: number) => {
    if (dropoff > 50) return 'text-red-600';
    if (dropoff > 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRetentionColor = (rate: number) => {
    if (rate > 70) return 'text-green-600';
    if (rate > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Chart configurations
  const funnelChartData = {
    labels: insights?.featureAdoption.map(stage => stage.stage) || [],
    datasets: [{
      data: insights?.featureAdoption.map(stage => stage.count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const cohortChartData = {
    labels: insights?.cohorts.map(cohort => cohort.cohort) || [],
    datasets: [
      {
        label: 'Day 1 Retention',
        data: insights?.cohorts.map(cohort => cohort.retention.day1) || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Day 7 Retention',
        data: insights?.cohorts.map(cohort => cohort.retention.day7) || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Day 30 Retention',
        data: insights?.cohorts.map(cohort => cohort.retention.day30) || [],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ]
  };

  const aiPerformanceChartData = {
    labels: insights?.aiPerformance.slice(0, 10).map(perf => perf.date) || [],
    datasets: [
      {
        label: 'Predicted Rating',
        data: insights?.aiPerformance.slice(0, 10).map(perf => perf.predictedRating) || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Actual Rating',
        data: insights?.aiPerformance.slice(0, 10).map(perf => perf.actualRating) || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  const marketGapChartData = {
    labels: insights?.marketGaps.slice(0, 8).map(gap => gap.location) || [],
    datasets: [
      {
        label: 'Search Demand',
        data: insights?.marketGaps.slice(0, 8).map(gap => gap.searches) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Data Quality',
        data: insights?.marketGaps.slice(0, 8).map(gap => gap.dataQuality) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Strategic Insights Dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Strategic Business Intelligence</h1>
          <p className="text-gray-600 mt-2">Data-driven insights to guide strategic decisions</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="180d">180 days</SelectItem>
              <SelectItem value="365d">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={loadStrategicInsights}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/ai-performance', '_blank')}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            AI Performance
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/admin/subscription-analytics', '_blank')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Subscription Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.keyMetrics.conversionRate ? 
                `${insights.keyMetrics.conversionRate.toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Free to paid conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.keyMetrics.avgLTV ? 
                `$${insights.keyMetrics.avgLTV.toFixed(0)}` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.keyMetrics.retentionRate ? 
                `${insights.keyMetrics.retentionRate.toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              30-day retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.keyMetrics.aiAccuracy ? 
                `${insights.keyMetrics.aiAccuracy.toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Recommendation accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Adoption Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Feature Adoption Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {insights?.featureAdoption.map((stage, index) => (
                <div key={stage.stage} className="text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{stage.count}</div>
                    <div className="text-sm text-gray-600">{stage.stage}</div>
                    <div className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</div>
                  </div>
                  {index < insights.featureAdoption.length - 1 && (
                    <div className="flex items-center justify-center mt-2">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className={`text-xs ml-1 ${getDropoffColor(stage.dropoff)}`}>
                        {stage.dropoff.toFixed(1)}% dropoff
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Funnel Chart */}
            <div className="h-64">
              <Bar data={funnelChartData} options={chartOptions} />
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Insight:</strong> {insights?.featureAdoption.find(s => s.dropoff > 50)?.stage || 'Sign-up'} stage has the highest dropoff rate. 
                Consider improving onboarding or feature discovery.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Cohort Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {insights?.cohorts.map(cohort => (
                    <SelectItem key={cohort.cohort} value={cohort.cohort}>
                      {cohort.cohort} ({cohort.size} users)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cohort Chart */}
            <div className="h-64">
              <Line data={cohortChartData} options={chartOptions} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Day 1</TableHead>
                  <TableHead>Day 7</TableHead>
                  <TableHead>Day 30</TableHead>
                  <TableHead>Day 90</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead>Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights?.cohorts.map((cohort) => (
                  <TableRow key={cohort.cohort}>
                    <TableCell className="font-medium">{cohort.cohort}</TableCell>
                    <TableCell>{cohort.size}</TableCell>
                    <TableCell className={getRetentionColor(cohort.retention.day1)}>
                      {cohort.retention.day1.toFixed(1)}%
                    </TableCell>
                    <TableCell className={getRetentionColor(cohort.retention.day7)}>
                      {cohort.retention.day7.toFixed(1)}%
                    </TableCell>
                    <TableCell className={getRetentionColor(cohort.retention.day30)}>
                      {cohort.retention.day30.toFixed(1)}%
                    </TableCell>
                    <TableCell className={getRetentionColor(cohort.retention.day90)}>
                      {cohort.retention.day90.toFixed(1)}%
                    </TableCell>
                    <TableCell>${cohort.ltv.toFixed(0)}</TableCell>
                    <TableCell>{cohort.conversionRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Market Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Market Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Gap Chart */}
              <div className="h-64">
                <Bar data={marketGapChartData} options={chartOptions} />
              </div>

              {/* Top Gaps Table */}
              <div>
                <h4 className="font-semibold mb-3">Top Market Gaps</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Searches</TableHead>
                      <TableHead>Data Quality</TableHead>
                      <TableHead>Gap Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insights?.marketGaps.slice(0, 5).map((gap) => (
                      <TableRow key={gap.location}>
                        <TableCell className="font-medium">{gap.location}</TableCell>
                        <TableCell>{gap.searches}</TableCell>
                        <TableCell>
                          <Progress value={gap.dataQuality} className="w-16" />
                        </TableCell>
                        <TableCell>
                          <Badge variant={gap.gap > 70 ? 'destructive' : gap.gap > 40 ? 'secondary' : 'default'}>
                            {gap.gap.toFixed(0)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* AI Performance Chart */}
            <div className="h-64">
              <Line data={aiPerformanceChartData} options={chartOptions} />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Recent Performance</h4>
                <div className="space-y-2">
                  {insights?.aiPerformance.slice(0, 3).map((perf, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{perf.activityType}</span>
                      <Badge variant={perf.accuracy > 80 ? 'default' : perf.accuracy > 60 ? 'secondary' : 'destructive'}>
                        {perf.accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Accuracy by Category</h4>
                <div className="space-y-2">
                  {['Restaurants', 'Attractions', 'Hotels'].map((category) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <Progress value={Math.random() * 100} className="w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Confidence Levels</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Confidence</span>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Confidence</span>
                    <span className="text-sm font-medium text-yellow-600">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Confidence</span>
                    <span className="text-sm font-medium text-red-600">3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights?.recommendations.map((recommendation, index) => (
              <Alert key={index}>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>{recommendation}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
