import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FeatureConfig {
  name: string;
  description: string;
  tiers: {
    free: boolean;
    pro: boolean;
    business: boolean;
  };
  limits?: {
    free?: number;
    pro?: number;
    business?: number;
  };
}

export interface UsageLimit {
  feature: string;
  current: number;
  limit: number;
  resetDate: Date;
  isExceeded: boolean;
}

export interface TierInfo {
  name: string;
  displayName: string;
  features: string[];
  limits: Record<string, number>;
  price?: number;
  currency?: string;
  interval?: string;
}

export class SubscriptionService {
  // Feature configurations
  private static readonly FEATURES: Record<string, FeatureConfig> = {
    'ai_recommendations': {
      name: 'AI Recommendations',
      description: 'Personalized AI-powered activity recommendations',
      tiers: { free: true, pro: true, business: true },
      limits: { free: 5, pro: 50, business: 500 }
    },
    'auto_optimize': {
      name: 'Auto-Optimize Itineraries',
      description: 'Automatically optimize itinerary health scores',
      tiers: { free: false, pro: true, business: true }
    },
    'collaborators': {
      name: 'Collaborators',
      description: 'Add collaborators to your trips',
      tiers: { free: true, pro: true, business: true },
      limits: { free: 1, pro: 5, business: -1 } // -1 means unlimited
    },
    'api_export': {
      name: 'API Export',
      description: 'Export itineraries to external services',
      tiers: { free: false, pro: false, business: true }
    },
    'proactive_tips': {
      name: 'Proactive AI Tips',
      description: 'AI-powered proactive travel suggestions',
      tiers: { free: false, pro: true, business: true }
    },
    'health_scoring': {
      name: 'Itinerary Health Scoring',
      description: 'Advanced itinerary quality analysis',
      tiers: { free: false, pro: true, business: true }
    },
    'saved_itineraries': {
      name: 'Saved Itineraries',
      description: 'Number of itineraries you can save',
      tiers: { free: true, pro: true, business: true },
      limits: { free: 3, pro: 25, business: -1 }
    },
    'advanced_analytics': {
      name: 'Advanced Analytics',
      description: 'Detailed trip planning analytics',
      tiers: { free: false, pro: true, business: true }
    }
  };

  // Get user's current tier
  async getUserTier(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    });
    
    return user?.subscriptionTier || 'free';
  }

  // Check if user has access to a feature
  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const userTier = await this.getUserTier(userId);
    const feature = SubscriptionService.FEATURES[featureName];
    
    if (!feature) {
      return false; // Unknown feature
    }
    
    return feature.tiers[userTier as keyof typeof feature.tiers] || false;
  }

  // Check if user has exceeded usage limits for a feature
  async checkUsageLimit(userId: string, featureName: string): Promise<UsageLimit> {
    const userTier = await this.getUserTier(userId);
    const feature = SubscriptionService.FEATURES[featureName];
    
    if (!feature?.limits) {
      return {
        feature: featureName,
        current: 0,
        limit: -1,
        resetDate: new Date(),
        isExceeded: false
      };
    }
    
    const limit = feature.limits[userTier as keyof typeof feature.limits];
    if (limit === -1) {
      return {
        feature: featureName,
        current: 0,
        limit: -1,
        resetDate: new Date(),
        isExceeded: false
      };
    }
    
    // Get current usage for this feature
    const now = new Date();
    const resetDate = this.getResetDate(featureName);
    
    const usage = await prisma.usageStats.findUnique({
      where: {
        userId_feature_resetDate: {
          userId,
          feature: featureName,
          resetDate
        }
      }
    });
    
    const current = usage?.count || 0;
    const isExceeded = current >= (limit || 0);
    
    return {
      feature: featureName,
      current,
      limit: limit || 0,
      resetDate,
      isExceeded
    };
  }

  // Increment usage for a feature
  async incrementUsage(userId: string, featureName: string): Promise<void> {
    const resetDate = this.getResetDate(featureName);
    
    await prisma.usageStats.upsert({
      where: {
        userId_feature_resetDate: {
          userId,
          feature: featureName,
          resetDate
        }
      },
      update: {
        count: {
          increment: 1
        },
        updatedAt: new Date()
      },
      create: {
        userId,
        feature: featureName,
        count: 1,
        resetDate,
        updatedAt: new Date()
      }
    });
  }

  // Log feature access attempt
  async logFeatureAccess(
    userId: string, 
    featureName: string, 
    action: 'allowed' | 'blocked' | 'upgraded',
    metadata?: any
  ): Promise<void> {
    const userTier = await this.getUserTier(userId);
    
    await prisma.featureAccessLog.create({
      data: {
        userId,
        feature: featureName,
        action,
        tier: userTier,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }

  // Get all features available to a user
  async getUserFeatures(userId: string): Promise<FeatureConfig[]> {
    const userTier = await this.getUserTier(userId);
    
    return Object.values(SubscriptionService.FEATURES).filter(feature => 
      feature.tiers[userTier as keyof typeof feature.tiers]
    );
  }

  // Get user's usage statistics
  async getUserUsageStats(userId: string): Promise<UsageLimit[]> {
    const userTier = await this.getUserTier(userId);
    const features = Object.keys(SubscriptionService.FEATURES);
    const usageStats: UsageLimit[] = [];
    
    for (const featureName of features) {
      const feature = SubscriptionService.FEATURES[featureName];
      if (feature.limits) {
        const usage = await this.checkUsageLimit(userId, featureName);
        usageStats.push(usage);
      }
    }
    
    return usageStats;
  }

  // Get tier information
  async getTierInfo(tierName: string): Promise<TierInfo | null> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: tierName }
    });
    
    if (!plan) {
      return null;
    }
    
    const features = JSON.parse(plan.features);
    const limits = JSON.parse(plan.limits);
    
    return {
      name: plan.name,
      displayName: plan.displayName,
      features,
      limits,
      price: plan.price || undefined,
      currency: plan.currency,
      interval: plan.interval || undefined
    };
  }

  // Get all available tiers
  async getAllTiers(): Promise<TierInfo[]> {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    
    return plans.map(plan => ({
      name: plan.name,
      displayName: plan.displayName,
      features: JSON.parse(plan.features),
      limits: JSON.parse(plan.limits),
      price: plan.price || undefined,
      currency: plan.currency,
      interval: plan.interval || undefined
    }));
  }

  // Update user's subscription tier
  async updateUserTier(
    userId: string, 
    tier: string, 
    status: string = 'active',
    expiresAt?: Date
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt
      }
    });
  }

  // Check if user's subscription is active
  async isSubscriptionActive(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        subscriptionStatus: true, 
        subscriptionExpiresAt: true 
      }
    });
    
    if (!user) return false;
    
    if (user.subscriptionStatus !== 'active') return false;
    
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      return false;
    }
    
    return true;
  }

  // Get reset date for a feature (daily, monthly, etc.)
  private getResetDate(featureName: string): Date {
    const now = new Date();
    
    // Most features reset daily
    if (featureName === 'ai_recommendations' || featureName === 'api_calls') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    // Some features reset monthly
    if (featureName === 'saved_itineraries') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Default to daily
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // Get feature configuration
  static getFeatureConfig(featureName: string): FeatureConfig | null {
    return SubscriptionService.FEATURES[featureName] || null;
  }

  // Get all feature configurations
  static getAllFeatures(): Record<string, FeatureConfig> {
    return SubscriptionService.FEATURES;
  }

  // Get feature access logs for a user
  async getFeatureAccessLogs(userId: string, limit: number = 50, feature?: string) {
    const whereClause: any = { userId };
    if (feature) {
      whereClause.feature = feature;
    }

    const logs = await prisma.featureAccessLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return logs;
  }
}

export const subscriptionService = new SubscriptionService();
