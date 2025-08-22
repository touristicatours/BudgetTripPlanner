import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthScoringService } from '../services/health_scoring_service';
import { logger } from '../lib/logger';

interface HealthScoreRequest {
  itinerary: any;
  user_profile: any;
}

interface AutoOptimizeRequest {
  itinerary: any;
  user_profile: any;
  available_activities: any[];
  max_iterations?: number;
}

export async function healthScoringRoutes(fastify: FastifyInstance) {
  /**
   * Calculate health score for an itinerary
   */
  fastify.post('/v1/health-scoring/calculate', {
    schema: {
      body: {
        type: 'object',
        required: ['itinerary', 'user_profile'],
        properties: {
          itinerary: { type: 'object' },
          user_profile: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            health_score: {
              type: 'object',
              properties: {
                overall_score: { type: 'number' },
                health_status: { type: 'string' },
                breakdown: { type: 'object' },
                total_score: { type: 'number' },
                max_score: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: HealthScoreRequest }>, reply: FastifyReply) => {
    try {
      const { itinerary, user_profile } = request.body;
      
      logger.info('Health score calculation request', {
        destination: itinerary.destination,
        days: itinerary.days?.length || 0
      });

      const healthScore = await healthScoringService.calculateHealthScore(itinerary, user_profile);
      
      return {
        status: 'success',
        health_score: healthScore
      };
    } catch (error) {
      logger.error('Error calculating health score:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to calculate health score',
        error: error.message
      });
    }
  });

  /**
   * Auto-optimize an itinerary
   */
  fastify.post('/v1/health-scoring/optimize', {
    schema: {
      body: {
        type: 'object',
        required: ['itinerary', 'user_profile', 'available_activities'],
        properties: {
          itinerary: { type: 'object' },
          user_profile: { type: 'object' },
          available_activities: { type: 'array' },
          max_iterations: { type: 'number', default: 5 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            optimization_result: {
              type: 'object',
              properties: {
                itinerary: { type: 'object' },
                health_score: { type: 'object' },
                optimizations_applied: { type: 'number' },
                improvement: { type: 'number' },
                original_score: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AutoOptimizeRequest }>, reply: FastifyReply) => {
    try {
      const { itinerary, user_profile, available_activities, max_iterations = 5 } = request.body;
      
      logger.info('Auto-optimization request', {
        destination: itinerary.destination,
        available_activities: available_activities.length,
        max_iterations
      });

      const optimizationResult = await healthScoringService.autoOptimize(
        itinerary,
        user_profile,
        available_activities,
        max_iterations
      );
      
      return {
        status: 'success',
        optimization_result: optimizationResult
      };
    } catch (error) {
      logger.error('Error during auto-optimization:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to auto-optimize itinerary',
        error: error.message
      });
    }
  });

  /**
   * Health check for health scoring service
   */
  fastify.get('/v1/health-scoring/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isAvailable = await healthScoringService.isAvailable();
      
      return {
        status: 'success',
        available: isAvailable,
        service: 'health_scoring'
      };
    } catch (error) {
      logger.error('Health scoring service health check failed:', error);
      return reply.status(500).send({
        status: 'error',
        available: false,
        service: 'health_scoring',
        error: error.message
      });
    }
  });
}
