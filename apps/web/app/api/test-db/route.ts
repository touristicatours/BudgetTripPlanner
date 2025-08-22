import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trip = await prisma.trip.create({
      data: {
        destination: "Test Destination",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-07"),
        travelers: 2,
        budgetCents: 100000,
        budgetCurrency: "USD",
        itinerary: "[]",
      },
    });
    return NextResponse.json({ ok: true, trip });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
