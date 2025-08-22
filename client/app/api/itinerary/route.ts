import { NextRequest, NextResponse } from 'next/server';
import { openai, SYSTEM_PROMPT } from '@/lib/openai';
import { itineraryRequestSchema, itineraryResponseSchema } from '@/lib/schemas';
import type { ItineraryRequest, ItineraryResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = itineraryRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data: ItineraryRequest = validationResult.data;
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          message: 'Please set OPENAI_API_KEY in your environment variables to use this feature.',
          tip: 'You can use the test endpoint /api/itinerary/test for demo purposes'
        },
        { status: 503 }
      );
    }
    
    // Calculate total days
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const dailyBudgetTarget = data.budgetTotal / totalDays;

    // Create the prompt for OpenAI
    const userPrompt = `Create a detailed day-by-day itinerary for a trip to ${data.destination} from ${data.startDate} to ${data.endDate}.

Trip Details:
- Destination: ${data.destination}
- Start Date: ${data.startDate}
- End Date: ${data.endDate}
- Total Days: ${totalDays}
- Budget Total: ${data.budgetTotal} (${data.currency || 'USD'})
- Daily Budget Target: ${dailyBudgetTarget.toFixed(2)} (${data.currency || 'USD'})
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
  "currency": "string",
  "totalDays": number,
  "dailyBudgetTarget": number,
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
    let itineraryData: ItineraryResponse;
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
      return NextResponse.json(
        { error: 'Invalid response format', details: responseValidation.error.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(itineraryData);

  } catch (error) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
