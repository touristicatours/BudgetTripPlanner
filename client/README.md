# BudgetTripPlanner - AI Itinerary Generator

A production-ready AI-powered travel itinerary generator built with Next.js 14, TypeScript, and OpenAI.

## Features

- 🤖 AI-powered itinerary generation with GPT-4o-mini
- 💰 Budget-aware planning with daily cost targets
- 🎯 Personalized recommendations based on interests and pace
- 📅 Day-by-day structured itineraries
- 🎨 Modern UI with Tailwind CSS
- 🔒 Type-safe with TypeScript and Zod validation
- 📊 Budget tracking and cost estimation
- 📄 JSON export and clipboard copy functionality

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Usage

### Generate Itinerary

**Endpoint:** `POST /api/itinerary`

**Request Body:**
```json
{
  "destination": "Paris, France",
  "startDate": "2025-09-10",
  "endDate": "2025-09-13",
  "budgetTotal": 600,
  "travelers": 2,
  "pace": "relaxed",
  "interests": ["food", "history", "art"],
  "mustSee": ["Louvre", "Eiffel Tower"]
}
```

**Response:**
```json
{
  "currency": "EUR",
  "totalDays": 3,
  "dailyBudgetTarget": 200,
  "estimatedTotal": 580,
  "days": [
    {
      "date": "2025-09-10",
      "summary": "Arrival and exploration of central Paris",
      "items": [
        {
          "time": "09:30",
          "title": "Croissant & coffee near hotel",
          "category": "food",
          "lat": null,
          "lng": null,
          "estCost": 15,
          "notes": "Start the day with a classic French breakfast",
          "booking": {
            "type": "none",
            "operator": null,
            "externalUrl": null,
            "id": null
          }
        }
      ],
      "subtotal": 15
    }
  ]
}
```

## Example cURL Request

```bash
curl -X POST http://localhost:3000/api/itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "startDate": "2025-09-10",
    "endDate": "2025-09-13",
    "budgetTotal": 600,
    "travelers": 2,
    "pace": "relaxed",
    "interests": ["food", "history", "art"],
    "mustSee": ["Louvre", "Eiffel Tower"]
  }'
```

## Project Structure

```
client/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── itinerary/     # Itinerary generation endpoint
│   ├── plan/              # Plan page with form and results
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Shared utilities
│   ├── types.ts           # TypeScript types
│   ├── schemas.ts         # Zod validation schemas
│   ├── openai.ts          # OpenAI client configuration
│   └── providers/         # Provider stubs for future integration
│       ├── flights.ts     # Flight search provider
│       ├── hotels.ts      # Hotel search provider
│       └── activities.ts  # Activity search provider
├── tests/                 # Test files
│   └── itinerary.spec.ts  # Itinerary API tests
└── package.json           # Dependencies and scripts
```

## Key Features

### Budget Awareness
- Calculates daily budget targets based on total budget and trip duration
- Keeps daily costs within ±15% of the target
- Provides budget status indicators

### AI-Powered Planning
- Uses GPT-4o-mini for intelligent itinerary generation
- Considers user interests, pace, and must-see items
- Generates realistic timing and logical activity order

### Type Safety
- Full TypeScript support with strict type checking
- Zod validation for request/response schemas
- Comprehensive error handling

### User Experience
- Modern, responsive UI with Tailwind CSS
- Real-time form validation
- Loading states and error handling
- JSON export and clipboard copy functionality

## Future Enhancements

### Provider Integration
- **Flights**: Integrate with Duffel API for real flight search
- **Hotels**: Integrate with RateHawk API for hotel bookings
- **Activities**: Integrate with GetYourGuide API for tours and activities

### Additional Features
- Map integration with location coordinates
- Real-time pricing from providers
- Booking integration
- Social sharing
- Trip collaboration
- Mobile app

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Environment Variables
```env
# Required
OPENAI_API_KEY=sk-...

# Optional (for future provider integration)
DUFFEL_API_KEY=...
RATEHAWK_API_KEY=...
GYG_API_KEY=...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
