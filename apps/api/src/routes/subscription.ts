import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { subscriptionService } from '../services/subscription_service';
import { featureAccessMiddleware, incrementFeatureUsage } from '../decorators/feature_access';

interface GetUserTierRequest {
  Params: {
    userId: string;
  };
}

interface UpdateUserTierRequest {
  Body: {
    userId: string;
    tier: string;
    status?: string;
    expiresAt?: string;
  };
}

interface CheckFeatureAccessRequest {
  Body: {
    userId: string;
    feature: string;
    requireActiveSubscription?: boolean;
  };
}

interface GetUsageStatsRequest {
  Params: {
    userId: string;
  };
}

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Get user's current tier
  fastify.get<GetUserTierRequest>('/v1/subscription/tier/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      
      const tier = await subscriptionService.getUserTier(userId);
      const isActive = await subscriptionService.isSubscriptionActive(userId);
      
      return reply.send({
        status: 'success',
        data: {
          tier,
          isActive
        }
      });
    } catch (error) {
      console.error('Error getting user tier:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Update user's subscription tier
  fastify.post<UpdateUserTierRequest>('/v1/subscription/tier', async (request, reply) => {
    try {
      const { userId, tier, status, expiresAt } = request.body;
      
      if (!userId || !tier) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId and tier are required'
        });
      }
      
      await subscriptionService.updateUserTier(
        userId, 
        tier, 
        status, 
        expiresAt ? new Date(expiresAt) : undefined
      );
      
      return reply.send({
        status: 'success',
        message: 'User tier updated successfully'
      });
    } catch (error) {
      console.error('Error updating user tier:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Check feature access
  fastify.post<CheckFeatureAccessRequest>('/v1/subscription/check-feature', async (request, reply) => {
    try {
      const { userId, feature, requireActiveSubscription } = request.body;
      
      if (!userId || !feature) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId and feature are required'
        });
      }
      
      const result = await subscriptionService.hasFeatureAccess(userId, feature);
      const usageLimit = await subscriptionService.checkUsageLimit(userId, feature);
      const isActive = await subscriptionService.isSubscriptionActive(userId);
      
      return reply.send({
        status: 'success',
        data: {
          hasAccess: result,
          usageLimit,
          isActive,
          feature
        }
      });
    } catch (error) {
      console.error('Error checking feature access:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get user's usage statistics
  fastify.get<GetUsageStatsRequest>('/v1/subscription/usage/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      
      const usageStats = await subscriptionService.getUserUsageStats(userId);
      const userTier = await subscriptionService.getUserTier(userId);
      const isActive = await subscriptionService.isSubscriptionActive(userId);
      
      return reply.send({
        status: 'success',
        data: {
          usageStats,
          tier: userTier,
          isActive
        }
      });
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get all available tiers
  fastify.get('/v1/subscription/tiers', async (request, reply) => {
    try {
      const tiers = await subscriptionService.getAllTiers();
      
      return reply.send({
        status: 'success',
        data: tiers
      });
    } catch (error) {
      console.error('Error getting tiers:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get tier information
  fastify.get('/v1/subscription/tiers/:tierName', async (request, reply) => {
    try {
      const { tierName } = request.params as { tierName: string };
      
      const tierInfo = await subscriptionService.getTierInfo(tierName);
      
      if (!tierInfo) {
        return reply.status(404).send({
          status: 'error',
          message: 'Tier not found'
        });
      }
      
      return reply.send({
        status: 'success',
        data: tierInfo
      });
    } catch (error) {
      console.error('Error getting tier info:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get user's available features
  fastify.get('/v1/subscription/features/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      const features = await subscriptionService.getUserFeatures(userId);
      const userTier = await subscriptionService.getUserTier(userId);
      
      return reply.send({
        status: 'success',
        data: {
          features,
          tier: userTier
        }
      });
    } catch (error) {
      console.error('Error getting user features:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Increment usage for a feature
  fastify.post('/v1/subscription/increment-usage', async (request, reply) => {
    try {
      const { userId, feature } = request.body as { userId: string; feature: string };
      
      if (!userId || !feature) {
        return reply.status(400).send({
          status: 'error',
          message: 'userId and feature are required'
        });
      }
      
      await subscriptionService.incrementUsage(userId, feature);
      
      return reply.send({
        status: 'success',
        message: 'Usage incremented successfully'
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get feature access logs (admin only)
  fastify.get('/v1/subscription/logs/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { limit = 50, feature } = request.query as { limit?: string; feature?: string };
      
      // This would typically require admin authentication
      const logs = await subscriptionService.getFeatureAccessLogs(
        userId, 
        parseInt(limit), 
        feature
      );
      
      return reply.send({
        status: 'success',
        data: logs
      });
    } catch (error) {
      console.error('Error getting feature access logs:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Example of a protected route using feature access middleware
  fastify.post('/v1/subscription/protected/ai-recommendations', {
    preHandler: featureAccessMiddleware({
      feature: 'ai_recommendations',
      incrementUsage: true,
      customErrorMessage: 'AI recommendations are limited in your current plan. Upgrade to Pro for unlimited access!'
    })
  }, async (request, reply) => {
    try {
      // Your AI recommendations logic here
      const result = {
        recommendations: [
          { name: 'Eiffel Tower', score: 0.95 },
          { name: 'Louvre Museum', score: 0.88 },
          { name: 'Notre-Dame Cathedral', score: 0.82 }
        ]
      };
      
      // Increment usage after successful operation
      await incrementFeatureUsage(request);
      
      return reply.send({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Example of a protected route for auto-optimize (Pro+ feature)
  fastify.post('/v1/subscription/protected/auto-optimize', {
    preHandler: featureAccessMiddleware({
      feature: 'auto_optimize',
      requireActiveSubscription: true,
      customErrorMessage: 'Auto-optimize is a Pro feature. Upgrade to unlock advanced itinerary optimization!'
    })
  }, async (request, reply) => {
    try {
      // Your auto-optimize logic here
      const result = {
        optimized: true,
        healthScore: 85,
        improvements: ['Better pacing', 'Budget optimization']
      };
      
      return reply.send({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error auto-optimizing itinerary:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });
}
