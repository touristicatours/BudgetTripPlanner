import { WeatherForecast } from './proactive_tips_service';

export interface WeatherApiResponse {
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    pop: number; // Probability of precipitation
    humidity: number;
  }>;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  async getWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 7
  ): Promise<WeatherForecast | null> {
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured, returning mock weather data');
      return this.getMockWeatherForecast(days);
    }

    try {
      const url = `${this.baseUrl}/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&units=metric&appid=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      return this.transformWeatherData(data, days);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getMockWeatherForecast(days);
    }
  }

  private transformWeatherData(data: WeatherApiResponse, days: number): WeatherForecast {
    const forecast: WeatherForecast = {};
    
    // Get the next 'days' days of weather data
    const dailyData = data.daily.slice(0, days);
    
    dailyData.forEach((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      forecast[dateString] = {
        condition: day.weather[0]?.main || 'Clear',
        temperature: Math.round(day.temp.day),
        precipitation_chance: Math.round(day.pop * 100),
        humidity: day.humidity
      };
    });
    
    return forecast;
  }

  private getMockWeatherForecast(days: number): WeatherForecast {
    const forecast: WeatherForecast = {};
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const temperature = Math.floor(Math.random() * 30) + 5; // 5-35°C
      const precipitationChance = condition === 'Rain' || condition === 'Snow' 
        ? Math.floor(Math.random() * 40) + 60 // 60-100% for rain/snow
        : Math.floor(Math.random() * 30); // 0-30% for clear/clouds
      
      forecast[dateString] = {
        condition,
        temperature,
        precipitation_chance: precipitationChance,
        humidity: Math.floor(Math.random() * 40) + 40 // 40-80%
      };
    }
    
    return forecast;
  }

  async getCoordinatesForCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
    if (!this.apiKey) {
      // Return mock coordinates for common cities
      const mockCities: { [key: string]: { lat: number; lon: number } } = {
        'paris': { lat: 48.8566, lon: 2.3522 },
        'london': { lat: 51.5074, lon: -0.1278 },
        'new york': { lat: 40.7128, lon: -74.0060 },
        'tokyo': { lat: 35.6762, lon: 139.6503 },
        'rome': { lat: 41.9028, lon: 12.4964 },
        'barcelona': { lat: 41.3851, lon: 2.1734 },
        'amsterdam': { lat: 52.3676, lon: 4.9041 },
        'berlin': { lat: 52.5200, lon: 13.4050 },
        'madrid': { lat: 40.4168, lon: -3.7038 },
        'vienna': { lat: 48.2082, lon: 16.3738 }
      };
      
      const normalizedCity = cityName.toLowerCase().trim();
      return mockCities[normalizedCity] || { lat: 48.8566, lon: 2.3522 }; // Default to Paris
    }

    try {
      const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: data[0].lat,
          lon: data[0].lon
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates for city:', error);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
