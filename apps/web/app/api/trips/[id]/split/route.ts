import { NextRequest, NextResponse } from "next/server";
import { getTrip } from "@/lib/trips";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { expenses, groupMembers } = await request.json();
    const trip = await getTrip(params.id);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const splitResult = calculateSmartSplit(expenses, groupMembers, trip);
    
    return NextResponse.json({
      tripId: params.id,
      split: splitResult,
      summary: generateSplitSummary(splitResult)
    });

  } catch (error) {
    console.error('Error calculating cost split:', error);
    return NextResponse.json({ error: "Failed to calculate split" }, { status: 500 });
  }
}

function calculateSmartSplit(expenses: any[], groupMembers: any[], trip: any) {
  const travelers = trip.form?.travelers || 1;
  const results = {
    individualSplits: [],
    groupSplits: [],
    recommendations: []
  };

  // Mock expense data - in production, this would come from receipts
  const mockExpenses = [
    { id: 1, name: "Hotel Room", amount: 800, type: "accommodation", shared: true, days: 4 },
    { id: 2, name: "Flight Tickets", amount: 1200, type: "transport", shared: false },
    { id: 3, name: "Restaurant Dinner", amount: 150, type: "food", shared: true },
    { id: 4, name: "Museum Tickets", amount: 80, type: "activity", shared: false },
    { id: 5, name: "Taxi to Airport", amount: 60, type: "transport", shared: true }
  ];

  // Calculate individual splits
  groupMembers.forEach((member: any, index: number) => {
    const individualExpenses = mockExpenses.filter(exp => !exp.shared);
    const sharedExpenses = mockExpenses.filter(exp => exp.shared);
    
    // Individual expenses are paid by the person
    const individualTotal = individualExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Shared expenses are split equally
    const sharedTotal = sharedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const sharedPerPerson = sharedTotal / travelers;
    
    const totalOwed = individualTotal + sharedPerPerson;
    
    results.individualSplits.push({
      member: member.name || `Traveler ${index + 1}`,
      individualExpenses: individualExpenses.map(exp => ({
        name: exp.name,
        amount: exp.amount,
        type: exp.type
      })),
      sharedContribution: sharedPerPerson,
      totalOwed: totalOwed,
      breakdown: {
        accommodation: sharedExpenses.filter(exp => exp.type === "accommodation").reduce((sum, exp) => sum + exp.amount / travelers, 0),
        transport: sharedExpenses.filter(exp => exp.type === "transport").reduce((sum, exp) => sum + exp.amount / travelers, 0),
        food: sharedExpenses.filter(exp => exp.type === "food").reduce((sum, exp) => sum + exp.amount / travelers, 0),
        activities: sharedExpenses.filter(exp => exp.type === "activity").reduce((sum, exp) => sum + exp.amount / travelers, 0)
      }
    });
  });

  // Generate smart recommendations
  results.recommendations = generateSplitRecommendations(mockExpenses, travelers);

  return results;
}

function generateSplitRecommendations(expenses: any[], travelers: number) {
  const recommendations = [];

  // Analyze spending patterns
  const accommodationCost = expenses.filter(exp => exp.type === "accommodation").reduce((sum, exp) => sum + exp.amount, 0);
  const foodCost = expenses.filter(exp => exp.type === "food").reduce((sum, exp) => sum + exp.amount, 0);
  const transportCost = expenses.filter(exp => exp.type === "transport").reduce((sum, exp) => sum + exp.amount, 0);

  // Room sharing optimization
  if (accommodationCost > 0 && travelers > 1) {
    const costPerPerson = accommodationCost / travelers;
    if (costPerPerson > 200) {
      recommendations.push({
        type: "accommodation",
        message: "🏨 Consider booking larger rooms to reduce per-person cost",
        savings: `Save ~${Math.round(costPerPerson * 0.3)} per person with room sharing`,
        priority: "high"
      });
    }
  }

  // Food cost optimization
  if (foodCost > 0) {
    const avgMealCost = foodCost / travelers;
    if (avgMealCost > 50) {
      recommendations.push({
        type: "food",
        message: "🍽️ Consider cooking some meals to reduce food costs",
        savings: `Save ~${Math.round(avgMealCost * 0.4)} per meal by cooking`,
        priority: "medium"
      });
    }
  }

  // Transport optimization
  if (transportCost > 0) {
    recommendations.push({
      type: "transport",
      message: "🚇 Use public transport passes for group savings",
      savings: "Save 20-30% with group transport passes",
      priority: "medium"
    });
  }

  // Fairness recommendations
  if (travelers > 2) {
    recommendations.push({
      type: "fairness",
      message: "⚖️ Use a shared expense app to track who paid what",
      savings: "Avoid disputes and ensure fair splitting",
      priority: "low"
    });
  }

  return recommendations;
}

function generateSplitSummary(splitResult: any) {
  const totalCost = splitResult.individualSplits.reduce((sum: number, split: any) => sum + split.totalOwed, 0);
  const avgPerPerson = totalCost / splitResult.individualSplits.length;
  
  return {
    totalTripCost: totalCost,
    averagePerPerson: avgPerPerson,
    costBreakdown: {
      accommodation: splitResult.individualSplits[0]?.breakdown.accommodation * splitResult.individualSplits.length || 0,
      transport: splitResult.individualSplits[0]?.breakdown.transport * splitResult.individualSplits.length || 0,
      food: splitResult.individualSplits[0]?.breakdown.food * splitResult.individualSplits.length || 0,
      activities: splitResult.individualSplits[0]?.breakdown.activities * splitResult.individualSplits.length || 0
    }
  };
}
