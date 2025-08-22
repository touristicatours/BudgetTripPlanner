import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openai, SYSTEM_PROMPT } from './lib/openai.js';
import { itineraryRequestSchema, itineraryResponseSchema } from './lib/schemas.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint - show server is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'BudgetTripPlanner Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      itinerary: '/api/itinerary',
      'itinerary-test': '/api/itinerary/test',
      bookings: '/api/bookings'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Itinerary generation endpoint
app.post('/api/itinerary', async (req, res) => {
  try {
    // Validate request
    const validationResult = itineraryRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;
    
    // Calculate total days
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }

    const dailyBudgetTarget = data.budgetTotal / totalDays;
    const currency = data.currency || 'USD';

    // Create the prompt for OpenAI
    const userPrompt = `Create a detailed day-by-day itinerary for a trip to ${data.destination} from ${data.startDate} to ${data.endDate}.

Trip Details:
- Destination: ${data.destination}
- Start Date: ${data.startDate}
- End Date: ${data.endDate}
- Total Days: ${totalDays}
- Budget Total: ${data.budgetTotal} ${currency}
- Daily Budget Target: ${dailyBudgetTarget.toFixed(2)} ${currency}
- Travelers: ${data.travelers}
- Pace: ${data.pace}
- Interests: ${data.interests.join(', ')}
- Must See: ${data.mustSee.join(', ')}

Requirements:
- Keep each day's subtotal within ±15% of the daily budget target
- Include lunch and dinner suggestions each day
- Include 1-2 major sights per day
- Include at least one free/low-cost option per day
- Respect must-see items and schedule them optimally
- Use realistic timing and logical order of activities
- Consider the pace (${data.pace}) when planning activities
- Fill lat/lng as null for now

Return ONLY valid JSON matching this exact schema:
{
  "currency": "${currency}",
  "totalDays": ${totalDays},
  "dailyBudgetTarget": ${dailyBudgetTarget},
  "estimatedTotal": number,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "summary": "string",
      "items": [
        {
          "time": "HH:MM",
          "title": "string",
          "category": "food|sightseeing|activity|transport|rest",
          "lat": null,
          "lng": null,
          "estCost": number,
          "notes": "string",
          "booking": {
            "type": "flight|hotel|tour|ticket|none",
            "operator": null,
            "externalUrl": null,
            "id": null
          }
        }
      ],
      "subtotal": number
    }
  ]
}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let itineraryData;
    try {
      itineraryData = JSON.parse(responseContent);
    } catch (error) {
      // If JSON parsing fails, try to fix it and retry once
      const retryPrompt = `${userPrompt}\n\nFix the JSON response to match the exact schema. Return ONLY valid JSON:`;
      
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: retryPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const retryContent = retryCompletion.choices[0]?.message?.content;
      if (!retryContent) {
        throw new Error('No response from OpenAI retry');
      }

      itineraryData = JSON.parse(retryContent);
    }

    // Validate the response
    const responseValidation = itineraryResponseSchema.safeParse(itineraryData);
    if (!responseValidation.success) {
      return res.status(500).json({
        error: 'Invalid response format',
        details: responseValidation.error.errors
      });
    }

    res.json(itineraryData);

  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint that works without OpenAI
app.post('/api/itinerary/test', (req, res) => {
  try {
    const data = req.body;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyBudgetTarget = data.budgetTotal / totalDays;
    const currency = data.currency || 'USD';

    // Generate a sample itinerary
    const sampleItinerary = {
      currency: currency,
      totalDays: totalDays,
      dailyBudgetTarget: dailyBudgetTarget,
      estimatedTotal: data.budgetTotal * 0.95,
      days: Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          summary: `Day ${i + 1} in ${data.destination}`,
          items: [
            {
              time: "09:00",
              title: "Breakfast at local café",
              category: "food",
              lat: null,
              lng: null,
              estCost: 15,
              notes: "Start the day with a local breakfast",
              booking: {
                type: "none",
                operator: null,
                externalUrl: null,
                id: null
              }
            },
            {
              time: "10:30",
              title: "Visit main attraction",
              category: "sightseeing",
              lat: null,
              lng: null,
              estCost: 25,
              notes: "Explore the main sights",
              booking: {
                type: "ticket",
                operator: null,
                externalUrl: null,
                id: null
              }
            },
            {
              time: "13:00",
              title: "Lunch at restaurant",
              category: "food",
              lat: null,
              lng: null,
              estCost: 30,
              notes: "Enjoy local cuisine",
              booking: {
                type: "none",
                operator: null,
                externalUrl: null,
                id: null
              }
            }
          ],
          subtotal: 70
        };
      })
    };

    res.json(sampleItinerary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate test itinerary', message: error.message });
  }
});

// Mock data endpoints for testing
app.get('/api/bookings', (req, res) => {
  res.json([
    {
      id: 'booking_1',
      type: 'flight',
      serviceName: 'Sample Flight',
      price: 299,
      travelers: 2,
      dates: { start: '2025-09-10', end: '2025-09-13' },
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      confirmationCode: 'ABC123'
    }
  ]);
});

app.post('/api/bookings', (req, res) => {
  const booking = {
    id: `booking_${Date.now()}`,
    ...req.body,
    status: 'pending',
    bookingDate: new Date().toISOString(),
    confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
  };
  res.json({ success: true, booking });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗺️  Itinerary API: http://localhost:${PORT}/api/itinerary`);
});


