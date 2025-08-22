'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Bot, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TripPreferences {
  origin?: string
  destination?: string
  startDate?: string
  endDate?: string
  travelers?: number
  budgetTotal?: number
  currency?: string
  pace?: 'relaxed' | 'standard' | 'intense'
  interests?: string[]
  dietary?: string[]
  mustSee?: string[]
}

const QUESTIONS = [
  {
    id: 'destination',
    question: "Where would you like to go?",
    placeholder: "e.g., Paris, France",
    type: 'text'
  },
  {
    id: 'startDate',
    question: "When do you want to start your trip?",
    placeholder: "YYYY-MM-DD",
    type: 'date'
  },
  {
    id: 'endDate',
    question: "When do you plan to return?",
    placeholder: "YYYY-MM-DD",
    type: 'date'
  },
  {
    id: 'travelers',
    question: "How many people are traveling?",
    placeholder: "1-10",
    type: 'number'
  },
  {
    id: 'budgetTotal',
    question: "What's your total budget for this trip?",
    placeholder: "Amount in your preferred currency",
    type: 'number'
  },
  {
    id: 'currency',
    question: "What currency would you like to use?",
    placeholder: "e.g., EUR, USD, GBP",
    type: 'text'
  },
  {
    id: 'pace',
    question: "What's your preferred travel pace?",
    options: [
      { value: 'relaxed', label: 'Relaxed (2-3 activities/day)' },
      { value: 'standard', label: 'Standard (4-5 activities/day)' },
      { value: 'intense', label: 'Intense (6+ activities/day)' }
    ],
    type: 'select'
  },
  {
    id: 'interests',
    question: "What interests you most? (Select all that apply)",
    options: [
      { value: 'food', label: 'Food & Dining' },
      { value: 'history', label: 'History & Culture' },
      { value: 'art', label: 'Art & Museums' },
      { value: 'nature', label: 'Nature & Outdoors' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'nightlife', label: 'Nightlife' },
      { value: 'adventure', label: 'Adventure' },
      { value: 'relaxation', label: 'Relaxation' }
    ],
    type: 'multi-select'
  },
  {
    id: 'dietary',
    question: "Any dietary restrictions or preferences?",
    options: [
      { value: 'none', label: 'No restrictions' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'gluten-free', label: 'Gluten-free' },
      { value: 'halal', label: 'Halal' },
      { value: 'kosher', label: 'Kosher' }
    ],
    type: 'multi-select'
  },
  {
    id: 'mustSee',
    question: "Any must-see places or experiences?",
    placeholder: "e.g., Louvre, Eiffel Tower, local markets",
    type: 'text'
  }
]

export function ChatWizard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI travel concierge. I'll help you plan the perfect trip! Let's start with a few questions to understand your preferences.",
      timestamp: new Date()
    }
  ])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [preferences, setPreferences] = useState<TripPreferences>({})
  const [inputValue, setInputValue] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const currentQuestion = QUESTIONS[currentQuestionIndex]

  const addMessage = (content: string, type: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() && selectedOptions.length === 0) return

    let value: any = inputValue.trim()
    
    if (currentQuestion.type === 'multi-select') {
      value = selectedOptions
    } else if (currentQuestion.type === 'number') {
      value = parseInt(value)
    }

    // Add user message
    addMessage(
      currentQuestion.type === 'multi-select' 
        ? selectedOptions.map(opt => currentQuestion.options?.find(o => o.value === opt)?.label).join(', ')
        : value,
      'user'
    )

    // Update preferences
    setPreferences(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))

    // Clear inputs
    setInputValue('')
    setSelectedOptions([])

    // Move to next question or finish
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      
      // Add next question
      setTimeout(() => {
        const nextQuestion = QUESTIONS[currentQuestionIndex + 1]
        addMessage(nextQuestion.question, 'assistant')
      }, 500)
    } else {
      // All questions answered, generate itinerary
      setIsLoading(true)
      addMessage("Perfect! I have all the information I need. Let me generate your personalized itinerary...", 'assistant')
      
      try {
        const response = await fetch('/api/ai/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences })
        })
        
        if (response.ok) {
          const itinerary = await response.json()
          addMessage("Great! I've created your itinerary. Check the preview on the right to see your personalized travel plan.", 'assistant')
          // TODO: Pass itinerary to parent component
        } else {
          addMessage("I encountered an issue generating your itinerary. Please try again or contact support.", 'assistant')
        }
      } catch (error) {
        addMessage("Sorry, there was an error. Please check your connection and try again.", 'assistant')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    if (currentQuestion.type === 'multi-select') {
      setSelectedOptions(prev => 
        prev.includes(optionValue)
          ? prev.filter(v => v !== optionValue)
          : [...prev, optionValue]
      )
    } else {
      setSelectedOptions([optionValue])
    }
  }

  const canSubmit = () => {
    if (currentQuestion.type === 'multi-select') {
      return selectedOptions.length > 0
    }
    return inputValue.trim().length > 0
  }

  return (
    <div className="card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-bg" />
        </div>
        <div>
          <h3 className="font-semibold text-text">AI Travel Concierge</h3>
          <div className="flex space-x-1">
            {QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentQuestionIndex ? 'bg-primary' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-primary' 
                    : 'bg-gradient-to-br from-secondary to-primary'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-bg" />
                  ) : (
                    <Bot className="h-4 w-4 text-bg" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-bg'
                    : 'bg-card border border-white/10 text-text'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-bg" />
              </div>
              <div className="bg-card border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-text/70">Generating itinerary...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentQuestionIndex < QUESTIONS.length && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Question Display */}
          <div className="text-sm text-text/80 px-2">
            {currentQuestion.question}
          </div>

          {/* Input Options */}
          {currentQuestion.type === 'select' && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedOptions.includes(option.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-card hover:border-primary/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multi-select' && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedOptions.includes(option.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-card hover:border-primary/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {(currentQuestion.type === 'text' || currentQuestion.type === 'date' || currentQuestion.type === 'number') && (
            <input
              type={currentQuestion.type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="input-field w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-2" />
            {currentQuestionIndex === QUESTIONS.length - 1 ? 'Generate Itinerary' : 'Continue'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
