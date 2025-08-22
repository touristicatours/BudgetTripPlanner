# BudgetTripPlanner Backend

A production-ready backend server for the AI-powered travel itinerary generator.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Server will start on:** http://localhost:4000

## 📊 API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status and version
  - No authentication required

### Itinerary Generation
- **POST** `/api/itinerary`
  - Generates AI-powered travel itineraries using OpenAI
  - Requires valid OpenAI API key

- **POST** `/api/itinerary/test`
  - Generates sample itineraries (no OpenAI required)
  - Perfect for testing and development

### Bookings (Mock)
- **GET** `/api/bookings`
  - Returns mock booking data
  - No authentication required

- **POST** `/api/bookings`
  - Creates a new mock booking
  - Returns booking with confirmation code

## 🔧 API Usage Examples

### Generate Itinerary (with OpenAI)

```bash
curl -X POST http://localhost:4000/api/itinerary \
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

### Generate Test Itinerary (no OpenAI required)

```bash
curl -X POST http://localhost:4000/api/itinerary/test \
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

### Health Check

```bash
curl http://localhost:4000/api/health
```

## 📁 Project Structure

```
server/
├── index.js                 # Main server file
├── package.json            # Dependencies and scripts
├── lib/                    # Shared utilities
│   ├── types.js           # Type definitions
│   ├── schemas.js         # Zod validation schemas
│   └── openai.js          # OpenAI client configuration
├── providers/              # Provider stubs for future integration
│   ├── flights.js         # Flight search provider
│   ├── hotels.js          # Hotel search provider
│   └── activities.js      # Activity search provider
└── README.md              # This file
```

## 🔑 Environment Variables

```env
# Required for AI-powered itineraries
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (for future provider integration)
DUFFEL_API_KEY=...
RATEHAWK_API_KEY=...
GYG_API_KEY=...
```

## 🎯 Key Features

### AI-Powered Itinerary Generation
- ✅ GPT-4o-mini integration
- ✅ Budget-aware planning
- ✅ Personalized recommendations
- ✅ Structured JSON output
- ✅ Comprehensive validation

### Production Ready
- ✅ CORS enabled
- ✅ Error handling
- ✅ Request validation
- ✅ Health checks
- ✅ Mock data endpoints

### Future Integration Ready
- ✅ Provider stubs for flights, hotels, activities
- ✅ Modular architecture
- ✅ Easy to extend

## 🧪 Testing

### Test the API

1. **Health Check**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Test Itinerary (no OpenAI required)**
   ```bash
   curl -X POST http://localhost:4000/api/itinerary/test \
     -H "Content-Type: application/json" \
     -d '{"destination":"Paris","startDate":"2025-09-10","endDate":"2025-09-13","budgetTotal":600,"travelers":2,"pace":"relaxed","interests":["food"],"mustSee":["Louvre"]}'
   ```

3. **Real Itinerary (requires OpenAI key)**
   ```bash
   curl -X POST http://localhost:4000/api/itinerary \
     -H "Content-Type: application/json" \
     -d '{"destination":"Paris","startDate":"2025-09-10","endDate":"2025-09-13","budgetTotal":600,"travelers":2,"pace":"relaxed","interests":["food"],"mustSee":["Louvre"]}'
   ```

## 🔄 Development

### Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Start production server
npm start
```

### Adding New Endpoints

1. Add the endpoint to `index.js`
2. Add validation schemas to `lib/schemas.js`
3. Add types to `lib/types.js` if needed
4. Test with curl or Postman

## 🚀 Deployment

The server is ready for deployment to:
- Heroku
- Vercel
- Railway
- DigitalOcean
- AWS

Just set the environment variables and deploy!

## 📞 Support

For issues or questions:
1. Check the health endpoint: `GET /api/health`
2. Review the logs for error messages
3. Ensure environment variables are set correctly
4. Test with the `/api/itinerary/test` endpoint first

## 📄 License

MIT License - see LICENSE file for details.
