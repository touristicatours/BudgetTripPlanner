import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get public trip by share token
export async function GET(req: NextRequest, { params }: { params: { shareToken: string } }) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { shareToken: params.shareToken },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Convert to expected format
    const formattedTrip = {
      id: trip.id,
      form: {
        destination: trip.destination,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        travelers: trip.travelers,
        budget: trip.budgetCents / 100,
        currency: trip.budgetCurrency,
      },
      itinerary: JSON.parse(trip.itinerary || "[]"),
      shareToken: trip.shareToken,
    };

    return NextResponse.json(formattedTrip);
  } catch (error) {
    console.error("Error fetching public trip:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}
