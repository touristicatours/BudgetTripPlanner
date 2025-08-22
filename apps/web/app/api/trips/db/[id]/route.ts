import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Get trip by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const trip = await prisma.trip.findFirst({
      where: { 
        id: params.id,
        ownerId: userId 
      },
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
    console.error("Error fetching trip:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// PATCH - Update trip
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const updates = await req.json();
    
    const trip = await prisma.trip.updateMany({
      where: { 
        id: params.id,
        ownerId: userId 
      },
      data: {
        ...(updates.destination && { destination: updates.destination }),
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) }),
        ...(updates.travelers && { travelers: parseInt(updates.travelers) }),
        ...(updates.budget && { budgetCents: Math.round(parseFloat(updates.budget) * 100) }),
        ...(updates.currency && { budgetCurrency: updates.currency }),
        ...(updates.itinerary && { itinerary: JSON.stringify(updates.itinerary) }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// DELETE - Delete trip
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    await prisma.trip.deleteMany({
      where: { 
        id: params.id,
        ownerId: userId 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
