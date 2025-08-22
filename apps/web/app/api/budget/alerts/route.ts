import { NextRequest, NextResponse } from "next/server";
import { getTrip } from "@/lib/trips";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
  }

  try {
    const trip = await getTrip(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const alerts = generateBudgetAlerts(trip);
    
    return NextResponse.json({
      tripId,
      alerts,
      budget: trip.form?.budget || 0,
      currency: trip.form?.budgetCurrency || "USD"
    });

  } catch (error) {
    console.error('Error generating budget alerts:', error);
    return NextResponse.json({ error: "Failed to generate alerts" }, { status: 500 });
  }
}

function generateBudgetAlerts(trip: any) {
  const alerts = [];
  const budget = trip.form?.budget || 0;
  const currency = trip.form?.budgetCurrency || "USD";
  
  // Mock spending data - in production, this would come from receipts
  const mockSpending = {
    "Paris": { spent: 850, remaining: 350 },
    "Rome": { spent: 1100, remaining: 100 },
    "Tokyo": { spent: 1400, remaining: -200 }
  };

  const destination = trip.form?.destination || "Unknown";
  const spending = mockSpending[destination as keyof typeof mockSpending] || { spent: 0, remaining: budget };

  // Budget threshold alerts
  const spentPercentage = (spending.spent / budget) * 100;
  
  if (spentPercentage > 90) {
    alerts.push({
      type: "critical",
      message: "🚨 Budget nearly exhausted! Only " + spending.remaining + " " + currency + " remaining",
      suggestion: "Consider free activities or reduce dining expenses",
      priority: "high"
    });
  } else if (spentPercentage > 75) {
    alerts.push({
      type: "warning",
      message: "⚠️ 75% of budget spent. " + spending.remaining + " " + currency + " remaining",
      suggestion: "Look for budget-friendly alternatives",
      priority: "medium"
    });
  } else if (spentPercentage > 50) {
    alerts.push({
      type: "info",
      message: "💰 Half budget used. " + spending.remaining + " " + currency + " remaining",
      suggestion: "You're on track! Keep monitoring expenses",
      priority: "low"
    });
  }

  // Spending pattern alerts
  if (spending.spent > budget) {
    alerts.push({
      type: "overspend",
      message: "💸 Over budget by " + Math.abs(spending.remaining) + " " + currency,
      suggestion: "Consider these budget-saving tips: use public transport, eat at local markets, find free attractions",
      priority: "high"
    });
  }

  // Smart suggestions based on destination
  const destinationSuggestions = {
    "Paris": [
      "🎨 Visit free museums on first Sunday of month",
      "🥖 Buy from local bakeries instead of cafes",
      "🚇 Use Metro day passes for unlimited travel"
    ],
    "Rome": [
      "🏛️ Many churches and piazzas are free to visit",
      "🍕 Try pizza al taglio for budget meals",
      "🚌 Roma Pass includes transport and attractions"
    ],
    "Tokyo": [
      "🍜 Eat at ramen shops for affordable meals",
      "🚇 Get a Pasmo/Suica card for transport",
      "🏯 Visit free temples and shrines"
    ]
  };

  const suggestions = destinationSuggestions[destination as keyof typeof destinationSuggestions] || [];
  
  if (suggestions.length > 0) {
    alerts.push({
      type: "suggestion",
      message: "💡 Budget-saving tips for " + destination,
      suggestions: suggestions,
      priority: "medium"
    });
  }

  return alerts;
}
