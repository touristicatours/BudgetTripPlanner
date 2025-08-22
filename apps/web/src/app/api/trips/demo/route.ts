import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const created = await prisma.trip.create({
    data: {
      destination: "Rome",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-05"),
      travelers: 2,
      budgetCents: 1200,
      budgetCurrency: "EUR",
      itinerary: [
        { day: 1, title: "Historic Center", activities: ["Colosseum", "Forum"] },
        { day: 2, title: "Vatican", activities: ["Museums", "St. Peter's"] }
      ],
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
