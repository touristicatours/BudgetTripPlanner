import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { proactiveTipsService } from '../services/proactive_tips_service';
import { weatherService } from '../services/weather_service';

interface GenerateTipsRequest {
  Body: {
    itinerary: any;
    user_profile: any;
    destination?: string;
  };
}

interface ApplyTipRequest {
  Body: {
    itinerary: any;
    user_profile: any;
    tip: any;
  };
}

export async function proactiveTipsRoutes(fastify: FastifyInstance) {
  // Generate proactive tips for an itinerary
  fastify.post<GenerateTipsRequest>('/v1/proactive-tips/generate', async (request, reply) => {
    try {
      const { itinerary, user_profile, destination } = request.body;

      if (!itinerary || !user_profile) {
        return reply.status(400).send({
          status: 'error',
          message: 'itinerary and user_profile are required'
        });
      }

      let weatherForecast = null;

      // Get weather forecast if destination is provided
      if (destination) {
        const coordinates = await weatherService.getCoordinatesForCity(destination);
        if (coordinates) {
          weatherForecast = await weatherService.getWeatherForecast(
            coordinates.lat,
            coordinates.lon,
            7 // 7 days forecast
          );
        }
      }

      const result = await proactiveTipsService.generateProactiveTips(
        itinerary,
        user_profile,
        weatherForecast
      );

      if (result.status === 'success') {
        return reply.send({
          status: 'success',
          tips: result.tips,
          weather_forecast: weatherForecast
        });
      } else {
        return reply.status(500).send({
          status: 'error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error generating proactive tips:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Apply a specific tip to modify the itinerary
  fastify.post<ApplyTipRequest>('/v1/proactive-tips/apply', async (request, reply) => {
    try {
      const { itinerary, user_profile, tip } = request.body;

      if (!itinerary || !user_profile || !tip) {
        return reply.status(400).send({
          status: 'error',
          message: 'itinerary, user_profile, and tip are required'
        });
      }

      // Apply the tip based on its action_type
      const modifiedItinerary = await applyTipToItinerary(itinerary, tip, user_profile);

      return reply.send({
        status: 'success',
        modified_itinerary: modifiedItinerary,
        applied_tip: tip
      });
    } catch (error) {
      console.error('Error applying tip:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Get weather forecast for a destination
  fastify.get('/v1/weather/:destination', async (request, reply) => {
    try {
      const { destination } = request.params as { destination: string };

      if (!destination) {
        return reply.status(400).send({
          status: 'error',
          message: 'destination parameter is required'
        });
      }

      const coordinates = await weatherService.getCoordinatesForCity(destination);
      
      if (!coordinates) {
        return reply.status(404).send({
          status: 'error',
          message: 'Destination not found'
        });
      }

      const forecast = await weatherService.getWeatherForecast(
        coordinates.lat,
        coordinates.lon,
        7
      );

      return reply.send({
        status: 'success',
        destination,
        coordinates,
        forecast
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  // Health check for proactive tips service
  fastify.get('/v1/proactive-tips/health', async (request, reply) => {
    try {
      const isAvailable = await proactiveTipsService.isAvailable();
      
      return reply.send({
        status: 'success',
        service: 'proactive_tips',
        available: isAvailable,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking proactive tips health:', error);
      return reply.status(500).send({
        status: 'error',
        message: 'Health check failed'
      });
    }
  });
}

async function applyTipToItinerary(itinerary: any, tip: any, userProfile: any): Promise<any> {
  const modifiedItinerary = JSON.parse(JSON.stringify(itinerary)); // Deep copy
  
  switch (tip.action_type) {
    case 'reschedule_outdoor':
      // Move outdoor activities to indoor alternatives or different times
      return await rescheduleOutdoorActivities(modifiedItinerary, tip.action_data);
      
    case 'suggest_transport':
      // Add transportation suggestions between activities
      return addTransportationSuggestions(modifiedItinerary, tip.action_data);
      
    case 'suggest_alternatives':
      // Replace expensive activities with cheaper alternatives
      return await suggestBudgetAlternatives(modifiedItinerary, tip.action_data, userProfile);
      
    case 'suggest_reservation':
      // Add reservation note to the activity
      return addReservationNote(modifiedItinerary, tip.action_data);
      
    case 'suggest_booking':
      // Add booking note to the activity
      return addBookingNote(modifiedItinerary, tip.action_data);
      
    case 'suggest_family_alternative':
      // Replace adult activities with family-friendly alternatives
      return await suggestFamilyAlternatives(modifiedItinerary, tip.action_data);
      
    case 'suggest_accessible_alternative':
      // Replace activities with accessibility issues
      return await suggestAccessibleAlternatives(modifiedItinerary, tip.action_data);
      
    default:
      // For unknown action types, just add a note to the itinerary
      return addTipNote(modifiedItinerary, tip);
  }
}

async function rescheduleOutdoorActivities(itinerary: any, actionData: any): Promise<any> {
  const { day_date, outdoor_activities, indoor_activities } = actionData;
  
  // Find the day and add a note about rescheduling
  for (const day of itinerary.days) {
    if (day.date === day_date) {
      day.weather_note = `⚠️ Weather alert: Consider rescheduling outdoor activities due to expected rain.`;
      day.suggested_changes = {
        type: 'weather_reschedule',
        outdoor_activities,
        indoor_activities
      };
      break;
    }
  }
  
  return itinerary;
}

function addTransportationSuggestions(itinerary: any, actionData: any): any {
  const { from_activity, to_activity, time_gap } = actionData;
  
  // Add transportation note to the itinerary
  if (!itinerary.transportation_notes) {
    itinerary.transportation_notes = [];
  }
  
  itinerary.transportation_notes.push({
    from: from_activity,
    to: to_activity,
    time_gap,
    suggestion: `Consider booking transportation in advance for this tight connection.`
  });
  
  return itinerary;
}

async function suggestBudgetAlternatives(itinerary: any, actionData: any, userProfile: any): Promise<any> {
  const { expensive_activities, daily_budget, day_total } = actionData;
  
  // Add budget optimization note
  if (!itinerary.budget_notes) {
    itinerary.budget_notes = [];
  }
  
  itinerary.budget_notes.push({
    day_total,
    daily_budget,
    expensive_activities,
    suggestion: `Consider cheaper alternatives for expensive activities to stay within budget.`
  });
  
  return itinerary;
}

function addReservationNote(itinerary: any, actionData: any): any {
  const { activity_name, rating, review_count } = actionData;
  
  // Find the activity and add reservation note
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.name === activity_name) {
        activity.reservation_note = `🍽️ Highly rated (${rating}★, ${review_count} reviews) - Consider making a reservation.`;
        break;
      }
    }
  }
  
  return itinerary;
}

function addBookingNote(itinerary: any, actionData: any): any {
  const { activity_name, rating, review_count } = actionData;
  
  // Find the activity and add booking note
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.name === activity_name) {
        activity.booking_note = `🎫 Very popular (${rating}★, ${review_count} reviews) - Book tickets in advance to avoid lines.`;
        break;
      }
    }
  }
  
  return itinerary;
}

async function suggestFamilyAlternatives(itinerary: any, actionData: any): Promise<any> {
  const { activity_name, activity_type } = actionData;
  
  // Add family-friendly note
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.name === activity_name) {
        activity.family_note = `👶 This activity might not be suitable for children. Consider family-friendly alternatives.`;
        break;
      }
    }
  }
  
  return itinerary;
}

async function suggestAccessibleAlternatives(itinerary: any, actionData: any): Promise<any> {
  const { activity_name, activity_type } = actionData;
  
  // Add accessibility note
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.name === activity_name) {
        activity.accessibility_note = `♿ This activity might have accessibility challenges. Check for accessible alternatives.`;
        break;
      }
    }
  }
  
  return itinerary;
}

function addTipNote(itinerary: any, tip: any): any {
  // Add a general note about the tip
  if (!itinerary.ai_tips) {
    itinerary.ai_tips = [];
  }
  
  itinerary.ai_tips.push({
    message: tip.message,
    severity: tip.severity,
    type: tip.type
  });
  
  return itinerary;
}
