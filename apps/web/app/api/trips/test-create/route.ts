import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary test endpoint - remove in production
export async function POST(req: NextRequest) {
  try {
    const { form, itinerary } = await req.json();
    if (!form || !itinerary) {
      return NextResponse.json({ error: "Missing form/itinerary" }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        ownerId: "test-user", // Temporary test user ID
        destination: form.destination,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        travelers: parseInt(form.travelers),
        budgetCents: Math.round(parseFloat(form.budget) * 100),
        budgetCurrency: form.currency || "USD",
        itinerary: JSON.stringify(itinerary),
        shareToken: Math.random().toString(36).substring(2, 15),
      },
    });

    return NextResponse.json({ id: trip.id, trip });
  } catch (error) {
    console.error("Error creating test trip:", error);
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}
