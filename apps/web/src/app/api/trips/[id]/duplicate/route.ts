import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const src = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!src) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
  const shift = 7 * 24 * 60 * 60 * 1000;
  const trip = await prisma.trip.create({
    data: {
      destination: src.destination,
      startDate: new Date(src.startDate.getTime() + shift),
      endDate: new Date(src.endDate.getTime() + shift),
      travelers: src.travelers,
      budgetCents: src.budgetCents ?? 0,
      budgetCurrency: src.budgetCurrency ?? "USD",
      itinerary: src.itinerary,
    },
  });
  return NextResponse.json({ ok:true, trip });
}
