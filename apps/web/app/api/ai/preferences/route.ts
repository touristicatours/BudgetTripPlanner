import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tripHistory, currentPreferences } = await request.json();
    
    const aiAnalysis = analyzeUserPreferences(tripHistory, currentPreferences);
    const personalizedRecommendations = generatePersonalizedRecommendations(aiAnalysis);
    
    return NextResponse.json({
      analysis: aiAnalysis,
      recommendations: personalizedRecommendations,
      learningScore: calculateLearningScore(aiAnalysis)
    });

  } catch (error) {
    console.error('Error analyzing preferences:', error);
    return NextResponse.json({ error: "Failed to analyze preferences" }, { status: 500 });
  }
}

function analyzeUserPreferences(tripHistory: any[], currentPreferences: any) {
  const analysis = {
    travelStyle: {},
    budgetPatterns: {},
    destinationPreferences: {},
    activityPatterns: {},
    timingPreferences: {},
    groupSizePatterns: {}
  };

  // Mock trip history for demonstration
  const mockHistory = [
    {
      destination: "Paris",
      budget: 1200,
      travelers: 2,
      duration: 4,
      activities: ["museums", "food", "culture"],
      pace: "balanced",
      season: "spring"
    },
    {
      destination: "Tokyo",
      budget: 2000,
      travelers: 1,
      duration: 7,
      activities: ["culture", "food", "shopping"],
      pace: "fast",
      season: "autumn"
    },
    {
      destination: "Rome",
      budget: 1500,
      travelers: 3,
      duration: 5,
      activities: ["history", "culture", "food"],
      pace: "balanced",
      season: "spring"
    }
  ];

  // Analyze travel style
  const paces = mockHistory.map(trip => trip.pace);
  analysis.travelStyle.primaryPace = getMostFrequent(paces);
  analysis.travelStyle.paceVariation = calculateVariation(paces);

  // Analyze budget patterns
  const budgets = mockHistory.map(trip => trip.budget);
  analysis.budgetPatterns.averageBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length;
  analysis.budgetPatterns.budgetRange = { min: Math.min(...budgets), max: Math.max(...budgets) };
  analysis.budgetPatterns.budgetPerDay = budgets.reduce((a, b) => a + b, 0) / mockHistory.reduce((a, trip) => a + trip.duration, 0);

  // Analyze destination preferences
  const destinations = mockHistory.map(trip => trip.destination);
  analysis.destinationPreferences.favoriteRegions = analyzeRegions(destinations);
  analysis.destinationPreferences.cityVsRural = analyzeUrbanPreference(mockHistory);

  // Analyze activity patterns
  const allActivities = mockHistory.flatMap(trip => trip.activities);
  analysis.activityPatterns.topActivities = getTopItems(allActivities, 3);
  analysis.activityPatterns.activityDiversity = calculateDiversity(allActivities);

  // Analyze timing preferences
  const seasons = mockHistory.map(trip => trip.season);
  analysis.timingPreferences.preferredSeason = getMostFrequent(seasons);
  analysis.timingPreferences.tripDuration = mockHistory.reduce((a, trip) => a + trip.duration, 0) / mockHistory.length;

  // Analyze group size patterns
  const groupSizes = mockHistory.map(trip => trip.travelers);
  analysis.groupSizePatterns.averageGroupSize = groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length;
  analysis.groupSizePatterns.soloTravelPercentage = (groupSizes.filter(size => size === 1).length / groupSizes.length) * 100;

  return analysis;
}

function generatePersonalizedRecommendations(analysis: any) {
  const recommendations = [];

  // Budget-based recommendations
  if (analysis.budgetPatterns.averageBudget > 1500) {
    recommendations.push({
      type: "budget",
      message: "💰 You tend to prefer premium experiences. Consider luxury accommodations and fine dining.",
      confidence: 85,
      category: "spending_style"
    });
  } else if (analysis.budgetPatterns.averageBudget < 1000) {
    recommendations.push({
      type: "budget",
      message: "💡 You're budget-conscious. Look for free attractions and local markets.",
      confidence: 80,
      category: "spending_style"
    });
  }

  // Pace-based recommendations
  if (analysis.travelStyle.primaryPace === "fast") {
    recommendations.push({
      type: "pace",
      message: "⚡ You prefer fast-paced travel. Consider city passes for quick access to attractions.",
      confidence: 90,
      category: "travel_style"
    });
  } else if (analysis.travelStyle.primaryPace === "relaxed") {
    recommendations.push({
      type: "pace",
      message: "🌿 You enjoy relaxed travel. Look for spa resorts and nature activities.",
      confidence: 85,
      category: "travel_style"
    });
  }

  // Activity-based recommendations
  if (analysis.activityPatterns.topActivities.includes("food")) {
    recommendations.push({
      type: "activity",
      message: "🍽️ You love culinary experiences. Consider food tours and cooking classes.",
      confidence: 95,
      category: "interests"
    });
  }

  if (analysis.activityPatterns.topActivities.includes("culture")) {
    recommendations.push({
      type: "activity",
      message: "🎭 You're culturally curious. Look for local festivals and cultural events.",
      confidence: 90,
      category: "interests"
    });
  }

  // Group size recommendations
  if (analysis.groupSizePatterns.soloTravelPercentage > 50) {
    recommendations.push({
      type: "group",
      message: "👤 You often travel solo. Consider hostels and group tours for social experiences.",
      confidence: 75,
      category: "social_preferences"
    });
  }

  // Seasonal recommendations
  if (analysis.timingPreferences.preferredSeason === "spring") {
    recommendations.push({
      type: "timing",
      message: "🌸 You prefer spring travel. Consider cherry blossom destinations and mild weather locations.",
      confidence: 80,
      category: "timing_preferences"
    });
  }

  return recommendations;
}

function calculateLearningScore(analysis: any) {
  let score = 0;
  
  // More data = higher learning score
  score += Math.min(analysis.tripHistory?.length || 0, 10) * 10;
  
  // Diverse preferences = higher score
  if (analysis.activityPatterns.activityDiversity > 0.7) score += 20;
  if (analysis.destinationPreferences.favoriteRegions.length > 2) score += 15;
  
  // Consistent patterns = higher score
  if (analysis.travelStyle.paceVariation < 0.3) score += 15;
  
  return Math.min(score, 100);
}

// Helper functions
function getMostFrequent(arr: any[]) {
  return arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop();
}

function calculateVariation(arr: any[]) {
  const unique = [...new Set(arr)];
  return unique.length / arr.length;
}

function getTopItems(arr: any[], count: number) {
  const frequency: any = {};
  arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
  return Object.entries(frequency)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, count)
    .map(([item]) => item);
}

function calculateDiversity(arr: any[]) {
  const unique = [...new Set(arr)];
  return unique.length / arr.length;
}

function analyzeRegions(destinations: string[]) {
  const regionMap: any = {
    "Paris": "Europe",
    "Rome": "Europe", 
    "Tokyo": "Asia",
    "New York": "North America",
    "London": "Europe"
  };
  
  const regions = destinations.map(dest => regionMap[dest] || "Other");
  return [...new Set(regions)];
}

function analyzeUrbanPreference(trips: any[]) {
  const urbanDestinations = ["Paris", "Tokyo", "New York", "London", "Rome"];
  const urbanCount = trips.filter(trip => urbanDestinations.includes(trip.destination)).length;
  return urbanCount / trips.length > 0.7 ? "urban" : "mixed";
}
