import { FastifyRequest, FastifyReply } from 'fastify';
import { subscriptionService } from '../services/subscription_service';

export interface FeatureAccessOptions {
  feature: string;
  incrementUsage?: boolean;
  requireActiveSubscription?: boolean;
  customErrorMessage?: string;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  isExceeded: boolean;
  usageLimit?: any;
  errorMessage?: string;
}

// Decorator function for checking feature access
export function requiresFeature(options: FeatureAccessOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (request: FastifyRequest, reply: FastifyReply, ...args: any[]) {
      try {
        // Extract user ID from request (adjust based on your auth implementation)
        const userId = (request.user as any)?.id || (request.query as any)?.userId;
        
        if (!userId) {
          return reply.status(401).send({
            status: 'error',
            message: 'Authentication required'
          });
        }

        // Check if subscription is active (if required)
        if (options.requireActiveSubscription) {
          const isActive = await subscriptionService.isSubscriptionActive(userId);
          if (!isActive) {
            await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
              reason: 'inactive_subscription'
            });
            
            return reply.status(403).send({
              status: 'error',
              message: options.customErrorMessage || 'Active subscription required for this feature',
              code: 'SUBSCRIPTION_REQUIRED',
              feature: options.feature
            });
          }
        }

        // Check feature access
        const hasAccess = await subscriptionService.hasFeatureAccess(userId, options.feature);
        
        if (!hasAccess) {
          await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
            reason: 'tier_not_supported'
          });
          
          return reply.status(403).send({
            status: 'error',
            message: options.customErrorMessage || 'This feature is not available in your current plan',
            code: 'FEATURE_NOT_AVAILABLE',
            feature: options.feature
          });
        }

        // Check usage limits
        const usageLimit = await subscriptionService.checkUsageLimit(userId, options.feature);
        
        if (usageLimit.isExceeded) {
          await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
            reason: 'usage_limit_exceeded',
            current: usageLimit.current,
            limit: usageLimit.limit
          });
          
          return reply.status(429).send({
            status: 'error',
            message: options.customErrorMessage || 'Usage limit exceeded for this feature',
            code: 'USAGE_LIMIT_EXCEEDED',
            feature: options.feature,
            usage: {
              current: usageLimit.current,
              limit: usageLimit.limit,
              resetDate: usageLimit.resetDate
            }
          });
        }

        // Increment usage if requested
        if (options.incrementUsage) {
          await subscriptionService.incrementUsage(userId, options.feature);
        }

        // Log successful access
        await subscriptionService.logFeatureAccess(userId, options.feature, 'allowed');

        // Call the original method
        return originalMethod.apply(this, [request, reply, ...args]);
        
      } catch (error) {
        console.error('Feature access check failed:', error);
        return reply.status(500).send({
          status: 'error',
          message: 'Internal server error during feature access check'
        });
      }
    };

    return descriptor;
  };
}

// Middleware for checking feature access
export function featureAccessMiddleware(options: FeatureAccessOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract user ID from request
      const userId = (request.user as any)?.id || (request.query as any)?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          status: 'error',
          message: 'Authentication required'
        });
      }

      // Check subscription status
      if (options.requireActiveSubscription) {
        const isActive = await subscriptionService.isSubscriptionActive(userId);
        if (!isActive) {
          await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
            reason: 'inactive_subscription'
          });
          
          return reply.status(403).send({
            status: 'error',
            message: options.customErrorMessage || 'Active subscription required for this feature',
            code: 'SUBSCRIPTION_REQUIRED',
            feature: options.feature
          });
        }
      }

      // Check feature access
      const hasAccess = await subscriptionService.hasFeatureAccess(userId, options.feature);
      
      if (!hasAccess) {
        await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
          reason: 'tier_not_supported'
        });
        
        return reply.status(403).send({
          status: 'error',
          message: options.customErrorMessage || 'This feature is not available in your current plan',
          code: 'FEATURE_NOT_AVAILABLE',
          feature: options.feature
        });
      }

      // Check usage limits
      const usageLimit = await subscriptionService.checkUsageLimit(userId, options.feature);
      
      if (usageLimit.isExceeded) {
        await subscriptionService.logFeatureAccess(userId, options.feature, 'blocked', {
          reason: 'usage_limit_exceeded',
          current: usageLimit.current,
          limit: usageLimit.limit
        });
        
        return reply.status(429).send({
          status: 'error',
          message: options.customErrorMessage || 'Usage limit exceeded for this feature',
          code: 'USAGE_LIMIT_EXCEEDED',
          feature: options.feature,
          usage: {
            current: usageLimit.current,
            limit: usageLimit.limit,
            resetDate: usageLimit.resetDate
          }
        });
      }

      // Add usage info to request for later use
      (request as any).featureUsage = {
        feature: options.feature,
        usageLimit,
        incrementUsage: options.incrementUsage
      };

    } catch (error) {
      console.error('Feature access middleware failed:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error during feature access check'
      });
    }
  };
}

// Utility function to increment usage after successful operation
export async function incrementFeatureUsage(request: FastifyRequest, featureName?: string): Promise<void> {
  const featureUsage = (request as any).featureUsage;
  const userId = (request.user as any)?.id || (request.query as any)?.userId;
  
  if (!userId) return;
  
  const feature = featureName || featureUsage?.feature;
  if (feature && featureUsage?.incrementUsage) {
    await subscriptionService.incrementUsage(userId, feature);
  }
}

// Utility function to check feature access without middleware
export async function checkFeatureAccess(
  userId: string, 
  featureName: string, 
  requireActiveSubscription: boolean = false
): Promise<FeatureAccessResult> {
  try {
    // Check subscription status
    if (requireActiveSubscription) {
      const isActive = await subscriptionService.isSubscriptionActive(userId);
      if (!isActive) {
        await subscriptionService.logFeatureAccess(userId, featureName, 'blocked', {
          reason: 'inactive_subscription'
        });
        
        return {
          hasAccess: false,
          isExceeded: false,
          errorMessage: 'Active subscription required for this feature'
        };
      }
    }

    // Check feature access
    const hasAccess = await subscriptionService.hasFeatureAccess(userId, featureName);
    
    if (!hasAccess) {
      await subscriptionService.logFeatureAccess(userId, featureName, 'blocked', {
        reason: 'tier_not_supported'
      });
      
      return {
        hasAccess: false,
        isExceeded: false,
        errorMessage: 'This feature is not available in your current plan'
      };
    }

    // Check usage limits
    const usageLimit = await subscriptionService.checkUsageLimit(userId, featureName);
    
    if (usageLimit.isExceeded) {
      await subscriptionService.logFeatureAccess(userId, featureName, 'blocked', {
        reason: 'usage_limit_exceeded',
        current: usageLimit.current,
        limit: usageLimit.limit
      });
      
      return {
        hasAccess: false,
        isExceeded: true,
        usageLimit,
        errorMessage: 'Usage limit exceeded for this feature'
      };
    }

    return {
      hasAccess: true,
      isExceeded: false,
      usageLimit
    };
    
  } catch (error) {
    console.error('Feature access check failed:', error);
    return {
      hasAccess: false,
      isExceeded: false,
      errorMessage: 'Internal server error during feature access check'
    };
  }
}
