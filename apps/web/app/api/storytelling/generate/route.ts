import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tripData, userPreferences, storyType } = await request.json();
    
    const story = generateTripStory(tripData, userPreferences, storyType);
    const immersiveContent = createImmersiveContent(story, tripData);
    
    return NextResponse.json({
      story,
      immersiveContent,
      shareableContent: generateShareableContent(story),
      interactiveElements: createInteractiveElements(story)
    });

  } catch (error) {
    console.error('Error generating trip story:', error);
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
  }
}

function generateTripStory(tripData: any, userPreferences: any, storyType: string) {
  const destination = tripData.form?.destination || "Paris";
  const duration = tripData.form?.travelers || 2;
  const budget = tripData.form?.budget || 1200;
  
  const storyTemplates = {
    "adventure": generateAdventureStory(destination, duration, budget),
    "romantic": generateRomanticStory(destination, duration, budget),
    "cultural": generateCulturalStory(destination, duration, budget),
    "luxury": generateLuxuryStory(destination, duration, budget),
    "budget": generateBudgetStory(destination, duration, budget),
    "family": generateFamilyStory(destination, duration, budget)
  };

  return storyTemplates[storyType as keyof typeof storyTemplates] || storyTemplates.adventure;
}

function generateAdventureStory(destination: string, duration: number, budget: number) {
  const stories = {
    "Paris": {
      title: "The Parisian Adventure: A Journey Through Time and Taste",
      chapters: [
        {
          title: "Chapter 1: The Arrival",
          content: `As the morning light painted the Seine in golden hues, you stepped into the heart of Paris, ready for an adventure that would weave through centuries of history and culture. The city greeted you with the aroma of freshly baked croissants and the distant sound of accordion music floating through narrow streets.`,
          mood: "excitement",
          timeOfDay: "morning",
          location: "Seine River",
          sensoryDetails: ["Golden light", "Fresh croissants", "Accordion music"]
        },
        {
          title: "Chapter 2: The Hidden Gems",
          content: `Beyond the well-trodden paths of tourists, you discovered Paris's secret corners. In the Marais, you stumbled upon a tiny boulangerie where the baker shared stories of his family's 100-year tradition. The warm baguette in your hands wasn't just bread—it was a piece of Parisian soul.`,
          mood: "discovery",
          timeOfDay: "afternoon",
          location: "Le Marais",
          sensoryDetails: ["Warm baguettes", "Family stories", "Secret corners"]
        },
        {
          title: "Chapter 3: The Night Awakens",
          content: `As dusk fell, Paris transformed into a city of lights and romance. You found yourself on a rooftop terrace, champagne in hand, watching the Eiffel Tower sparkle against the night sky. The city's energy was infectious, and you knew this was just the beginning of your Parisian adventure.`,
          mood: "romance",
          timeOfDay: "evening",
          location: "Rooftop terrace",
          sensoryDetails: ["Sparkling lights", "Champagne", "Night energy"]
        }
      ],
      themes: ["Discovery", "Culture", "Romance", "Adventure"],
      characters: ["The Curious Traveler", "The Wise Baker", "The Romantic City"],
      soundtrack: ["French accordion", "Jazz in the background", "Street sounds"]
    },
    "Rome": {
      title: "Eternal Rome: Where Every Stone Tells a Story",
      chapters: [
        {
          title: "Chapter 1: The Colosseum's Echo",
          content: `Standing in the shadow of the mighty Colosseum, you could almost hear the roar of ancient crowds. The stone walls whispered tales of gladiators and emperors, of triumphs and tragedies that shaped the course of history. Your adventure through time had begun.`,
          mood: "awe",
          timeOfDay: "morning",
          location: "Colosseum",
          sensoryDetails: ["Ancient stone", "Historical echoes", "Morning light"]
        },
        {
          title: "Chapter 2: The Vatican's Majesty",
          content: `Inside the Vatican Museums, you walked through corridors of art that spanned millennia. Each painting, each sculpture told a story of human creativity and divine inspiration. The Sistine Chapel's ceiling seemed to come alive, with Michelangelo's figures reaching down through the centuries.`,
          mood: "reverence",
          timeOfDay: "afternoon",
          location: "Vatican Museums",
          sensoryDetails: ["Art masterpieces", "Divine inspiration", "Centuries of history"]
        },
        {
          title: "Chapter 3: The Roman Night",
          content: `As night fell, Rome's piazzas came alive with the sound of laughter and clinking glasses. You joined locals at a trattoria, where the pasta was made fresh that morning and the wine flowed like the Tiber River. This was Rome as the Romans knew it.`,
          mood: "joy",
          timeOfDay: "evening",
          location: "Roman trattoria",
          sensoryDetails: ["Fresh pasta", "Local laughter", "Flowing wine"]
        }
      ],
      themes: ["History", "Art", "Culture", "Community"],
      characters: ["The Time Traveler", "The Ancient Stones", "The Roman People"],
      soundtrack: ["Classical music", "Italian conversations", "Church bells"]
    },
    "Tokyo": {
      title: "Tokyo Tales: A Journey Between Tradition and Tomorrow",
      chapters: [
        {
          title: "Chapter 1: The Digital Dawn",
          content: `In the neon-lit streets of Shibuya, you witnessed the future unfolding. The famous crossing pulsed with thousands of people, each carrying their own story. Technology and tradition danced together in perfect harmony, creating a symphony of urban life.`,
          mood: "fascination",
          timeOfDay: "morning",
          location: "Shibuya Crossing",
          sensoryDetails: ["Neon lights", "Crowd energy", "Urban symphony"]
        },
        {
          title: "Chapter 2: The Temple's Peace",
          content: `Amidst the city's chaos, you found serenity in the ancient Senso-ji Temple. The incense smoke curled around ancient wooden structures, carrying prayers from centuries past. Here, time seemed to stand still, offering a moment of reflection in your fast-paced adventure.`,
          mood: "serenity",
          timeOfDay: "afternoon",
          location: "Senso-ji Temple",
          sensoryDetails: ["Incense smoke", "Ancient wood", "Prayerful silence"]
        },
        {
          title: "Chapter 3: The Ramen Quest",
          content: `Your adventure culminated in a tiny ramen shop, where the master chef had been perfecting his craft for 30 years. The steaming bowl before you wasn't just food—it was a masterpiece of flavor, tradition, and passion. Every slurp told a story of dedication and love.`,
          mood: "satisfaction",
          timeOfDay: "evening",
          location: "Ramen shop",
          sensoryDetails: ["Steaming broth", "Master craftsmanship", "Flavor explosion"]
        }
      ],
      themes: ["Technology", "Tradition", "Contrast", "Harmony"],
      characters: ["The Urban Explorer", "The Ancient Temple", "The Master Chef"],
      soundtrack: ["Electronic beats", "Temple bells", "Kitchen sounds"]
    }
  };

  return stories[destination as keyof typeof stories] || stories.Paris;
}

function generateRomanticStory(destination: string, duration: number, budget: number) {
  return {
    title: `A Love Story in ${destination}`,
    chapters: [
      {
        title: "The Beginning of Forever",
        content: `In the heart of ${destination}, love found its perfect setting. Every moment was a scene from a romantic film, every street corner held the promise of a new adventure together.`,
        mood: "romance",
        timeOfDay: "all day",
        location: destination,
        sensoryDetails: ["Love in the air", "Romantic settings", "Shared moments"]
      }
    ],
    themes: ["Love", "Romance", "Togetherness", "Adventure"],
    characters: ["The Lovers", "The Romantic City", "Fate"],
    soundtrack: ["Romantic melodies", "Soft whispers", "Heartbeats"]
  };
}

function generateCulturalStory(destination: string, duration: number, budget: number) {
  return {
    title: `Cultural Immersion: ${destination}`,
    chapters: [
      {
        title: "The Cultural Journey",
        content: `Every step through ${destination} was a lesson in culture, history, and human connection. The local people shared their stories, their traditions, and their hearts, making you feel like a part of their community.`,
        mood: "enlightenment",
        timeOfDay: "all day",
        location: destination,
        sensoryDetails: ["Cultural richness", "Human connections", "Historical depth"]
      }
    ],
    themes: ["Culture", "Learning", "Connection", "Understanding"],
    characters: ["The Cultural Explorer", "The Local People", "The Ancient Traditions"],
    soundtrack: ["Traditional music", "Local languages", "Cultural sounds"]
  };
}

function generateLuxuryStory(destination: string, duration: number, budget: number) {
  return {
    title: `Luxury Redefined: ${destination}`,
    chapters: [
      {
        title: "The Ultimate Experience",
        content: `In ${destination}, luxury wasn't just about opulence—it was about experiencing the extraordinary. Every detail was curated to perfection, every moment designed to create memories that would last a lifetime.`,
        mood: "indulgence",
        timeOfDay: "all day",
        location: destination,
        sensoryDetails: ["Luxury surroundings", "Perfect service", "Exquisite details"]
      }
    ],
    themes: ["Luxury", "Excellence", "Indulgence", "Perfection"],
    characters: ["The Luxury Traveler", "The Perfect Service", "The Extraordinary Experience"],
    soundtrack: ["Sophisticated music", "Elegant ambiance", "Luxury sounds"]
  };
}

function generateBudgetStory(destination: string, duration: number, budget: number) {
  return {
    title: `Smart Travel: ${destination} on a Budget`,
    chapters: [
      {
        title: "The Art of Smart Travel",
        content: `In ${destination}, you discovered that the best experiences often cost the least. Local markets, hidden gems, and authentic experiences proved that true travel wealth comes from connections, not currency.`,
        mood: "satisfaction",
        timeOfDay: "all day",
        location: destination,
        sensoryDetails: ["Local markets", "Hidden gems", "Authentic experiences"]
      }
    ],
    themes: ["Smart Travel", "Authenticity", "Value", "Discovery"],
    characters: ["The Smart Traveler", "The Local Markets", "The Hidden Gems"],
    soundtrack: ["Local sounds", "Market bustle", "Authentic music"]
  };
}

function generateFamilyStory(destination: string, duration: number, budget: number) {
  return {
    title: `Family Adventures in ${destination}`,
    chapters: [
      {
        title: "Creating Family Memories",
        content: `In ${destination}, every moment became a family memory in the making. From the youngest to the oldest, everyone found something to love, something to learn, and something to remember forever.`,
        mood: "joy",
        timeOfDay: "all day",
        location: destination,
        sensoryDetails: ["Family laughter", "Shared discoveries", "Learning moments"]
      }
    ],
    themes: ["Family", "Learning", "Joy", "Togetherness"],
    characters: ["The Family", "The Learning Experience", "The Shared Joy"],
    soundtrack: ["Family laughter", "Educational sounds", "Joyful music"]
  };
}

function createImmersiveContent(story: any, tripData: any) {
  return {
    virtualTour: generateVirtualTour(story, tripData),
    photoGallery: generatePhotoGallery(story),
    audioNarration: generateAudioNarration(story),
    interactiveMap: generateInteractiveMap(story),
    culturalInsights: generateCulturalInsights(story),
    localRecommendations: generateLocalRecommendations(story)
  };
}

function generateVirtualTour(story: any, tripData: any) {
  return {
    title: `Virtual Journey: ${story.title}`,
    stops: story.chapters.map((chapter: any, index: number) => ({
      id: index + 1,
      title: chapter.title,
      location: chapter.location,
      description: chapter.content,
      mood: chapter.mood,
      timeOfDay: chapter.timeOfDay,
      visualElements: chapter.sensoryDetails,
      duration: "5-10 minutes"
    })),
    totalDuration: `${story.chapters.length * 10} minutes`,
    accessibility: "VR headset compatible, mobile-friendly"
  };
}

function generatePhotoGallery(story: any) {
  return {
    title: "Story in Pictures",
    collections: story.chapters.map((chapter: any) => ({
      title: chapter.title,
      mood: chapter.mood,
      suggestedPhotos: chapter.sensoryDetails.map((detail: string) => ({
        description: detail,
        composition: "Artistic",
        lighting: chapter.timeOfDay,
        style: "Storytelling"
      }))
    })),
    totalPhotos: story.chapters.length * 5,
    sharingOptions: ["Social media", "Print", "Digital album"]
  };
}

function generateAudioNarration(story: any) {
  return {
    title: "Audio Story Experience",
    chapters: story.chapters.map((chapter: any) => ({
      title: chapter.title,
      narration: chapter.content,
      backgroundMusic: story.soundtrack,
      duration: "3-5 minutes",
      mood: chapter.mood
    })),
    totalDuration: `${story.chapters.length * 4} minutes`,
    format: "High-quality audio, downloadable"
  };
}

function generateInteractiveMap(story: any) {
  return {
    title: "Interactive Story Map",
    locations: story.chapters.map((chapter: any, index: number) => ({
      id: index + 1,
      name: chapter.location,
      coordinates: generateMockCoordinates(chapter.location),
      story: chapter.content,
      mood: chapter.mood,
      timeOfDay: chapter.timeOfDay,
      nearbyAttractions: generateNearbyAttractions(chapter.location)
    })),
    route: "Optimized for storytelling flow",
    features: ["GPS navigation", "Story playback", "Photo integration"]
  };
}

function generateCulturalInsights(story: any) {
  return {
    title: "Cultural Deep Dive",
    insights: story.themes.map((theme: string) => ({
      theme,
      explanation: `How ${theme.toLowerCase()} manifests in this destination`,
      examples: generateCulturalExamples(theme),
      personalConnection: "How this relates to your travel style"
    })),
    learningOutcomes: [
      "Cultural understanding",
      "Historical context",
      "Local perspectives",
      "Personal growth"
    ]
  };
}

function generateLocalRecommendations(story: any) {
  return {
    title: "Local Secrets & Recommendations",
    categories: {
      food: generateFoodRecommendations(),
      activities: generateActivityRecommendations(),
      accommodations: generateAccommodationRecommendations(),
      hiddenGems: generateHiddenGems()
    },
    insiderTips: [
      "Best times to visit popular spots",
      "Local customs and etiquette",
      "Money-saving strategies",
      "Safety considerations"
    ]
  };
}

function generateShareableContent(story: any) {
  return {
    socialMediaPosts: story.chapters.map((chapter: any) => ({
      platform: "Instagram",
      content: chapter.content.substring(0, 200) + "...",
      hashtags: generateHashtags(story.themes),
      imageSuggestion: chapter.sensoryDetails[0]
    })),
    blogPost: {
      title: story.title,
      content: story.chapters.map((chapter: any) => chapter.content).join("\n\n"),
      seoKeywords: generateSEOKeywords(story),
      readingTime: `${story.chapters.length * 3} minutes`
    },
    videoScript: {
      title: `${story.title} - Video Story`,
      scenes: story.chapters.map((chapter: any) => ({
        scene: chapter.title,
        description: chapter.content,
        visualElements: chapter.sensoryDetails,
        duration: "30-60 seconds"
      }))
    }
  };
}

function createInteractiveElements(story: any) {
  return {
    quizzes: generateStoryQuizzes(story),
    challenges: generateTravelChallenges(story),
    reflections: generateReflectionPrompts(story),
    communityFeatures: generateCommunityFeatures(story)
  };
}

// Helper functions
function generateMockCoordinates(location: string) {
  const coordinates = {
    "Seine River": { lat: 48.8566, lng: 2.3522 },
    "Le Marais": { lat: 48.8606, lng: 2.3622 },
    "Rooftop terrace": { lat: 48.8584, lng: 2.2945 },
    "Colosseum": { lat: 41.8902, lng: 12.4922 },
    "Vatican Museums": { lat: 41.9069, lng: 12.4534 },
    "Roman trattoria": { lat: 41.9028, lng: 12.4964 },
    "Shibuya Crossing": { lat: 35.6595, lng: 139.7004 },
    "Senso-ji Temple": { lat: 35.7148, lng: 139.7967 },
    "Ramen shop": { lat: 35.6762, lng: 139.6503 }
  };
  
  return coordinates[location as keyof typeof coordinates] || { lat: 0, lng: 0 };
}

function generateNearbyAttractions(location: string) {
  const attractions = {
    "Seine River": ["Eiffel Tower", "Notre-Dame", "Louvre Museum"],
    "Le Marais": ["Place des Vosges", "Picasso Museum", "Jewish Quarter"],
    "Colosseum": ["Roman Forum", "Palatine Hill", "Arch of Constantine"],
    "Vatican Museums": ["St. Peter's Basilica", "Sistine Chapel", "Vatican Gardens"],
    "Shibuya Crossing": ["Meiji Shrine", "Yoyogi Park", "Harajuku"],
    "Senso-ji Temple": ["Asakusa Shrine", "Tokyo Skytree", "Sumida River"]
  };
  
  return attractions[location as keyof typeof attractions] || [];
}

function generateCulturalExamples(theme: string) {
  const examples = {
    "Discovery": ["Hidden courtyards", "Local markets", "Secret passages"],
    "Culture": ["Traditional ceremonies", "Local crafts", "Historical sites"],
    "Romance": ["Sunset viewpoints", "Intimate restaurants", "Garden walks"],
    "Adventure": ["Off-the-beaten-path", "Local experiences", "Cultural immersion"]
  };
  
  return examples[theme as keyof typeof examples] || [];
}

function generateFoodRecommendations() {
  return [
    "Local specialties to try",
    "Best restaurants by budget",
    "Street food highlights",
    "Cooking classes and food tours"
  ];
}

function generateActivityRecommendations() {
  return [
    "Must-see attractions",
    "Hidden gems",
    "Local experiences",
    "Seasonal activities"
  ];
}

function generateAccommodationRecommendations() {
  return [
    "Boutique hotels",
    "Local guesthouses",
    "Unique stays",
    "Budget-friendly options"
  ];
}

function generateHiddenGems() {
  return [
    "Local secrets",
    "Off-the-beaten-path spots",
    "Authentic experiences",
    "Photography locations"
  ];
}

function generateHashtags(themes: string[]) {
  const baseHashtags = ["#travel", "#adventure", "#explore"];
  const themeHashtags = themes.map(theme => `#${theme.toLowerCase()}`);
  return [...baseHashtags, ...themeHashtags];
}

function generateSEOKeywords(story: any) {
  return [
    "travel story",
    "adventure",
    story.chapters[0]?.location || "destination",
    "travel experience",
    "cultural immersion"
  ];
}

function generateStoryQuizzes(story: any) {
  return [
    {
      question: "What type of traveler are you?",
      options: story.themes,
      result: "Personalized travel recommendations"
    },
    {
      question: "Which chapter resonated most with you?",
      options: story.chapters.map((chapter: any) => chapter.title),
      result: "Insights into your travel preferences"
    }
  ];
}

function generateTravelChallenges(story: any) {
  return [
    "Visit all story locations",
    "Try local cuisine mentioned",
    "Capture photos matching story moods",
    "Share your own story chapter"
  ];
}

function generateReflectionPrompts(story: any) {
  return [
    "How did this destination change your perspective?",
    "What was your most memorable moment?",
    "How did the local culture influence you?",
    "What would you do differently next time?"
  ];
}

function generateCommunityFeatures(story: any) {
  return [
    "Share your own stories",
    "Connect with other travelers",
    "Join destination-specific groups",
    "Participate in travel challenges"
  ];
}
