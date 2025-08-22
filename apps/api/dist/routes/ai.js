"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = aiRoutes;
const zod_1 = require("zod");
const itinerary_service_1 = require("../services/itinerary_service");
const QASchema = zod_1.z.object({
    tripId: zod_1.z.string(),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(["user", "assistant"]),
        content: zod_1.z.string(),
    })),
});
const ItineraryRequestSchema = zod_1.z.object({
    tripId: zod_1.z.string(),
    destination: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    travelers: zod_1.z.number().optional(),
    budgetTotal: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    pace: zod_1.z.enum(['relaxed', 'moderate', 'fast']).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    dietary: zod_1.z.array(zod_1.z.string()).optional(),
    mustSee: zod_1.z.array(zod_1.z.string()).optional(),
});
// Mock data for when OpenAI is not available
const mockAIResponses = {
    greeting: "Hi! I'm your AI travel assistant. I can help you plan the perfect trip! What's your budget for this adventure?",
    budgetQuestion: "Great! I understand you want to go to Paris. What's your budget for this adventure?",
    interestsQuestion: "What are your main interests? (e.g., art, food, history, shopping, nightlife)",
    dietaryQuestion: "Do you have any dietary restrictions or preferences?",
    paceQuestion: "How would you describe your travel pace? (relaxed, moderate, or fast-paced)",
    confirmation: "Perfect! I have all the information I need. Let me create a personalized itinerary for your trip to Paris!"
};
const mockItinerary = {
    currency: "USD",
    estimatedTotal: 1250,
    days: [
        {
            date: "2024-06-15",
            summary: "Arrival and first day in Paris",
            subtotal: 450,
            items: [
                {
                    time: "10:00",
                    title: "Flight to Paris",
                    category: "flight",
                    durationMin: 270,
                    estCost: 450,
                    notes: "Direct flight from NYC to Paris",
                    booking: {
                        type: "flight",
                        operator: "Air France",
                        url: "https://www.kiwi.com/us/booking?token=mock-token-1"
                    }
                },
                {
                    time: "14:30",
                    title: "Check-in at Hotel",
                    category: "hotel",
                    durationMin: 30,
                    estCost: 0,
                    notes: "Check-in at Luxury Hotel in Paris",
                    booking: {
                        type: "hotel",
                        operator: "Luxury Hotel",
                        url: "https://www.booking.com/hotel/fr/luxury-paris"
                    }
                },
                {
                    time: "16:00",
                    title: "Eiffel Tower Visit",
                    category: "sightseeing",
                    durationMin: 90,
                    estCost: 45,
                    notes: "Skip-the-line access to Eiffel Tower",
                    booking: {
                        type: "ticket",
                        operator: "GetYourGuide",
                        url: "https://www.getyourguide.com/paris-l16/eiffel-tower-summit"
                    }
                }
            ]
        }
    ]
};
async function aiRoutes(fastify) {
    // POST /v1/ai/qa - Conversational Q&A to collect preferences
    fastify.post("/qa", {}, async (request, reply) => {
        const { tripId, messages } = request.body;
        try {
            // Check if OpenAI is available
            if (!process.env.OPENAI_API_KEY) {
                // Return mock response
                const lastMessage = messages[messages.length - 1];
                let response = mockAIResponses.confirmation;
                if (lastMessage && lastMessage.role === 'user') {
                    const lowerContent = lastMessage.content.toLowerCase();
                    if (lowerContent.includes('budget') || lowerContent.includes('cost')) {
                        response = mockAIResponses.budgetQuestion;
                    }
                    else if (lowerContent.includes('interest')) {
                        response = mockAIResponses.interestsQuestion;
                    }
                    else if (lowerContent.includes('diet')) {
                        response = mockAIResponses.dietaryQuestion;
                    }
                    else if (lowerContent.includes('pace')) {
                        response = mockAIResponses.paceQuestion;
                    }
                }
                return {
                    followUpQuestions: [response],
                    collected: {
                        destination: "Paris",
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        travelers: 2,
                        currency: "USD",
                        budgetTotal: 5000,
                        pace: "moderate",
                        interests: ["art", "food", "history"],
                        dietary: [],
                        mustSee: ["Eiffel Tower", "Louvre"]
                    },
                };
            }
            // If OpenAI is available, use it (but for now, return mock)
            return {
                followUpQuestions: [mockAIResponses.confirmation],
                collected: {
                    destination: "Paris",
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    travelers: 2,
                    currency: "USD",
                    budgetTotal: 5000,
                    pace: "moderate",
                    interests: ["art", "food", "history"],
                    dietary: [],
                    mustSee: ["Eiffel Tower", "Louvre"]
                },
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to process Q&A request" });
        }
    });
    // POST /v1/ai/itinerary - Generate itinerary with real-time place data
    fastify.post("/itinerary", {}, async (request, reply) => {
        const requestData = request.body;
        try {
            // If we have complete itinerary data, use the new service
            if (requestData.destination && requestData.startDate && requestData.endDate) {
                const itineraryRequest = {
                    destination: requestData.destination,
                    startDate: requestData.startDate,
                    endDate: requestData.endDate,
                    travelers: requestData.travelers || 2,
                    budgetTotal: requestData.budgetTotal || 1000,
                    currency: requestData.currency || 'USD',
                    pace: requestData.pace || 'moderate',
                    interests: requestData.interests || [],
                    dietary: requestData.dietary || [],
                    mustSee: requestData.mustSee || [],
                };
                const itinerary = await itinerary_service_1.itineraryService.generateItinerary(itineraryRequest);
                return {
                    ...itinerary,
                    provider: 'places-service',
                    message: 'Itinerary generated with real-time place data'
                };
            }
            // Fallback to mock data if incomplete information
            return {
                ...mockItinerary,
                provider: 'mock',
                message: 'Using mock data due to incomplete request parameters'
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: "Failed to generate itinerary" });
        }
    });
}
