'use client'
import React, { useState, useEffect, useRef } from 'react'

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [userName, setUserName] = useState('Alex') // In a real app, this would come from user profile
  const [showTravelerModal, setShowTravelerModal] = useState(false)
  const [activeTravelerTab, setActiveTravelerTab] = useState('account')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const [travelerSettings, setTravelerSettings] = useState({
    email: 'alex@example.com',
    notifications: true,
    language: 'English (US)',
    theme: 'light'
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('General Feedback')
  
  // Trip Planning States
  const [showPlanningFlow, setShowPlanningFlow] = useState(false)
  const [planningStep, setPlanningStep] = useState('chat') // 'chat' | 'generating' | 'itinerary'
  const [tripDetails, setTripDetails] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    interests: [],
    style: ''
  })
  const [generatedItinerary, setGeneratedItinerary] = useState(null)
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false)
  const [showPlanningModal, setShowPlanningModal] = useState(false)
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    interests: [],
    accommodation: '',
    transportation: ''
  })

  // Flight-related states
  const [flightData, setFlightData] = useState({
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'Economy',
    directFlightsOnly: false,
    flexibleDates: false
  })

  const [availableFlights, setAvailableFlights] = useState([])
  const [isSearchingFlights, setIsSearchingFlights] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePictureRef = useRef<HTMLInputElement>(null)
  
  // Helper function for consistent timestamp formatting
  const formatTimestamp = (date: Date) => {
    if (!isClient) return 'Just now'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Ensure client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      text: `Hi Alex! 👋 I'm so excited to help you plan your next adventure with love! ✨\n\nTell me about your dream destination, travel style, or any questions you have. I'm here to make your trip planning magical! 🌟`, 
      timestamp: new Date() 
    }
  ])

  // Quick asks that change based on planning mode
  const quickAsks = showPlanningFlow ? [
    "I want to visit Paris for 5 days",
    "Budget around $2000 for 2 people",
    "Looking for cultural experiences",
    "Need restaurant recommendations",
    "What's the best time to visit?",
    "Search for flights to my destination"
  ] : [
    "Show me my saved trips",
    "What's popular in Japan?",
    "Budget tips for Europe",
    "Best time to visit Thailand",
    "Family-friendly destinations",
    "Search for flights"
  ]
  
  // Sample recent trips created by others
  const recentTrips = [
    { id: 1, destination: 'Tokyo, Japan', duration: '5 days', budget: '$1200', activities: ['Sushi making class', 'Shibuya crossing', 'Mount Fuji day trip'] },
    { id: 2, destination: 'Barcelona, Spain', duration: '4 days', budget: '$800', activities: ['Sagrada Familia', 'Tapas tour', 'Beach day'] },
    { id: 3, destination: 'New York, USA', duration: '6 days', budget: '$1500', activities: ['Broadway show', 'Central Park', 'Brooklyn Bridge'] },
    { id: 4, destination: 'Bangkok, Thailand', duration: '3 days', budget: '$600', activities: ['Temple tour', 'Floating market', 'Street food'] }
  ]



  const travelerTabs = [
    { id: 'account', label: 'Account Settings', icon: '⚙️' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { id: 'terms', label: 'Terms of Service', icon: '📄' }
  ]

  // Chat Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chatInput.trim()) {
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      text: chatInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // If we're in planning flow, use planning chat handler
    if (showPlanningFlow) {
      await handlePlanningChat(chatInput.trim())
    } else {
      // Regular chat flow
      try {
        // Provide more helpful responses based on the user's input
        let aiResponse = 'I\'m here to help you plan your trip! What would you like to know?'
        
        const userInputLower = userInput.toLowerCase()
        
        if (userInputLower.includes('hello') || userInputLower.includes('hi')) {
          aiResponse = `Hello! I'm your AI travel assistant. I can help you plan trips, find flights, create itineraries, and answer travel questions. What would you like to do today?`
        } else if (userInputLower.includes('plan') || userInputLower.includes('trip')) {
          aiResponse = `Great! I'd love to help you plan your trip. Click the "Start Planning" button below, or just tell me where you'd like to go and when!`
        } else if (userInputLower.includes('flight') || userInputLower.includes('fly')) {
          aiResponse = `I can help you find flights! First, let me know where you want to go, and I'll help you search for the best flight options.`
        } else if (userInputLower.includes('budget') || userInputLower.includes('cost') || userInputLower.includes('price')) {
          aiResponse = `I can help you plan within your budget! Tell me your destination and budget range, and I'll create a personalized itinerary that fits your financial goals.`
        } else if (userInputLower.includes('recommend') || userInputLower.includes('suggest')) {
          aiResponse = `I'd be happy to recommend destinations! What type of trip are you looking for? (e.g., beach vacation, city exploration, adventure, cultural experience)`
        } else if (userInputLower.includes('weather') || userInputLower.includes('climate')) {
          aiResponse = `I can help you plan around the weather! What destination are you thinking about, and when do you want to travel?`
        } else if (userInputLower.includes('food') || userInputLower.includes('restaurant') || userInputLower.includes('cuisine')) {
          aiResponse = `I love helping with food recommendations! Tell me where you're going, and I'll suggest the best local restaurants and must-try dishes.`
        } else if (userInputLower.includes('hotel') || userInputLower.includes('accommodation') || userInputLower.includes('stay')) {
          aiResponse = `I can help you find the perfect place to stay! What's your destination and budget range for accommodation?`
        }
        
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai' as const,
          text: aiResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Error sending message:', error)
        const errorMessage = {
          id: messages.length + 2,
          type: 'ai' as const,
          text: 'Sorry, I encountered an error. Please try again!',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }

    setChatInput('')
    setIsTyping(false)
  }

  const handleQuickAsk = (question: string) => {
    // Handle special flight search requests
    if (question.toLowerCase().includes('search for flights')) {
      const currentDestination = tripDetails.destination || 'your destination'
      // If we have a destination, show flight search component
      setShowPlanningFlow(true)
      const flightMessage = {
        id: Date.now(),
        type: 'user',
        text: `I want to search for flights to ${currentDestination}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, flightMessage])
      
      // Auto-fill arrival city if we have destination
      if (tripDetails.destination) {
        setFlightData(prev => ({
          ...prev,
          arrivalCity: tripDetails.destination
        }))
      }
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: `Great! I'll help you find flights to ${currentDestination}. Please enter your departure city and dates in the flight search form below.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } else {
      // Handle regular questions
      setChatInput(question)
      // Auto-send the quick ask
      setTimeout(() => sendMessage(), 100)
    }
  }

  // Trip Planning Functions
  const startPlanningFlow = () => {
    setShowPlanningFlow(true)
    setPlanningStep('chat')
    // Add initial planning message to chat
    const planningMessage = {
      id: messages.length + 1,
      type: 'ai',
      text: `🎯 Let's plan your perfect trip! I'll help you create a detailed itinerary.\n\nTo get started, tell me:\n• Where would you like to go?\n• When are you planning to travel?\n• How many travelers?\n• What's your budget range?\n• What are your main interests?`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, planningMessage])
  }

  const handlePlanningChat = async (userInput: string) => {
    // Extract trip details from user input using AI QA system
    try {
      const response = await fetch('/v1/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tripId: 'workspace-trip',
          messages: [{ role: 'user', content: userInput }]
        })
      })
      
      if (response.ok) {
        const qaResult = await response.json()
        
        // Update trip details based on QA response
        if (qaResult.collected) {
          setTripDetails(prev => ({
            ...prev,
            destination: qaResult.collected.destination || prev.destination,
            startDate: qaResult.collected.startDate || prev.startDate,
            endDate: qaResult.collected.endDate || prev.endDate,
            travelers: qaResult.collected.travelers || prev.travelers,
            budget: qaResult.collected.budgetTotal?.toString() || prev.budget,
            interests: qaResult.collected.interests || prev.interests,
            style: qaResult.collected.pace || prev.style
          }))

          // Also update flight data if destination is provided
          if (qaResult.collected.destination) {
            setFlightData(prev => ({
              ...prev,
              arrivalCity: qaResult.collected.destination,
              departureDate: qaResult.collected.startDate || prev.departureDate,
              returnDate: qaResult.collected.endDate || prev.returnDate,
              passengers: qaResult.collected.travelers || prev.passengers
            }))
          }
        }
        
        // Add AI response to chat
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai' as const,
          text: qaResult.followUpQuestions?.[0] || 'I understand! Tell me more about your trip preferences.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        
        // Check if we have enough information to generate itinerary
        const hasBasicInfo = qaResult.collected?.destination && qaResult.collected?.startDate && qaResult.collected?.endDate
        
        if (hasBasicInfo) {
          // Add a message about generating itinerary
          const itineraryMessage = {
            id: messages.length + 3,
            type: 'ai',
            text: `Perfect! I have all the information I need for your trip to ${qaResult.collected.destination}. Let me create a personalized itinerary for you!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, itineraryMessage])
          
          // Generate itinerary after a short delay
          setTimeout(() => {
            generateItinerary(qaResult.collected.destination)
          }, 1500)
        }
      } else {
        // Fallback response if API fails
        const fallbackMessage = {
          id: messages.length + 2,
          type: 'ai' as const,
          text: 'I\'m here to help you plan your trip! Could you tell me where you\'d like to go and when?',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackMessage])
      }
    } catch (error) {
      console.error('Error in planning chat:', error)
      // Fallback response on error
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai' as const,
        text: 'I\'m having trouble processing that right now. Let\'s try a different approach - where would you like to travel?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Test function to verify itinerary display
  const testItineraryDisplay = () => {
    const testItinerary = {
      days: [
        {
          title: 'Day 1: Welcome to Paris',
          description: 'Arrive in Paris, check into hotel, explore the city',
          activities: ['Airport transfer', 'Hotel check-in', 'Eiffel Tower visit']
        },
        {
          title: 'Day 2: Cultural Paris',
          description: 'Visit museums and historical sites',
          activities: ['Louvre Museum', 'Notre-Dame Cathedral', 'Seine River cruise']
        }
      ]
    }
    
    const testMessage = {
      id: Date.now(),
      type: 'ai',
      text: '🎉 Test itinerary ready! This is a sample itinerary for Paris.',
      timestamp: new Date(),
      itinerary: testItinerary
    }
    
    console.log('🧪 Adding test message:', testMessage)
    setMessages(prev => [...prev, testMessage])
  }

  const generateItinerary = async (destination?: string) => {
    console.log('🚀 Starting itinerary generation for destination:', destination)
    console.log('📋 Current tripDetails:', tripDetails)
    
    setPlanningStep('generating')
    setIsGeneratingItinerary(true)
    
    try {
      console.log('📡 Calling itinerary API...')
      const response = await fetch('/v1/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: 'workspace-trip'
        })
      })
      
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const itinerary = await response.json()
        console.log('📋 Raw itinerary data:', itinerary)
        
        setGeneratedItinerary(itinerary)
        setPlanningStep('itinerary')
        
        // Format the itinerary for better display
        let formattedItinerary = {
          days: []
        }
        
        if (itinerary.days && Array.isArray(itinerary.days)) {
          formattedItinerary.days = itinerary.days.map((day, index) => {
            console.log('📅 Processing day:', day)
            return {
              title: day.summary || day.title || `Day ${index + 1}`,
              description: day.items && Array.isArray(day.items) 
                ? day.items.map(item => `${item.time || ''} - ${item.title || item.name || 'Activity'}`).join(', ')
                : day.description || 'Explore the destination',
              activities: day.items && Array.isArray(day.items)
                ? day.items.map(item => item.title || item.name || 'Activity')
                : day.activities || ['Local exploration']
            }
          })
        } else {
          console.log('⚠️ No days array found, creating fallback')
          formattedItinerary.days = [
            {
              title: 'Day 1: Welcome to ' + (destination || 'Your Destination'),
              description: 'Start your adventure with arrival and orientation.',
              activities: ['Arrival', 'Orientation', 'Welcome dinner']
            }
          ]
        }
        
        console.log('🎨 Formatted itinerary:', formattedItinerary)
        
        // Add itinerary to chat with proper state update
        const itineraryMessage = {
          id: Date.now(), // Use timestamp to ensure unique ID
          type: 'ai',
          text: `🎉 Your personalized itinerary is ready! I've created a detailed ${formattedItinerary.days.length}-day plan for your trip to ${destination || 'your destination'}. The total estimated cost is $${itinerary.estimatedTotal || 'TBD'}.`,
          timestamp: new Date(),
          itinerary: formattedItinerary
        }
        
        console.log('💬 Adding itinerary message to chat:', itineraryMessage)
        
        // Use functional state update to ensure proper state management
        setMessages(prevMessages => {
          console.log('📝 Previous messages count:', prevMessages.length)
          const newMessages = [...prevMessages, itineraryMessage]
          console.log('📝 New messages count:', newMessages.length)
          return newMessages
        })
        
        // Add a follow-up message about flights
        setTimeout(() => {
          const followUpMessage = {
            id: Date.now() + 1,
            type: 'ai',
            text: `Now that your itinerary is ready, would you like me to help you find flights to ${destination || 'your destination'}? Just let me know your departure city!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, followUpMessage])
        }, 1000)
        
      } else {
        console.log('❌ API failed with status:', response.status)
        // Fallback itinerary if API fails
        const fallbackItinerary = {
          days: [
            {
              title: 'Day 1: Arrival & Exploration',
              description: 'Arrive in ' + (destination || 'your destination') + ', check into accommodation, and explore the local area.',
              activities: ['Airport transfer', 'Hotel check-in', 'Local walking tour']
            },
            {
              title: 'Day 2: Cultural Highlights',
              description: 'Visit the main attractions and cultural sites of ' + (destination || 'your destination') + '.',
              activities: ['Museum visits', 'Historical sites', 'Local cuisine']
            },
            {
              title: 'Day 3: Adventure & Relaxation',
              description: 'Mix of adventure activities and relaxation time in ' + (destination || 'your destination') + '.',
              activities: ['Outdoor activities', 'Spa/wellness', 'Evening entertainment']
            }
          ]
        }
        
        setGeneratedItinerary(fallbackItinerary)
        setPlanningStep('itinerary')
        
        const fallbackMessage = {
          id: Date.now(),
          type: 'ai',
          text: `🎉 I've created a sample 3-day itinerary for your trip to ${destination || 'your destination'}! Here's what I recommend:`,
          timestamp: new Date(),
          itinerary: fallbackItinerary
        }
        setMessages(prev => [...prev, fallbackMessage])
      }
    } catch (error) {
      console.error('💥 Error generating itinerary:', error)
      
      // Fallback itinerary on error
      const errorItinerary = {
        days: [
          {
            title: 'Day 1: Welcome to ' + (destination || 'Your Destination'),
            description: 'Start your adventure with arrival and orientation.',
            activities: ['Arrival', 'Orientation', 'Welcome dinner']
          }
        ]
      }
      
      setGeneratedItinerary(errorItinerary)
      setPlanningStep('itinerary')
      
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        text: 'I\'ve created a basic itinerary for you. You can customize it further based on your preferences!',
        timestamp: new Date(),
        itinerary: errorItinerary
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      console.log('✅ Itinerary generation completed')
      setIsGeneratingItinerary(false)
    }
  }

  const closePlanningFlow = () => {
    setShowPlanningFlow(false)
    setPlanningStep('chat')
    setTripDetails({
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 1,
      budget: '',
      interests: [],
      style: ''
    })
    setGeneratedItinerary(null)
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setIsUploadingProfile(true)

      // Simulate upload process
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePicture(e.target?.result as string)
          setIsUploadingProfile(false)
        }
        reader.readAsDataURL(file)
      }, 1500)
    }
  }

  const removeProfilePicture = () => {
    setProfilePicture(null)
    if (profilePictureRef.current) {
      profilePictureRef.current.value = ''
    }
  }

  // Flight-related functions
  const searchFlights = async () => {
    if (!flightData.departureCity || !flightData.arrivalCity || !flightData.departureDate) {
      alert('Please fill in departure city, arrival city, and departure date')
      return
    }

    setIsSearchingFlights(true)
    
    try {
      // Simulate flight search API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock flight data
      const mockFlights = [
        {
          id: 1,
          airline: 'American Airlines',
          flightNumber: 'AA123',
          departure: {
            time: '08:00',
            airport: flightData.departureCity,
            terminal: 'A'
          },
          arrival: {
            time: '10:30',
            airport: flightData.arrivalCity,
            terminal: 'B'
          },
          duration: '2h 30m',
          price: 299,
          cabinClass: flightData.cabinClass,
          stops: 0,
          aircraft: 'Boeing 737'
        },
        {
          id: 2,
          airline: 'Delta Airlines',
          flightNumber: 'DL456',
          departure: {
            time: '12:15',
            airport: flightData.departureCity,
            terminal: 'C'
          },
          arrival: {
            time: '15:45',
            airport: flightData.arrivalCity,
            terminal: 'A'
          },
          duration: '3h 30m',
          price: 199,
          cabinClass: flightData.cabinClass,
          stops: 1,
          aircraft: 'Airbus A320'
        },
        {
          id: 3,
          airline: 'United Airlines',
          flightNumber: 'UA789',
          departure: {
            time: '16:30',
            airport: flightData.departureCity,
            terminal: 'B'
          },
          arrival: {
            time: '18:45',
            airport: flightData.arrivalCity,
            terminal: 'C'
          },
          duration: '2h 15m',
          price: 349,
          cabinClass: flightData.cabinClass,
          stops: 0,
          aircraft: 'Boeing 787'
        }
      ]
      
      setAvailableFlights(mockFlights)
      
      // Add flight search results to chat
      const flightMessage = {
        id: messages.length + 1,
        type: 'ai',
        text: `✈️ Found ${mockFlights.length} flights from ${flightData.departureCity} to ${flightData.arrivalCity} on ${flightData.departureDate}. Here are the best options:`,
        timestamp: new Date(),
        flights: mockFlights
      }
      
      setMessages(prev => [...prev, flightMessage])
      
    } catch (error) {
      console.error('Error searching flights:', error)
      const errorMessage = {
        id: messages.length + 1,
        type: 'ai',
        text: 'Sorry, I encountered an error while searching for flights. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSearchingFlights(false)
    }
  }

  const selectFlight = (flight) => {
    setSelectedFlight(flight)
    
    // Add flight selection to chat
    const selectionMessage = {
      id: messages.length + 1,
      type: 'user',
      text: `I selected ${flight.airline} flight ${flight.flightNumber} for $${flight.price}`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, selectionMessage])
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        text: `Great choice! ${flight.airline} flight ${flight.flightNumber} is confirmed. Your flight departs at ${flight.departure.time} and arrives at ${flight.arrival.time}. Would you like me to help you with accommodation or activities at your destination?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const bookFlight = async (flight) => {
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const bookingMessage = {
        id: messages.length + 1,
        type: 'ai',
        text: `🎉 Flight booked successfully! Your booking reference is ${Math.random().toString(36).substr(2, 8).toUpperCase()}. You'll receive a confirmation email shortly.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, bookingMessage])
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      notification.textContent = '✅ Flight booked successfully!'
      document.body.appendChild(notification)
      setTimeout(() => document.body.removeChild(notification), 3000)
      
    } catch (error) {
      console.error('Error booking flight:', error)
      const errorMessage = {
        id: messages.length + 1,
        type: 'ai',
        text: 'Sorry, there was an error processing your booking. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }









  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: `📎 ${file.name}`,
        timestamp: new Date(),
        file: file
      }
      
      setMessages(prev => [...prev, userMessage])
      setIsTyping(true)

      // Simulate AI response to file
      setTimeout(() => {
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          text: "I can see you've shared a file! I'm analyzing it to help you plan your trip better. What would you like to know about this destination?",
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }, 2000)
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        const userMessage = {
          id: messages.length + 1,
          type: 'user',
          text: "🎤 [Voice message: I'd like to visit Paris for 4 days with a budget of $1000]",
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, userMessage])
        setIsRecording(false)
        setIsTyping(true)

        // Simulate AI response to voice
        setTimeout(() => {
          const aiMessage = {
            id: messages.length + 2,
            type: 'ai',
            text: "I heard you want to visit Paris for 4 days with a $1000 budget! That's perfect timing. Let me create a magical itinerary for you with some hidden gems and local favorites! ✨",
            timestamp: new Date()
          }
          
          setMessages(prev => [...prev, aiMessage])
          setIsTyping(false)
        }, 1500)
      }, 3000)
    }
  }





  // Don't render until client-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7]">
        <div className="text-center">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TripWeaver...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7]">
      {/* Top Navigation Header - Full Width */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="size-8 rounded-xl bg-yellow-400 text-slate-900 grid place-items-center font-black">TW</div>
              <span className="font-semibold">TripWeaver</span>
            </a>
            <div className="h-6 w-px bg-amber-200/50"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">AI Travel Assistant</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition">
              ➕ Invite
            </button>
            <button className="p-2 text-slate-600 hover:bg-amber-50 rounded-lg transition">📤</button>
            <button className="p-2 text-slate-600 hover:bg-amber-50 rounded-lg transition">⚙️</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur border-r border-amber-200/50 flex flex-col">
          {/* Navigation */}
          <div className="flex-1 p-4 space-y-1">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm font-medium text-slate-900">💬 Chats</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">2</span>
            </div>
            <a href="/explore" className="block">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
                <span className="text-sm text-slate-700">🔍 Explore</span>
              </div>
            </a>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">❤️ Saved</span>
            </div>
            <a href="/trips" className="block">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
                <span className="text-sm text-slate-700">💼 Trips</span>
              </div>
            </a>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">🔔 Updates</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition">
              <span className="text-sm text-slate-700">✈️ Inspiration</span>
            </div>
            <button 
              onClick={() => setShowPlanningModal(true)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition"
            >
              <span className="text-sm text-slate-700">➕ Create</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-amber-200/50 space-y-3">
            <button 
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold transition active:scale-[.99] text-slate-900 shadow-sm ring-1 ring-black/5"
              style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
            >
              ➕ New chat
            </button>
            <button className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-amber-50/50 rounded-lg transition ring-1 ring-amber-200/50">
              📤 Export PDF
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-amber-200/50 space-y-3">
            <button 
              onClick={() => setShowTravelerModal(true)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 cursor-pointer transition"
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-200"
                />
              ) : (
                <div className="w-6 h-6 bg-amber-100 rounded-full ring-1 ring-amber-200"></div>
              )}
              <span className="text-sm text-slate-700">Traveler</span>
              <span className="ml-auto text-xs text-slate-400">→</span>
            </button>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Company Contact Help</div>
              <div>Terms Privacy</div>
              <div>© 2025 TripWeaver, Inc.</div>
            </div>
          </div>
        </div>

        {/* Middle Panel - AI Chat and Recent Trips */}
        <div className="flex-1 flex flex-col">
          {/* AI Chat Section - Top Half */}
          <div className="h-1/2 p-6 space-y-4 overflow-y-auto border-b border-amber-200/50">
            {/* Chat Messages */}
            <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-amber-200/50 shadow-sm p-4 h-64 overflow-y-auto">
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${message.itinerary ? 'max-w-md' : 'max-w-xs'} px-4 py-2 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' 
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      
                      {/* Display itinerary if attached */}
                      {message.itinerary && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-xs font-medium text-slate-600 mb-2">✨ Your Personalized Itinerary</div>
                          <div className="space-y-2">
                            {message.itinerary.days?.map((day: any, index: number) => (
                              <div key={index} className="text-xs">
                                <div className="font-medium text-slate-800">Day {index + 1}: {day.title || day.activities?.[0]}</div>
                                <div className="text-slate-600 text-xs">{day.description || day.activities?.join(', ')}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button 
                              onClick={() => {
                                // Simulate saving trip
                                const notification = document.createElement('div')
                                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                                notification.textContent = '✅ Trip saved successfully!'
                                document.body.appendChild(notification)
                                setTimeout(() => document.body.removeChild(notification), 3000)
                              }}
                              className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-200 transition"
                            >
                              💾 Save Trip
                            </button>
                            <button 
                              onClick={() => {
                                // Simulate PDF export
                                const notification = document.createElement('div')
                                notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                                notification.textContent = '📄 PDF export started...'
                                document.body.appendChild(notification)
                                setTimeout(() => document.body.removeChild(notification), 3000)
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition"
                            >
                              📄 Export PDF
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display flights if attached */}
                      {message.flights && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-xs font-medium text-slate-600 mb-2">✈️ Available Flights</div>
                          <div className="space-y-2">
                            {message.flights.map((flight: any) => (
                              <div key={flight.id} className="text-xs border-b border-slate-100 pb-2 last:border-b-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-slate-800">{flight.airline} {flight.flightNumber}</div>
                                    <div className="text-slate-600">{flight.departure.time} - {flight.arrival.time} • {flight.duration}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-slate-800">${flight.price}</div>
                                    <div className="text-slate-600">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button 
                              onClick={() => {
                                // Simulate flight booking
                                const notification = document.createElement('div')
                                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                                notification.textContent = '✈️ Flight search completed!'
                                document.body.appendChild(notification)
                                setTimeout(() => document.body.removeChild(notification), 3000)
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition"
                            >
                              View All Flights
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">TripWeaver is typing</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {isGeneratingItinerary && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 px-4 py-3 rounded-2xl max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Generating Your Itinerary</div>
                          <div className="text-xs text-blue-700">This may take a few moments...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Start Planning Button */}
            {!showPlanningFlow && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg p-4 text-center">
                <button 
                  onClick={startPlanningFlow}
                  className="w-full bg-white/90 hover:bg-white text-amber-600 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  🎯 Start Planning Your Trip
                </button>
                <p className="text-white/90 text-xs mt-2">Get a personalized itinerary with our AI</p>
              </div>
            )}

            {/* Test Itinerary Button */}
            <div className="rounded-2xl bg-gradient-to-r from-red-400 to-red-500 shadow-lg p-4 text-center">
              <button 
                onClick={testItineraryDisplay}
                className="w-full bg-white/90 hover:bg-white text-red-600 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                  🧪 Test Itinerary Display
              </button>
              <p className="text-white/90 text-xs mt-2">Test if itinerary display works</p>
            </div>

            {/* Trip Planning Status */}
            {showPlanningFlow && (
              <div className="rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse"></div>
                    <span className="font-medium">
                      {planningStep === 'chat' && '🎯 Planning Mode Active'}
                      {planningStep === 'generating' && '⚡ Generating Itinerary...'}
                      {planningStep === 'itinerary' && '✅ Itinerary Ready!'}
                    </span>
                  </div>
                  <button 
                    onClick={closePlanningFlow}
                    className="text-white/70 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Quick Asks */}
            <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-amber-200/50 shadow-sm p-4">
              <h3 className="font-medium text-slate-900 mb-3">
                {showPlanningFlow ? 'Trip Planning Suggestions' : 'You might want to ask'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickAsks.map((ask, index) => (
                  <button 
                    key={index}
                    onClick={() => handleQuickAsk(ask)} 
                    className="px-3 py-1.5 rounded-full bg-amber-50/50 text-slate-700 hover:bg-amber-100/50 text-sm transition ring-1 ring-amber-200/50"
                  >
                    {ask}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Chat Input */}
            <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-amber-200/50 shadow-sm p-4">
              <div className="flex items-center gap-3">
                {/* File Upload */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-amber-600 cursor-pointer transition"
                  title="Add photo or video"
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Text Input */}
                <input
                  type="text"
                  placeholder="Ask anything about your trip..."
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                
                {/* Voice Record */}
                <button 
                  onClick={handleVoiceRecord}
                  className={`cursor-pointer transition ${
                    isRecording 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-slate-400 hover:text-amber-600'
                  }`}
                  title={isRecording ? "Recording..." : "Voice message"}
                >
                  {isRecording ? '🔴' : '🎤'}
                </button>
                
                {/* Send Button */}
                <button 
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className={`cursor-pointer transition ${
                    chatInput.trim() 
                      ? 'text-amber-600 hover:text-amber-700' 
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  📤
                </button>
              </div>
              
              {/* Input Status */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500">TripWeaver can make mistakes. Check important info.</p>
                {chatInput.length > 0 && (
                  <p className="text-xs text-slate-400">{chatInput.length} characters</p>
                )}
              </div>
            </div>

            {/* Flight Search Component */}
            {showPlanningFlow && tripDetails.destination && (
              <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-amber-200/50 shadow-sm p-4">
                <h3 className="font-medium text-slate-900 mb-3">✈️ Flight Search</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Departure City"
                      value={flightData.departureCity}
                      onChange={(e) => setFlightData(prev => ({ ...prev, departureCity: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Arrival City"
                      value={flightData.arrivalCity}
                      onChange={(e) => setFlightData(prev => ({ ...prev, arrivalCity: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={flightData.departureDate}
                      onChange={(e) => setFlightData(prev => ({ ...prev, departureDate: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="date"
                      value={flightData.returnDate}
                      onChange={(e) => setFlightData(prev => ({ ...prev, returnDate: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={flightData.cabinClass}
                      onChange={(e) => setFlightData(prev => ({ ...prev, cabinClass: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First Class</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Passengers"
                      value={flightData.passengers}
                      onChange={(e) => setFlightData(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-24"
                    />
                  </div>
                  <button
                    onClick={searchFlights}
                    disabled={isSearchingFlights || !flightData.departureCity || !flightData.arrivalCity || !flightData.departureDate}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      isSearchingFlights || !flightData.departureCity || !flightData.arrivalCity || !flightData.departureDate
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600'
                    }`}
                  >
                    {isSearchingFlights ? '🔍 Searching...' : '✈️ Search Flights'}
                  </button>
                </div>

                {/* Flight Results */}
                {availableFlights.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-slate-900">Available Flights:</h4>
                    {availableFlights.map((flight) => (
                      <div key={flight.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{flight.airline}</span>
                            <span className="text-sm text-slate-600">{flight.flightNumber}</span>
                          </div>
                          <span className="font-bold text-lg">${flight.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <div>
                            <div>{flight.departure.time} - {flight.arrival.time}</div>
                            <div className="text-xs">{flight.duration} • {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
                          </div>
                          <div className="text-right">
                            <div>{flight.departure.airport} → {flight.arrival.airport}</div>
                            <div className="text-xs">{flight.cabinClass}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => selectFlight(flight)}
                            className="flex-1 py-1 px-3 bg-amber-100 text-amber-700 rounded text-sm hover:bg-amber-200 transition"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => bookFlight(flight)}
                            className="flex-1 py-1 px-3 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Recent Trips Section - Bottom Half */}
          <div className="h-1/2 p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Trips Created</h2>
              <span className="text-xs text-slate-500">By other travelers</span>
            </div>
            
            <div className="space-y-3">
              {recentTrips.map(trip => (
                <div key={trip.id} className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-amber-200/50 shadow-sm p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{trip.destination}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                        <span>📅 {trip.duration}</span>
                        <span>💰 {trip.budget}</span>
                      </div>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700 font-medium">Top Activities:</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.activities.map((activity, index) => (
                        <span key={index} className="px-2 py-1 bg-amber-50/50 text-slate-700 text-xs rounded-full ring-1 ring-amber-200/50">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>✨ Inspired by community</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition">
                      Use as Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/3 bg-white/80 backdrop-blur border-l border-amber-200/50 relative">
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10">
            <button className="p-2 bg-white/90 backdrop-blur rounded-lg ring-1 ring-amber-200/50 hover:bg-white transition">
              ←
            </button>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <button className="p-2 bg-white/90 backdrop-blur rounded-lg ring-1 ring-amber-200/50 hover:bg-white transition">
              ⚙️
            </button>
          </div>

          {/* Map Content */}
          <div className="w-full h-full bg-gradient-to-br from-amber-50/50 to-yellow-100/50 relative">
            {/* Map Placeholder with POIs */}
            <div className="absolute inset-0 bg-amber-200/20 opacity-30"></div>
            
            {/* POI Markers */}
            <div className="absolute top-20 left-20">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  🏛️ <span className="font-medium">Musée de Montmartre</span> ✅
                </div>
              </div>
            </div>

            <div className="absolute top-32 left-32">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  🍽️ <span className="font-medium">Bouillon Pigalle</span> 💰💰 ✅
                </div>
              </div>
            </div>

            <div className="absolute top-40 left-16">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  📍 <span className="font-medium">Square Louise Michel</span> ✅
                </div>
              </div>
            </div>

            <div className="absolute top-60 left-40">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  🏛️ <span className="font-medium">Musée d'Orsay</span> ✅
                </div>
              </div>
            </div>

            <div className="absolute top-80 left-24">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  📍 <span className="font-medium">Latin Quarter</span> ✅
                </div>
              </div>
            </div>

            <div className="absolute top-100 left-36">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  🍽️ <span className="font-medium">Pizza Julia</span> 💰 ✅
                </div>
              </div>
            </div>

            <div className="absolute top-120 left-20">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1 mb-1">
                  🌸 <span className="font-medium">Luxembourg Gardens</span> ✅
                </div>
              </div>
            </div>

            {/* Price Tag */}
            <div className="absolute top-140 left-28">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm ring-1 ring-amber-200/50 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-green-600">$308</span> ✅
                </div>
                <div className="text-xs text-slate-600">The People Paris Marais</div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
              <button className="p-2 w-8 h-8 bg-white/90 backdrop-blur rounded-lg ring-1 ring-amber-200/50 hover:bg-white transition">
                <span className="text-sm font-bold">+</span>
              </button>
              <button className="p-2 w-8 h-8 bg-white/90 backdrop-blur rounded-lg ring-1 ring-amber-200/50 hover:bg-white transition">
                <span className="text-sm font-bold">-</span>
              </button>
            </div>

            {/* Map Attribution */}
            <div className="absolute bottom-2 left-2 text-xs text-slate-500">
              <div>Keyboard shortcuts</div>
              <div>Map Data ©2025 Google</div>
              <div>1 km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveler Modal */}
      {showTravelerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-200/50">
              <div className="flex items-center gap-3">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-amber-100 rounded-full ring-1 ring-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 font-medium">{userName.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{userName}</h2>
                  <p className="text-sm text-slate-600">Traveler Account</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTravelerModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-amber-200/50">
              {travelerTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTravelerTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
                    activeTravelerTab === tab.id
                      ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTravelerTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
                    
                    {/* Profile Picture Section */}
                    <div className="mb-6 p-6 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profilePicture ? (
                            <img 
                              src={profilePicture} 
                              alt="Profile" 
                              className="w-20 h-20 rounded-full object-cover ring-2 ring-amber-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-amber-100 rounded-full ring-2 ring-amber-200 flex items-center justify-center">
                              <span className="text-amber-700 font-bold text-2xl">{userName.charAt(0)}</span>
                            </div>
                          )}
                          {isUploadingProfile && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-2">Profile Picture</h4>
                          <p className="text-sm text-slate-600 mb-3">
                            Upload a photo to personalize your profile. We recommend a square image (1:1 ratio) for best results.
                          </p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => profilePictureRef.current?.click()}
                              disabled={isUploadingProfile}
                              className="px-4 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUploadingProfile ? 'Uploading...' : '📷 Upload Photo'}
                            </button>
                            {profilePicture && (
                              <button 
                                onClick={removeProfilePicture}
                                disabled={isUploadingProfile}
                                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg ring-1 ring-red-200 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                🗑️ Remove
                              </button>
                            )}
                          </div>
                          <input
                            ref={profilePictureRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Email Address</p>
                          <p className="text-sm text-slate-600">{travelerSettings.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newEmail = prompt('Enter new email address:', travelerSettings.email)
                            if (newEmail && newEmail !== travelerSettings.email) {
                              setTravelerSettings({...travelerSettings, email: newEmail})
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition"
                        >
                          Edit
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Password</p>
                          <p className="text-sm text-slate-600">Last changed 30 days ago</p>
                        </div>
                        <button className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition">
                          Change
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Notifications</p>
                          <p className="text-sm text-slate-600">
                            {travelerSettings.notifications ? 'Email and push notifications enabled' : 'Notifications disabled'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setTravelerSettings({...travelerSettings, notifications: !travelerSettings.notifications})}
                          className={`px-3 py-1.5 text-sm rounded-lg ring-1 transition ${
                            travelerSettings.notifications 
                              ? 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100' 
                              : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {travelerSettings.notifications ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">Language</p>
                          <p className="text-sm text-slate-600">{travelerSettings.language}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Italian']
                            const currentIndex = languages.indexOf(travelerSettings.language)
                            const nextIndex = (currentIndex + 1) % languages.length
                            setTravelerSettings({...travelerSettings, language: languages[nextIndex]})
                          }}
                          className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-lg ring-1 ring-amber-200 hover:bg-amber-100 transition"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'feedback' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Feedback</h3>
                    <p className="text-slate-600 mb-6">We'd love to hear your thoughts about TripWeaver! Your feedback helps us improve and create better experiences for all travelers.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                        <select 
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        >
                          <option>General Feedback</option>
                          <option>Bug Report</option>
                          <option>Feature Request</option>
                          <option>Praise</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
                        <textarea 
                          rows={6}
                          placeholder="Tell us what you think..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
                        ></textarea>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="contact" className="rounded border-amber-200/50" />
                        <label htmlFor="contact" className="text-sm text-slate-700">
                          I'd like to be contacted about this feedback
                        </label>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (feedbackMessage.trim()) {
                            alert('Thank you for your feedback! We appreciate your input.')
                            setFeedbackMessage('')
                            setFeedbackType('General Feedback')
                          } else {
                            alert('Please enter your feedback message.')
                          }
                        }}
                        className="w-full px-6 py-3 rounded-xl text-white font-medium transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                        style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy Policy</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
                      <p><strong>Last updated:</strong> January 15, 2025</p>
                      
                      <h4 className="font-semibold text-slate-900">Information We Collect</h4>
                      <p>We collect information you provide directly to us, such as when you create an account, plan trips, or contact us for support. This may include:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Name, email address, and contact information</li>
                        <li>Trip preferences and travel history</li>
                        <li>Payment information (processed securely by third-party providers)</li>
                        <li>Communications with our support team</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">How We Use Your Information</h4>
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Personalize your travel planning experience</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">Information Sharing</h4>
                      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                      
                      <h4 className="font-semibold text-slate-900">Data Security</h4>
                      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                      
                      <h4 className="font-semibold text-slate-900">Your Rights</h4>
                      <p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us directly.</p>
                      
                      <h4 className="font-semibold text-slate-900">Contact Us</h4>
                      <p>If you have questions about this Privacy Policy, please contact us at privacy@tripweaver.com</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTravelerTab === 'terms' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Terms of Service</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
                      <p><strong>Last updated:</strong> January 15, 2025</p>
                      
                      <h4 className="font-semibold text-slate-900">Acceptance of Terms</h4>
                      <p>By accessing and using TripWeaver, you accept and agree to be bound by the terms and provision of this agreement.</p>
                      
                      <h4 className="font-semibold text-slate-900">Description of Service</h4>
                      <p>TripWeaver provides AI-powered travel planning services, including itinerary creation, booking assistance, and travel recommendations.</p>
                      
                      <h4 className="font-semibold text-slate-900">User Accounts</h4>
                      <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                      
                      <h4 className="font-semibold text-slate-900">Acceptable Use</h4>
                      <p>You agree not to use the service to:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe upon the rights of others</li>
                        <li>Transmit harmful, offensive, or inappropriate content</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                      </ul>
                      
                      <h4 className="font-semibold text-slate-900">Intellectual Property</h4>
                      <p>The service and its original content, features, and functionality are owned by TripWeaver and are protected by international copyright, trademark, and other intellectual property laws.</p>
                      
                      <h4 className="font-semibold text-slate-900">Limitation of Liability</h4>
                      <p>TripWeaver shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
                      
                      <h4 className="font-semibold text-slate-900">Termination</h4>
                      <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users or us.</p>
                      
                      <h4 className="font-semibold text-slate-900">Changes to Terms</h4>
                      <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
                      
                      <h4 className="font-semibold text-slate-900">Contact Information</h4>
                      <p>If you have any questions about these Terms of Service, please contact us at legal@tripweaver.com</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-medium">Trip Created Successfully!</p>
            <p className="text-sm opacity-90">Your trip has been saved to your trips list.</p>
          </div>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="ml-4 hover:bg-green-600 p-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Trip Planning Modal */}
      {showPlanningModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-amber-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Plan Your Trip</h2>
                <button 
                  onClick={() => {
                    setShowPlanningModal(false)
                    setPlanningStep(1)
                    setTripData({
                      destination: '',
                      startDate: '',
                      endDate: '',
                      travelers: 1,
                      budget: '',
                      interests: [],
                      accommodation: '',
                      transportation: ''
                    })
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= planningStep 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        step < planningStep ? 'bg-amber-400' : 'bg-slate-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {planningStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Where are you going?</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Destination</label>
                    <input
                      type="text"
                      placeholder="e.g., Paris, France"
                      value={tripData.destination}
                      onChange={(e) => setTripData({...tripData, destination: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={tripData.startDate}
                        onChange={(e) => setTripData({...tripData, startDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={tripData.endDate}
                        onChange={(e) => setTripData({...tripData, endDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Travelers</label>
                    <select
                      value={tripData.travelers}
                      onChange={(e) => setTripData({...tripData, travelers: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'traveler' : 'travelers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {planningStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">What's your budget?</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={tripData.budget}
                        onChange={(e) => setTripData({...tripData, budget: e.target.value})}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Budget', 'Mid-range', 'Luxury'].map(level => (
                        <button
                          key={level}
                          className={`px-4 py-3 rounded-xl border transition ${
                            tripData.budget === level 
                              ? 'border-amber-400 bg-amber-50 text-amber-700' 
                              : 'border-slate-200 hover:border-amber-200'
                          }`}
                          onClick={() => setTripData({...tripData, budget: level})}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {planningStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">What interests you?</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select your interests</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Culture & History', 'Food & Dining', 'Nature & Outdoors', 
                        'Shopping', 'Nightlife', 'Art & Museums', 'Adventure', 'Relaxation'
                      ].map(interest => (
                        <button
                          key={interest}
                          className={`px-4 py-3 rounded-xl border transition ${
                            tripData.interests.includes(interest)
                              ? 'border-amber-400 bg-amber-50 text-amber-700' 
                              : 'border-slate-200 hover:border-amber-200'
                          }`}
                          onClick={() => {
                            const newInterests = tripData.interests.includes(interest)
                              ? tripData.interests.filter(i => i !== interest)
                              : [...tripData.interests, interest]
                            setTripData({...tripData, interests: newInterests})
                          }}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {planningStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Final details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Accommodation Preference</label>
                    <select
                      value={tripData.accommodation}
                      onChange={(e) => setTripData({...tripData, accommodation: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Select preference</option>
                      <option value="hotel">Hotel</option>
                      <option value="hostel">Hostel</option>
                      <option value="apartment">Apartment</option>
                      <option value="resort">Resort</option>
                      <option value="bnb">Bed & Breakfast</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Transportation</label>
                    <select
                      value={tripData.transportation}
                      onChange={(e) => setTripData({...tripData, transportation: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Select preference</option>
                      <option value="public">Public Transport</option>
                      <option value="rental">Car Rental</option>
                      <option value="walking">Walking</option>
                      <option value="bike">Bicycle</option>
                      <option value="taxi">Taxi/Rideshare</option>
                    </select>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <h4 className="font-medium text-amber-900 mb-2">Trip Summary</h4>
                    <div className="text-sm text-amber-800 space-y-1">
                      <p><strong>Destination:</strong> {tripData.destination || 'Not specified'}</p>
                      <p><strong>Dates:</strong> {tripData.startDate} - {tripData.endDate}</p>
                      <p><strong>Travelers:</strong> {tripData.travelers}</p>
                      <p><strong>Budget:</strong> {tripData.budget}</p>
                      <p><strong>Interests:</strong> {tripData.interests.join(', ') || 'None selected'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-amber-200/50">
                <button
                  onClick={() => setPlanningStep(Math.max(1, planningStep - 1))}
                  disabled={planningStep === 1}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    planningStep === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Previous
                </button>
                
                {planningStep < 4 ? (
                  <button
                    onClick={() => {
                      // Basic validation
                      if (planningStep === 1 && (!tripData.destination || !tripData.startDate || !tripData.endDate)) {
                        alert('Please fill in all required fields: destination, start date, and end date.')
                        return
                      }
                      if (planningStep === 2 && !tripData.budget) {
                        alert('Please select a budget level.')
                        return
                      }
                      setPlanningStep(planningStep + 1)
                    }}
                    className="px-6 py-3 rounded-xl font-medium text-white transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                    style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Here you would typically save the trip data
                      setShowPlanningModal(false)
                      setPlanningStep(1)
                      setShowSuccessMessage(true)
                      // Reset trip data
                      setTripData({
                        destination: '',
                        startDate: '',
                        endDate: '',
                        travelers: 1,
                        budget: '',
                        interests: [],
                        accommodation: '',
                        transportation: ''
                      })
                      // Hide success message after 3 seconds
                      setTimeout(() => setShowSuccessMessage(false), 3000)
                    }}
                    className="px-6 py-3 rounded-xl font-medium text-white transition active:scale-[.99] shadow-sm ring-1 ring-black/5"
                    style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
                  >
                    Create Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
