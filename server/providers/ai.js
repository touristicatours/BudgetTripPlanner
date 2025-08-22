/* AI Chat provider using OpenAI SDK for trip planning assistance */
import OpenAI from 'openai';

export async function chatWithAI(message, conversationHistory = []) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      response: getMockAIResponse(message),
      live: false,
      notice: 'OPENAI_API_KEY missing — using mock AI responses.'
    };
  }

  try {
    const client = new OpenAI({
      apiKey: apiKey
    });

    const systemPrompt = `You are a helpful travel planning assistant for BudgetTripPlanner. Your role is to:

1. Help users refine their trip planning requests
2. Suggest destinations, activities, and travel tips
3. Provide budget-friendly recommendations
4. Ask clarifying questions to better understand their needs
5. Suggest search parameters (dates, travelers, preferences)

Keep responses concise, friendly, and actionable. Focus on helping users get better search results.

Current context: The user is planning a trip and needs assistance with their request.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = response.choices[0].message.content;

    return {
      response: aiResponse,
      live: true,
      notice: 'AI assistance provided via OpenAI GPT-4.'
    };
  } catch (error) {
    console.error('AI chat error:', error.message);
    
    // Handle quota exceeded specifically
    if (error.message.includes('429') || error.message.includes('quota')) {
      return {
        response: getMockAIResponse(message),
        live: false,
        notice: 'OpenAI quota exceeded — using mock responses. Please check your billing.'
      };
    }
    
    return {
      response: getMockAIResponse(message),
      live: false,
      notice: 'AI service unavailable — using mock responses.'
    };
  }
}

export async function enhanceSearchRequest(userRequest, currentParams = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      enhancedParams: getMockEnhancedParams(userRequest, currentParams),
      suggestions: getMockSuggestions(userRequest),
      live: false,
      notice: 'OPENAI_API_KEY missing — using mock enhancement.'
    };
  }

  try {
    const client = new OpenAI({
      apiKey: apiKey
    });

    const systemPrompt = `You are a travel search enhancement assistant. Analyze the user's request and current search parameters to suggest improvements.

Current search parameters: ${JSON.stringify(currentParams)}

Your task:
1. Extract or suggest destination, dates, travelers, budget preferences
2. Provide 3-5 specific search suggestions
3. Return a JSON object with enhanced parameters and suggestions

Format your response as valid JSON:
{
  "enhancedParams": {
    "destination": "suggested destination",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD", 
    "travelers": number,
    "budget": "low|medium|high"
  },
  "suggestions": [
    "specific search suggestion 1",
    "specific search suggestion 2",
    "specific search suggestion 3"
  ]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userRequest }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const aiResponse = response.choices[0].message.content;

    try {
      const parsed = JSON.parse(aiResponse);
      return {
        enhancedParams: parsed.enhancedParams || {},
        suggestions: parsed.suggestions || [],
        live: true,
        notice: 'Search enhanced via AI analysis.'
      };
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return {
        enhancedParams: getMockEnhancedParams(userRequest, currentParams),
        suggestions: getMockSuggestions(userRequest),
        live: false,
        notice: 'AI response parsing failed — using mock enhancement.'
      };
    }
  } catch (error) {
    console.error('AI enhancement error:', error.message);
    return {
      enhancedParams: getMockEnhancedParams(userRequest, currentParams),
      suggestions: getMockSuggestions(userRequest),
      live: false,
      notice: 'AI enhancement unavailable — using mock data.'
    };
  }
}

function getMockAIResponse(message) {
  const responses = [
    "I'd be happy to help you plan your trip! What kind of destination are you looking for?",
    "That sounds like a great trip idea! Have you considered the best time to visit?",
    "I can help you find the perfect accommodation and activities. What's your budget range?",
    "For that destination, I'd recommend checking different seasons for the best prices.",
    "Let me suggest some popular attractions and hidden gems for your trip!",
    "Have you thought about transportation options? I can help you find the best deals.",
    "That's a fantastic choice! What type of experience are you looking for - adventure, relaxation, or culture?",
    "I can help you optimize your search with specific dates and preferences.",
    "Consider the number of travelers - this can significantly affect your options and pricing.",
    "Let me suggest some alternative destinations that might offer better value or unique experiences."
  ];

  // Simple keyword matching for more relevant responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
    return "I can help you find budget-friendly options! Consider traveling during off-peak seasons, looking for package deals, or exploring alternative accommodations like hostels or vacation rentals.";
  }
  
  if (lowerMessage.includes('date') || lowerMessage.includes('when') || lowerMessage.includes('time')) {
    return "Great question about timing! I can help you find the best travel dates. Consider factors like weather, peak vs off-peak seasons, and local events that might affect prices and availability.";
  }
  
  if (lowerMessage.includes('destination') || lowerMessage.includes('where') || lowerMessage.includes('place')) {
    return "I'd love to help you choose the perfect destination! What type of experience are you looking for? Adventure, relaxation, culture, or something else? This will help me suggest the best options.";
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

function getMockEnhancedParams(userRequest, currentParams) {
  const lowerRequest = userRequest.toLowerCase();
  
  // Extract or suggest destination
  let destination = currentParams.destination || '';
  if (!destination) {
    if (lowerRequest.includes('tokyo') || lowerRequest.includes('japan')) destination = 'Tokyo';
    else if (lowerRequest.includes('paris') || lowerRequest.includes('france')) destination = 'Paris';
    else if (lowerRequest.includes('london') || lowerRequest.includes('uk')) destination = 'London';
    else if (lowerRequest.includes('new york') || lowerRequest.includes('nyc')) destination = 'New York';
    else if (lowerRequest.includes('miami')) destination = 'Miami';
    else destination = 'Paris'; // Default suggestion
  }

  // Suggest dates if not provided
  let startDate = currentParams.startDate || '';
  let endDate = currentParams.endDate || '';
  if (!startDate || !endDate) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const endFutureDate = new Date(futureDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later
    
    startDate = futureDate.toISOString().split('T')[0];
    endDate = endFutureDate.toISOString().split('T')[0];
  }

  // Extract travelers
  let travelers = currentParams.travelers || 2;
  if (lowerRequest.includes('family') || lowerRequest.includes('4 people') || lowerRequest.includes('four')) travelers = 4;
  else if (lowerRequest.includes('solo') || lowerRequest.includes('1 person') || lowerRequest.includes('one')) travelers = 1;
  else if (lowerRequest.includes('group') || lowerRequest.includes('6 people')) travelers = 6;

  return {
    destination,
    startDate,
    endDate,
    travelers,
    budget: lowerRequest.includes('budget') || lowerRequest.includes('cheap') ? 'low' : 'medium'
  };
}

function getMockSuggestions(userRequest) {
  const lowerRequest = userRequest.toLowerCase();
  
  if (lowerRequest.includes('budget') || lowerRequest.includes('cheap')) {
    return [
      "Search for off-peak season travel dates",
      "Look for budget-friendly accommodations",
      "Consider alternative transportation options",
      "Check for package deals and discounts"
    ];
  }
  
  if (lowerRequest.includes('luxury') || lowerRequest.includes('premium')) {
    return [
      "Search for 5-star hotels and resorts",
      "Look for premium flight options",
      "Consider luxury car rental services",
      "Check for exclusive travel packages"
    ];
  }
  
  if (lowerRequest.includes('adventure') || lowerRequest.includes('outdoor')) {
    return [
      "Search for adventure-focused destinations",
      "Look for outdoor activity packages",
      "Consider eco-friendly accommodations",
      "Check for guided tour options"
    ];
  }

  return [
    "Try searching with flexible dates for better prices",
    "Consider different accommodation types",
    "Look for package deals that include flights and stays",
    "Check for seasonal events and festivals"
  ];
}
