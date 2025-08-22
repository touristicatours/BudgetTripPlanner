import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  TrendingUp, 
  Users, 
  Heart, 
  Zap, 
  Crown, 
  DollarSign,
  Target,
  Award,
  ThumbsUp
} from 'lucide-react';

interface TrustSignalBadgeProps {
  signal: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const TrustSignalBadge: React.FC<TrustSignalBadgeProps> = ({ 
  signal, 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const getIcon = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    
    if (lowerSignal.includes('excellent') || lowerSignal.includes('highly rated') || lowerSignal.includes('star')) {
      return <Star className="w-3 h-3" />;
    }
    if (lowerSignal.includes('trending') || lowerSignal.includes('popular')) {
      return <TrendingUp className="w-3 h-3" />;
    }
    if (lowerSignal.includes('foodies') || lowerSignal.includes('lovers')) {
      return <Heart className="w-3 h-3" />;
    }
    if (lowerSignal.includes('luxury') || lowerSignal.includes('premium')) {
      return <Crown className="w-3 h-3" />;
    }
    if (lowerSignal.includes('value') || lowerSignal.includes('budget')) {
      return <DollarSign className="w-3 h-3" />;
    }
    if (lowerSignal.includes('together') || lowerSignal.includes('correlated')) {
      return <Target className="w-3 h-3" />;
    }
    if (lowerSignal.includes('award') || lowerSignal.includes('best')) {
      return <Award className="w-3 h-3" />;
    }
    if (lowerSignal.includes('recommended') || lowerSignal.includes('choice')) {
      return <ThumbsUp className="w-3 h-3" />;
    }
    if (lowerSignal.includes('hot') || lowerSignal.includes('fire')) {
      return <Zap className="w-3 h-3" />;
    }
    
    return <Users className="w-3 h-3" />;
  };

  const getVariant = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    
    if (lowerSignal.includes('excellent') || lowerSignal.includes('trending') || lowerSignal.includes('hot')) {
      return 'default';
    }
    if (lowerSignal.includes('luxury') || lowerSignal.includes('premium')) {
      return 'secondary';
    }
    if (lowerSignal.includes('value') || lowerSignal.includes('budget')) {
      return 'outline';
    }
    if (lowerSignal.includes('foodies') || lowerSignal.includes('lovers')) {
      return 'destructive';
    }
    
    return variant;
  };

  const getSize = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    
    if (lowerSignal.includes('excellent') || lowerSignal.includes('trending')) {
      return 'lg';
    }
    if (lowerSignal.includes('recommended') || lowerSignal.includes('choice')) {
      return 'sm';
    }
    
    return size;
  };

  return (
    <Badge 
      variant={getVariant(signal)}
      className={`flex items-center gap-1 ${className}`}
    >
      {getIcon(signal)}
      <span className="text-xs font-medium">{signal}</span>
    </Badge>
  );
};

interface TrustSignalsDisplayProps {
  signals: string[];
  maxDisplay?: number;
  className?: string;
}

export const TrustSignalsDisplay: React.FC<TrustSignalsDisplayProps> = ({ 
  signals, 
  maxDisplay = 3,
  className = ''
}) => {
  const displaySignals = signals.slice(0, maxDisplay);
  const hasMore = signals.length > maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displaySignals.map((signal, index) => (
        <TrustSignalBadge key={index} signal={signal} />
      ))}
      {hasMore && (
        <Badge variant="outline" className="text-xs">
          +{signals.length - maxDisplay} more
        </Badge>
      )}
    </div>
  );
};

interface CollectiveIntelligenceCardProps {
  activity: {
    id: string;
    name: string;
    category: string;
    averageRating?: number;
    ratingCount?: number;
    trustSignals?: string[];
    primaryTrustSignal?: string;
    explanation?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const CollectiveIntelligenceCard: React.FC<CollectiveIntelligenceCardProps> = ({
  activity,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{activity.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{activity.category}</p>
        </div>
        {activity.primaryTrustSignal && (
          <TrustSignalBadge signal={activity.primaryTrustSignal} />
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        {activity.averageRating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{activity.averageRating.toFixed(1)}</span>
            {activity.ratingCount && (
              <span className="text-xs text-gray-500">({activity.ratingCount})</span>
            )}
          </div>
        )}
      </div>

      {activity.trustSignals && activity.trustSignals.length > 0 && (
        <TrustSignalsDisplay signals={activity.trustSignals} maxDisplay={2} className="mb-3" />
      )}

      {activity.explanation && (
        <p className="text-xs text-gray-600 italic">{activity.explanation}</p>
      )}
    </div>
  );
};

interface PopularWithSectionProps {
  title: string;
  activities: Array<{
    id: string;
    name: string;
    category: string;
    trustSignal: string;
    explanation?: string;
  }>;
  className?: string;
}

export const PopularWithSection: React.FC<PopularWithSectionProps> = ({
  title,
  activities,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <CollectiveIntelligenceCard
            key={activity.id}
            activity={{
              ...activity,
              trustSignals: [activity.trustSignal],
              primaryTrustSignal: activity.trustSignal
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrustSignalBadge;
