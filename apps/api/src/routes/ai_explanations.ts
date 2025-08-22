import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { aiExplanationService } from '../services/ai_explanation_service';
import { logger } from '../lib/logger';

interface GenerateExplanationRequest {
  Body: {
    activity: any;
    userProfile: any;
    decisionFactors?: any;
  };
}

interface GenerateSummaryRequest {
  Body: {
    userProfile: any;
    destination: string;
    totalActivities: number;
    dataPoints?: number;
  };
}

export default async function aiExplanationsRoutes(fastify: FastifyInstance) {
  /**
   * Generate AI explanation for an activity recommendation
   */
  fastify.post<GenerateExplanationRequest>('/v1/ai/explain', {
    schema: {
      body: {
        type: 'object',
        required: ['activity', 'userProfile'],
        properties: {
          activity: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              rating: { type: 'number' },
              price_level: { type: 'number' },
              types: { type: 'array', items: { type: 'string' } },
              formatted_address: { type: 'string' },
              user_ratings_total: { type: 'number' }
            }
          },
          userProfile: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              interests: { type: 'array', items: { type: 'string' } },
              budget: { type: 'number' },
              pace: { type: 'string' }
            }
          },
          decisionFactors: {
            type: 'object',
            properties: {
              ml_score: { type: 'number' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            explanation: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { activity, userProfile, decisionFactors } = request.body;

      logger.info('Generating AI explanation', {
        activityName: activity?.name,
        userId: userProfile?.userId
      });

      const explanation = await aiExplanationService.generateExplanation({
        activity,
        userProfile,
        decisionFactors
      });

      return reply.send({ explanation });
    } catch (error) {
      logger.error('Failed to generate AI explanation', { error: error.message });
      return reply.status(500).send({
        error: 'Failed to generate AI explanation',
        message: error.message
      });
    }
  });

  /**
   * Generate itinerary summary explaining how the itinerary was built
   */
  fastify.post<GenerateSummaryRequest>('/v1/ai/summary', {
    schema: {
      body: {
        type: 'object',
        required: ['userProfile', 'destination', 'totalActivities'],
        properties: {
          userProfile: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              interests: { type: 'array', items: { type: 'string' } },
              budget: { type: 'number' },
              pace: { type: 'string' }
            }
          },
          destination: { type: 'string' },
          totalActivities: { type: 'number' },
          dataPoints: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                optimized_for: { type: 'array', items: { type: 'string' } },
                based_on: { type: 'array', items: { type: 'string' } },
                total_activities: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userProfile, destination, totalActivities, dataPoints } = request.body;

      logger.info('Generating itinerary summary', {
        destination,
        totalActivities,
        userId: userProfile?.userId
      });

      const summary = await aiExplanationService.generateItinerarySummary({
        userProfile,
        destination,
        totalActivities,
        dataPoints
      });

      return reply.send({ summary });
    } catch (error) {
      logger.error('Failed to generate itinerary summary', { error: error.message });
      return reply.status(500).send({
        error: 'Failed to generate itinerary summary',
        message: error.message
      });
    }
  });

  /**
   * Health check for AI explanation service
   */
  fastify.get('/v1/ai/explanations/health', async (request, reply) => {
    try {
      // Test with a simple explanation request
      const testExplanation = await aiExplanationService.generateExplanation({
        activity: {
          name: 'Test Activity',
          rating: 4.5,
          price_level: 2,
          types: ['restaurant']
        },
        userProfile: {
          interests: ['food'],
          budget: 2
        }
      });

      return reply.send({
        status: 'healthy',
        message: 'AI explanation service is working',
        testExplanation
      });
    } catch (error) {
      logger.error('AI explanation service health check failed', { error: error.message });
      return reply.status(503).send({
        status: 'unhealthy',
        message: 'AI explanation service is not responding',
        error: error.message
      });
    }
  });
}
