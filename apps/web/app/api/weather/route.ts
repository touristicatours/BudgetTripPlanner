import { NextRequest, NextResponse } from "next/server";

// Mock weather data - in production, integrate with OpenWeatherMap or similar
const mockWeatherData = {
  "Paris": {
    "2025-09-01": { temp: 22, condition: "sunny", rain: 0 },
    "2025-09-02": { temp: 18, condition: "cloudy", rain: 30 },
    "2025-09-03": { temp: 20, condition: "partly_cloudy", rain: 10 },
    "2025-09-04": { temp: 25, condition: "sunny", rain: 0 },
    "2025-09-05": { temp: 19, condition: "rainy", rain: 80 }
  },
  "Rome": {
    "2025-09-01": { temp: 28, condition: "sunny", rain: 0 },
    "2025-09-02": { temp: 26, condition: "sunny", rain: 0 },
    "2025-09-03": { temp: 24, condition: "partly_cloudy", rain: 20 },
    "2025-09-04": { temp: 27, condition: "sunny", rain: 0 },
    "2025-09-05": { temp: 25, condition: "sunny", rain: 0 }
  },
  "Tokyo": {
    "2025-09-01": { temp: 24, condition: "cloudy", rain: 40 },
    "2025-09-02": { temp: 22, condition: "rainy", rain: 90 },
    "2025-09-03": { temp: 26, condition: "partly_cloudy", rain: 20 },
    "2025-09-04": { temp: 28, condition: "sunny", rain: 0 },
    "2025-09-05": { temp: 25, condition: "sunny", rain: 0 }
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  if (!destination || !date) {
    return NextResponse.json({ error: "Destination and date required" }, { status: 400 });
  }

  // Get weather data (mock for now)
  const weather = mockWeatherData[destination as keyof typeof mockWeatherData]?.[date];
  
  if (!weather) {
    return NextResponse.json({ error: "Weather data not available" }, { status: 404 });
  }

  // Generate weather-aware suggestions
  const suggestions = generateWeatherSuggestions(weather, destination);

  return NextResponse.json({
    weather,
    suggestions,
    destination,
    date
  });
}

function generateWeatherSuggestions(weather: any, destination: string) {
  const suggestions = [];

  if (weather.rain > 50) {
    suggestions.push({
      type: "indoor_activity",
      message: "🌧️ Rain expected! Consider indoor activities like museums or cafes",
      priority: "high"
    });
  }

  if (weather.temp > 30) {
    suggestions.push({
      type: "cooling_activity",
      message: "🔥 Hot weather! Plan for air-conditioned venues or evening activities",
      priority: "medium"
    });
  }

  if (weather.temp < 10) {
    suggestions.push({
      type: "warming_activity",
      message: "❄️ Cold weather! Consider indoor activities or warm clothing",
      priority: "medium"
    });
  }

  if (weather.condition === "sunny" && weather.rain < 20) {
    suggestions.push({
      type: "outdoor_activity",
      message: "☀️ Perfect weather for outdoor activities and sightseeing!",
      priority: "low"
    });
  }

  return suggestions;
}
