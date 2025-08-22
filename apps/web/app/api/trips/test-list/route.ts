import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary test endpoint - remove in production
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      where: { ownerId: "test-user" },
      orderBy: { createdAt: 'desc' },
    });

    console.log("Found trips:", trips.length);

    // Convert to expected format
    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      form: {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        budget: trip.budgetCents / 100,
        currency: trip.budgetCurrency,
      },
      itinerary: JSON.parse(trip.itinerary || "[]"),
      shareToken: trip.shareToken,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }));

    return NextResponse.json({ trips: formattedTrips });
  } catch (error) {
    console.error("Error fetching test trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips", details: error.message }, { status: 500 });
  }
}
