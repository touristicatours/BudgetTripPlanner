'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Search, 
  Hotel, 
  Activity, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Star,
  Send,
  Bot,
  User,
  Heart,
  Clock,
  Navigation,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Mountain,
  Palmtree
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Chip from '@/src/components/ui/Chip'
import SideDock from '@/src/components/SideDock'
import OnboardingSheet, { OnboardingData } from '@/components/OnboardingSheet'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Badge, 
  Input, 
  Section 
} from '@/components/ui'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'suggestion' | 'image' | 'itinerary'
}

interface TripPreferences {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  interests: string[]
  pace: 'relaxed' | 'moderate' | 'adventurous'
}

interface Suggestion {
  id: string
  text: string
  type: 'destination' | 'activity' | 'budget' | 'duration'
}

interface Destination {
  name: string
  country: string
  description: string
  image: string
  category: string
  budget: 'budget' | 'mid-range' | 'luxury'
}

export default function HomePageContent({ embed = false }: { embed?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [mounted, setMounted] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [onboardingInitial, setOnboardingInitial] = useState<Partial<OnboardingData>|undefined>(undefined)
  
  useEffect(() => {
    setMounted(true)
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your AI travel companion. I can help you plan the perfect trip, discover amazing destinations, and create personalized itineraries. Where would you like to go?",
        timestamp: new Date(),
        type: 'text'
      }
    ])
  }, [])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions: Suggestion[] = [
    { id: '1', text: 'Plan a trip to Paris', type: 'destination' },
    { id: '2', text: 'Budget-friendly weekend getaway', type: 'budget' },
    { id: '3', text: 'Adventure activities', type: 'activity' },
    { id: '4', text: '2-week vacation ideas', type: 'duration' },
    { id: '5', text: 'Honeymoon destinations', type: 'destination' },
    { id: '6', text: 'Family vacation spots', type: 'destination' }
  ]

  const popularDestinations: Destination[] = [
    { name: 'Paris', country: 'France', description: 'The City of Light with iconic landmarks and world-class cuisine', image: 'https://images.unsplash.com/photo-1502602898533-7d60c80c4e60?w=400', category: 'Culture', budget: 'mid-range' },
    { name: 'Tokyo', country: 'Japan', description: 'A fascinating blend of traditional culture and modern technology', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', category: 'Culture', budget: 'mid-range' },
    { name: 'Bali', country: 'Indonesia', description: 'Tropical paradise with beautiful beaches and spiritual retreats', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400', category: 'Relaxation', budget: 'budget' }
  ]

  const getDestinationIcon = (destination: Destination) => {
    switch (destination.name) {
      case 'Paris': return <Globe className="w-8 h-8 text-white" />
      case 'Tokyo': return <Navigation className="w-8 h-8 text-white" />
      case 'Bali': return <Palmtree className="w-8 h-8 text-white" />
      default: return <Globe className="w-8 h-8 text-white" />
    }
  }

  useEffect(() => { scrollToBottom() }, [messages])
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputMessage
    if (!textToSend.trim() || isLoading) return
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    try {
      const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [ { role: 'system', content: 'TripWeaver user session' }, ...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: textToSend } ] }) })
      let content = ''
      if (res.ok) { const data = await res.json(); content = data?.content || '' } else { content = generateAIResponse(textToSend) }
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date() }
      setMessages(prev => [...prev, aiMessage])
    } catch (e) {
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: generateAIResponse(textToSend), timestamp: new Date() }
      setMessages(prev => [...prev, aiMessage])
    } finally { setIsLoading(false); setIsTyping(false) }
  }

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()
    if (lowerInput.includes('paris')) { return "Paris is absolutely magical! The Eiffel Tower, Louvre Museum, and charming cafes in Montmartre are must-sees. I'd recommend spending at least 4-5 days to truly experience the City of Light. Would you like me to create a detailed itinerary?" }
    if (lowerInput.includes('budget') || lowerInput.includes('cheap') || lowerInput.includes('affordable')) { return "I love helping with budget-friendly trips! Consider destinations like Bali, Thailand, Portugal, or Eastern Europe. These offer incredible experiences without breaking the bank. What's your budget range?" }
    if (lowerInput.includes('adventure') || lowerInput.includes('outdoor') || lowerInput.includes('hiking')) { return "Adventure awaits! New Zealand, Iceland, and Patagonia are perfect for outdoor enthusiasts. From hiking to kayaking, there's something for every thrill-seeker. What type of adventure interests you most?" }
    if (lowerInput.includes('weekend') || lowerInput.includes('short') || lowerInput.includes('quick')) { return "Perfect for a weekend escape! Consider nearby cities or national parks. Quick getaways can be just as rewarding as longer trips. Where are you based?" }
    if (lowerInput.includes('honeymoon') || lowerInput.includes('romantic')) { return "Romantic honeymoon destinations! The Maldives, Santorini, and Bali are perfect for couples. I can help you plan a dreamy, romantic itinerary. What's your dream honeymoon style?" }
    return "That sounds amazing! 🌍 I'd love to help you plan the perfect trip. Tell me more about your travel style, budget, and what you're looking for in a destination."
  }

  const openOnboarding = (prefill?: Partial<OnboardingData>) => { setOnboardingInitial(prefill); setOnboardingOpen(true); };
  const handleOnboardingComplete = async (d: OnboardingData) => { setOnboardingOpen(false); window.location.href = `/plan?destination=${encodeURIComponent(d.destination)}&start=${d.startDate}&end=${d.endDate}&travelers=${d.travelers}&budget=${d.budget}&currency=${d.currency}`; };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }

  return (
    <div className="min-h-screen bg-bg">
      {!embed && <Navbar />}

      {/* Main Content */}
      <div className="container mx-auto py-xl">
        {/* Hero Section */}
        {!embed && (
          <Section className="mb-xl">
            <Card className="bg-gradient-primary text-white p-xl">
              <CardBody>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-md">
                  Plan trips the fun way.
                </h1>
                <p className="text-lg text-white/90 mb-lg">
                  Co‑create with AI: add, swap, and refine in seconds—then book, all in one place.
                </p>
                <div className="flex flex-wrap gap-sm mb-lg">
                  {['City break','Relaxing weekend','Foodie tour'].map((t) => (
                    <Badge key={t} variant="primary" className="bg-white/20 text-white border-white/40">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-md">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => openOnboarding({})}
                  >
                    Start in 60 seconds
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild
                  >
                    <Link href="/demo-trip">Try a demo trip</Link>
                  </Button>
                </div>
                {/* Micro-promises */}
                <div className="flex flex-wrap gap-sm mt-lg">
                  {['Lightning‑fast suggestions','One tap to book','Shareable, remixable plans','Realistic timing and budgets'].map((t) => (
                    <Badge key={t} variant="default" className="bg-white/20 text-white border-white/40">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Section>
        )}

        <div className="flex gap-lg">
          <SideDock />
          <div className="flex-1">
            {/* Popular Destinations */}
            <Section>
              <div className="text-center mb-lg">
                <h2 className="text-3xl md:text-4xl font-bold text-fg mb-md">
                  Popular Destinations
                </h2>
                <p className="text-muted">Tap a card to start a tailored chat.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {popularDestinations.map((destination) => (
                  <Card 
                    key={destination.name} 
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => handleSendMessage(`Tell me about ${destination.name}`)}
                  >
                    <CardBody>
                      <div className="w-full h-32 bg-gradient-primary rounded-lg mb-md flex items-center justify-center">
                        {getDestinationIcon(destination)}
                      </div>
                      <h4 className="font-semibold text-fg mb-sm">
                        {destination.name}, {destination.country}
                      </h4>
                      <p className="text-sm text-muted mb-md">
                        {destination.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="primary">{destination.category}</Badge>
                        <span className="text-xs text-muted capitalize">
                          {destination.budget}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Section>

            {/* Demo Trip CTA */}
            <Section>
              <Card className="bg-gradient-primary text-white">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-md">See All Features in Action!</h3>
                      <p className="text-white/90 mb-lg">
                        Explore a complete trip with invoice generation, weather forecasts, budget tracking, expense splitting, and more.
                      </p>
                      <div className="flex flex-wrap gap-sm mb-lg">
                        {['📄 Invoice Generation', '🔄 Remix Trips', '☁️ Weather Forecast', '💰 Budget Tracking', '👥 Split Expenses'].map((feature) => (
                          <Badge key={feature} variant="default" className="bg-white/20 text-white border-white/40">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="lg"
                        asChild
                      >
                        <Link href="/demo-trip">
                          <Sparkles className="w-5 h-5 mr-sm" />
                          View Demo Trip
                          <ArrowRight className="w-5 h-5 ml-sm" />
                        </Link>
                      </Button>
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-6xl">🗼</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Section>

            {/* AI Chat Interface */}
            <Section>
              <Card>
                <CardHeader className="bg-gradient-primary text-white">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Travel Assistant</h3>
                      <p className="text-white/80 text-sm">Powered by advanced AI</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="h-96 overflow-y-auto space-y-md">
                    {!mounted ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-muted">Loading...</div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-md py-md rounded-xl ${
                            message.role === 'user' 
                              ? 'bg-gradient-primary text-white' 
                              : 'bg-bg-subtle text-fg'
                          }`}>
                            <div className="flex items-start gap-sm">
                              {message.role === 'assistant' && (
                                <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-brand-amber" />
                              )}
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {mounted && isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-bg-subtle px-md py-md rounded-xl">
                          <div className="flex items-center gap-sm">
                            <Bot className="w-4 h-4 text-brand-amber" />
                            <div className="flex gap-xs">
                              <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardBody>
                <CardFooter>
                  <div className="flex items-center gap-md w-full">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about destinations, itineraries, or travel tips..."
                        disabled={isLoading}
                        rightIcon={
                          <Button
                            onClick={() => handleSendMessage()}
                            disabled={isLoading || !inputMessage.trim()}
                            variant="ghost"
                            size="sm"
                            className="p-0"
                          >
                            <Send className="w-5 h-5" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Section>

            {/* Features */}
            <Section>
              <h2 className="text-3xl font-bold text-center mb-lg text-fg">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <Card>
                  <CardBody>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-md">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-md">AI-Powered Planning</h3>
                    <p className="text-muted">
                      Get personalized travel recommendations based on your preferences, budget, and interests.
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-md">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-md">Global Destinations</h3>
                    <p className="text-muted">
                      Discover amazing places worldwide, from hidden gems to popular tourist destinations.
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-md">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-md">Personalized Experience</h3>
                    <p className="text-muted">
                      Create custom itineraries that match your travel style and preferences.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </Section>

            {/* Community Suggestions */}
            <Section>
              <h2 className="text-3xl font-bold text-center mb-lg text-fg">Community Suggestions</h2>
              <p className="text-center text-muted max-w-2xl mx-auto mb-lg">
                Share photos and tips from your trips. Help others discover amazing spots. No ratings—just real experiences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {[1,2,3].map((i) => (
                  <Card key={i}>
                    <CardBody>
                      <div className="w-full h-40 bg-gradient-primary rounded-lg mb-md"></div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-fg">Hidden café in Le Marais</h4>
                          <p className="text-sm text-muted">by Traveler {i}</p>
                        </div>
                        <Badge variant="primary">Add to trip</Badge>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>

      {!embed && (
        <OnboardingSheet 
          open={onboardingOpen} 
          initial={onboardingInitial} 
          onClose={() => setOnboardingOpen(false)} 
          onComplete={handleOnboardingComplete} 
        />
      )}
    </div>
  )
}
