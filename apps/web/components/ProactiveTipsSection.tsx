'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProactiveTip {
  type: 'weather' | 'connection' | 'budget' | 'popularity' | 'accessibility';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action_type: string;
  action_data: any;
}

interface ProactiveTipsSectionProps {
  itinerary: any;
  userProfile: any;
  destination?: string;
  onTipApplied?: (modifiedItinerary: any, tip: ProactiveTip) => void;
}

export default function ProactiveTipsSection({
  itinerary,
  userProfile,
  destination,
  onTipApplied
}: ProactiveTipsSectionProps) {
  const [tips, setTips] = useState<ProactiveTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyingTip, setApplyingTip] = useState<string | null>(null);

  useEffect(() => {
    if (itinerary && userProfile) {
      generateTips();
    }
  }, [itinerary, userProfile, destination]);

  const generateTips = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proactive-tips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary,
          user_profile: userProfile,
          destination
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTips(data.tips || []);
      } else {
        setError(data.message || 'Failed to generate tips');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
      console.error('Error generating tips:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTip = async (tip: ProactiveTip) => {
    setApplyingTip(tip.action_type);

    try {
      const response = await fetch('/api/proactive-tips/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itinerary,
          user_profile: userProfile,
          tip
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Call the callback to update the parent component
        if (onTipApplied) {
          onTipApplied(data.modified_itinerary, tip);
        }
        
        // Remove the applied tip from the list
        setTips(prevTips => prevTips.filter(t => t !== tip));
      } else {
        setError(data.message || 'Failed to apply tip');
      }
    } catch (err) {
      setError('Failed to apply tip');
      console.error('Error applying tip:', err);
    } finally {
      setApplyingTip(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return '🌤️';
      case 'connection':
        return '⏰';
      case 'budget':
        return '💰';
      case 'popularity':
        return '⭐';
      case 'accessibility':
        return '♿';
      default:
        return '💡';
    }
  };

  const getActionButtonText = (actionType: string) => {
    switch (actionType) {
      case 'reschedule_outdoor':
        return 'Reschedule';
      case 'suggest_transport':
        return 'Add Transport';
      case 'suggest_alternatives':
        return 'Find Alternatives';
      case 'suggest_reservation':
        return 'Add Reservation Note';
      case 'suggest_booking':
        return 'Add Booking Note';
      case 'suggest_family_alternative':
        return 'Find Family Alternative';
      case 'suggest_accessible_alternative':
        return 'Find Accessible Alternative';
      default:
        return 'Apply';
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Tips & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing your itinerary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Tips & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={generateTips}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (tips.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Tips & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-2">✨</div>
            <p>Your itinerary looks great! No issues detected.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={generateTips}
            >
              Refresh Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 AI Tips & Suggestions
          <Badge variant="secondary" className="ml-2">
            {tips.length} tip{tips.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(tip.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTipIcon(tip.type)}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSeverityColor(tip.severity)}`}
                    >
                      {tip.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tip.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{tip.message}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applyTip(tip)}
                  disabled={applyingTip === tip.action_type}
                  className="ml-4 flex-shrink-0"
                >
                  {applyingTip === tip.action_type ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Applying...
                    </>
                  ) : (
                    getActionButtonText(tip.action_type)
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={generateTips}
            className="w-full"
          >
            🔄 Refresh Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
