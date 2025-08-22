import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - List user's trips
export async function GET(req: NextRequest) {
  try {
    const demoMode = (process.env.DISABLE_AUTH ?? "true") !== "false";
    let userId: string | undefined;
    if (demoMode) {
      userId = process.env.DEMO_USER_ID || "default-user";
    } else if (typeof auth === "function") {
      const session = await auth();
      userId = session?.user?.id as string | undefined;
    }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = demoMode ? {} : { ownerId: userId } as any;
    const trips = await prisma.trip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Convert to expected format
    const formattedTrips = trips.map(trip => ({
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
      createdAt: trip.createdAt.toISOString(),
      updatedAt: (trip as any).updatedAt ? (trip as any).updatedAt.toISOString?.() ?? String((trip as any).updatedAt) : trip.createdAt.toISOString(),
    }));

    return NextResponse.json({ trips: formattedTrips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// POST - Create new trip
export async function POST(req: NextRequest) {
  try {
    const demoMode = (process.env.DISABLE_AUTH ?? "true") !== "false";
    let userId: string | undefined;
    if (demoMode) {
      userId = process.env.DEMO_USER_ID || "default-user";
    } else if (typeof auth === "function") {
      const session = await auth();
      userId = session?.user?.id as string | undefined;
    }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { destination, startDate, endDate, travelers, budget, currency, itinerary } = await req.json();
    const travelersNum = Number(travelers ?? 1);
    const budgetNum = Number(budget ?? 0);

    const trip = await prisma.trip.create({
      data: {
        ownerId: userId,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelers: Number.isFinite(travelersNum) ? Math.max(1, Math.trunc(travelersNum)) : 1,
        budgetCents: Number.isFinite(budgetNum) ? Math.max(0, Math.round(budgetNum * 100)) : 0,
        budgetCurrency: currency || "USD",
        itinerary: JSON.stringify(itinerary || []),
        shareToken: Math.random().toString(36).substring(2, 15),
      },
    });

    return NextResponse.json({ trip });
  } catch (error: any) {
    console.error("Error creating trip:", error);
    return NextResponse.json({ error: "Failed to create trip", details: String(error?.message || error) }, { status: 500 });
  }
}
