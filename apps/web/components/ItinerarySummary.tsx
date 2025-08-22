"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Database, Users } from 'lucide-react';

interface ItinerarySummaryProps {
  userProfile: any;
  destination: string;
  totalActivities: number;
  dataPoints?: number;
  className?: string;
}

interface SummaryData {
  optimized_for: string[];
  based_on: string[];
  total_activities: number;
}

export function ItinerarySummary({ 
  userProfile, 
  destination, 
  totalActivities, 
  dataPoints,
  className 
}: ItinerarySummaryProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [userProfile, destination, totalActivities, dataPoints]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          destination,
          totalActivities,
          dataPoints
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError('Unable to load itinerary summary');
      console.error('Error fetching itinerary summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            How your itinerary was built
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            How your itinerary was built
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          How your itinerary was built
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optimization Factors */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm text-gray-700">Optimized for:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary?.optimized_for.map((factor, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm text-gray-700">Based on:</span>
          </div>
          <div className="space-y-1">
            {summary?.based_on.map((source, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                {source}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Count */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-sm text-gray-700">Itinerary Details:</span>
          </div>
          <div className="text-sm text-gray-600">
            {summary?.total_activities || totalActivities} carefully selected activities
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>🤖 AI-Powered Recommendations</span>
            <span>✨ Personalized for You</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
