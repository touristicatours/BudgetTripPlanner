'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MapPin, Calendar, Users, DollarSign } from 'lucide-react'

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cx('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  )
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm', className)}>{children}</div>
}

function Button({
  variant = 'solid',
  href,
  onClick,
  children,
}: {
  variant?: 'solid' | 'ghost'
  href?: string
  onClick?: any
  children: React.ReactNode
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.99]'
  if (variant === 'ghost') {
    return (
      <a href={href || '#'} onClick={onClick} className={cx(base, 'bg-transparent text-slate-900 hover:bg-slate-50 ring-1 ring-slate-200')}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href || '#'}
      onClick={onClick}
      className={cx(base, 'text-slate-900 shadow-sm ring-1 ring-black/5')}
      style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
    >
      {children}
    </a>
  )
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function QuickSuggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 transition text-sm"
    >
      {text}
    </button>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI travel companion. I can help you plan the perfect trip, discover amazing destinations, and create personalized itineraries. Where would you like to go?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickSuggestions = [
    'Plan a trip to Paris',
    'Budget-friendly weekend getaway',
    'Adventure activities',
    'Honeymoon destinations',
    'Family vacation spots',
    'Best time to visit Japan'
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()
    if (lowerInput.includes('paris')) {
      return "Paris is absolutely magical! The Eiffel Tower, Louvre Museum, and charming cafes in Montmartre are must-sees. I'd recommend spending at least 4-5 days to truly experience the City of Light. Would you like me to create a detailed itinerary?"
    }
    if (lowerInput.includes('budget') || lowerInput.includes('cheap') || lowerInput.includes('affordable')) {
      return "I love helping with budget-friendly trips! Consider destinations like Bali, Thailand, Portugal, or Eastern Europe. These offer incredible experiences without breaking the bank. What's your budget range?"
    }
    if (lowerInput.includes('adventure') || lowerInput.includes('outdoor') || lowerInput.includes('hiking')) {
      return "Adventure awaits! New Zealand, Iceland, and Patagonia are perfect for outdoor enthusiasts. From hiking to kayaking, there's something for every thrill-seeker. What type of adventure interests you most?"
    }
    if (lowerInput.includes('honeymoon') || lowerInput.includes('romantic')) {
      return "Romantic honeymoon destinations! The Maldives, Santorini, and Bali are perfect for couples. I can help you plan a dreamy, romantic itinerary. What's your dream honeymoon style?"
    }
    return "That sounds amazing! 🌍 I'd love to help you plan the perfect trip. Tell me more about your travel style, budget, and what you're looking for in a destination."
  }

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputMessage
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'TripWeaver user session' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: textToSend }
          ]
        })
      })

      let content = ''
      if (res.ok) {
        const data = await res.json()
        content = data?.content || ''
      } else {
        content = generateAIResponse(textToSend)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (e) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(textToSend),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7] text-slate-900">
      {/* Subtle glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[52rem] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(253,224,71,.45), rgba(251,191,36,.25), transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="pt-10 pb-8">
        <Section>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4">
              AI Travel Assistant
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Chat with our AI to plan your perfect trip. Get personalized recommendations, 
              discover hidden gems, and create custom itineraries.
            </p>
          </div>
        </Section>
      </header>

      {/* Chat Interface */}
      <Section className="pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-200/60 to-amber-300/60 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">TripWeaver AI</h3>
                    <p className="text-sm text-slate-500">Your personal travel assistant</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-amber-500" />
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-amber-500" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-200">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about destinations, itineraries, or travel tips..."
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Suggestions</h3>
              <div className="space-y-2">
                {quickSuggestions.map((suggestion, index) => (
                  <QuickSuggestion
                    key={index}
                    text={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                  />
                ))}
              </div>
            </Card>

            {/* Trip Planning Tools */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Planning Tools</h3>
              <div className="space-y-3">
                <Button variant="ghost" href="/plan" className="w-full justify-start">
                  <MapPin size={16} />
                  Plan a Trip
                </Button>
                <Button variant="ghost" href="/flights" className="w-full justify-start">
                  <Calendar size={16} />
                  Find Flights
                </Button>
                <Button variant="ghost" href="/hotels" className="w-full justify-start">
                  <Users size={16} />
                  Book Hotels
                </Button>
                <Button variant="ghost" href="/budget" className="w-full justify-start">
                  <DollarSign size={16} />
                  Budget Tracker
                </Button>
              </div>
            </Card>

            {/* AI Features */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">AI Features</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Budget optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Local insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Real-time updates</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  )
}
