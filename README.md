# 🚀 BudgetTripPlanner - AI-Powered Travel Planning Platform

A comprehensive, modern travel planning application that combines AI-powered itinerary generation with beautiful UI/UX design.

## ✨ Features

### 🤖 AI-Powered Trip Planning
- **Intelligent Itinerary Generation**: AI creates personalized day-by-day travel plans
- **Smart Chat Interface**: Natural language trip planning with context awareness
- **Dynamic Recommendations**: Real-time suggestions based on preferences and budget

### 🎨 Modern UI/UX Design
- **Design System**: Consistent components with Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and transitions
- **Brand Consistency**: Cohesive visual identity throughout

### 🗺️ Interactive Maps & Exploration
- **Google Maps Integration**: Real-time location services
- **Explore Page**: Discover restaurants, bars, and activities
- **Direct Booking**: Seamless integration with booking platforms

### ✈️ Flight Search & Booking
- **Multi-Airline Search**: Compare prices across carriers
- **Smart Filters**: Date flexibility, cabin class, direct flights
- **Booking Integration**: Direct links to airline websites

### 👥 Collaborative Features
- **Trip Sharing**: Share itineraries with friends and family
- **Group Planning**: Collaborative trip creation
- **Real-time Updates**: Live synchronization across devices

### 📱 User Experience
- **Profile Management**: Personalized user settings
- **Trip History**: Save and revisit past trips
- **Export Options**: PDF and code export capabilities

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

### Backend
- **Fastify**: High-performance Node.js framework
- **TypeScript**: Full-stack type safety
- **Prisma**: Database ORM
- **Redis**: Caching and session management

### AI & Integrations
- **OpenAI API**: AI-powered itinerary generation
- **Google Maps API**: Location services
- **Flight APIs**: Real-time flight data
- **Booking APIs**: Hotel and activity reservations

### Development Tools
- **Turbo**: Monorepo build system
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Husky**: Git hooks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BudgetTripPlanner.git
   cd BudgetTripPlanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## 📁 Project Structure

```
BudgetTripPlanner/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions
│   │   └── public/        # Static assets
│   └── api/               # Fastify backend API
│       ├── src/
│       │   ├── routes/    # API endpoints
│       │   ├── lib/       # Shared utilities
│       │   └── providers/ # External service integrations
├── packages/              # Shared packages
│   ├── db/               # Database schema and utilities
│   ├── shared/           # Common types and schemas
│   └── poi/              # Points of interest utilities
├── client/               # Additional client applications
└── docs/                 # Documentation
```

## 🎯 Key Features in Detail

### AI Chat Interface
- Natural language processing for trip planning
- Context-aware responses
- Multi-turn conversations
- File upload support (images, documents)

### Workspace Dashboard
- Centralized trip management
- Real-time chat with AI assistant
- Interactive maps integration
- Recent trips and recommendations

### Trip Planning Flow
1. **Destination Selection**: Choose your travel destination
2. **Preferences Collection**: Set budget, interests, travel style
3. **AI Generation**: Get personalized itinerary
4. **Customization**: Modify and refine your plan
5. **Booking**: Direct links to book flights, hotels, activities

### Design System
- **Color Palette**: Consistent brand colors
- **Typography**: Scalable font system
- **Components**: Reusable UI components
- **Spacing**: 8-point grid system
- **Animations**: Smooth micro-interactions

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI API
OPENAI_API_KEY=your_openai_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Database
DATABASE_URL=your_database_url

# Redis
REDIS_URL=your_redis_url

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### API Endpoints

- `POST /v1/ai/chat` - AI chat interface
- `POST /v1/ai/qa` - Trip preferences collection
- `POST /v1/ai/itinerary` - Generate itineraries
- `GET /v1/places/search` - Search places
- `GET /v1/flights/search` - Search flights

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Google Maps for location services
- The Next.js team for the amazing framework
- The Tailwind CSS team for the utility-first approach

## 📞 Support

- **Email**: support@budgettripplanner.com
- **Documentation**: [docs.budgettripplanner.com](https://docs.budgettripplanner.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/BudgetTripPlanner/issues)

---

**Made with ❤️ by the BudgetTripPlanner Team**
