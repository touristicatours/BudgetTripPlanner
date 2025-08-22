// src/app/api/trips/[id]/route.ts
import { NextResponse } from "next/server";
import { getTrip } from "@/lib/trips";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  // First try to get from file system
  const fileTrip = await getTrip(params.id);
  if (fileTrip) {
    return NextResponse.json(fileTrip);
  }

  // If not found in file system, try database
  try {
    const dbTrip = await prisma.trip.findUnique({
      where: { id: params.id }
    });
    
    if (dbTrip) {
      // Convert database format to expected format
      return NextResponse.json({
        id: dbTrip.id,
        form: {
          destination: dbTrip.destination,
          startDate: dbTrip.startDate.toISOString(),
          endDate: dbTrip.endDate.toISOString(),
          travelers: dbTrip.travelers,
          budget: dbTrip.budgetCents / 100,
          currency: dbTrip.budgetCurrency
        },
        itinerary: JSON.parse(dbTrip.itinerary || "[]")
      });
    }
  } catch (error) {
    console.error("Database trip fetch error:", error);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
