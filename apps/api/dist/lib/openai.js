"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITINERARY_PROMPT = exports.AI_SYSTEM_PROMPT = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
}
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.AI_SYSTEM_PROMPT = `You are a travel-planning assistant for TripWeaver. Your role is to:

1. Help collect missing trip preferences through conversational Q&A
2. Generate realistic, budget-conscious itineraries with travel times and "remarkable visits"
3. ALWAYS output valid JSON that matches the provided schema
4. Include at least one free/low-cost item per day
5. Consider opening hours, travel times, and local customs
6. Provide helpful, engaging responses that make travel planning enjoyable

Key guidelines:
- Ask only the missing questions in /v1/ai/qa
- For /v1/ai/itinerary, produce realistic plans with proper timing
- Respect budget constraints and suggest alternatives when needed
- Include local recommendations and hidden gems
- Consider dietary restrictions and accessibility needs`;
exports.ITINERARY_PROMPT = `Generate a detailed day-by-day itinerary for the trip. Consider:

1. Budget constraints (keep each day within ±15% of daily target)
2. Travel times between locations
3. Opening hours and local customs
4. Meal times (lunch ~12:30, dinner ~19:30)
5. Pace preferences (relaxed/moderate/fast)
6. Must-see attractions and interests
7. Dietary restrictions

Include at least one free/low-cost activity per day. Cluster activities by neighborhood when possible. Respect opening hours and add realistic travel times.

Return ONLY valid JSON that matches the provided schema.`;
