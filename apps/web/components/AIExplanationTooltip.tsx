"use client";

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIExplanationTooltipProps {
  activity: any;
  userProfile: any;
  decisionFactors?: any;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AIExplanationTooltip({ 
  activity, 
  userProfile, 
  decisionFactors, 
  className,
  size = 'md' 
}: AIExplanationTooltipProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (explanation || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity,
          userProfile,
          decisionFactors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch explanation');
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError('Unable to load explanation');
      console.error('Error fetching AI explanation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={fetchExplanation}
            className={cn(
              'inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors',
              sizeClasses[size],
              className
            )}
            aria-label="Get AI explanation for this recommendation"
          >
            {isLoading ? (
              <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
            ) : (
              <Info className={iconSizeClasses[size]} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-3 bg-white border border-gray-200 shadow-lg"
        >
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-900">
              🤖 AI Recommendation
            </div>
            <div className="text-sm text-gray-700">
              {error ? (
                <div className="text-red-600">{error}</div>
              ) : explanation ? (
                <p>{explanation}</p>
              ) : (
                <div className="text-gray-500">
                  Click to see why we recommended this activity
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
