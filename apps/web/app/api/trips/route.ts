// src/app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const { form, itinerary } = await req.json();
    if (!form || !itinerary) {
      return NextResponse.json({ error: "Missing form/itinerary" }, { status: 400 });
    }

    // Demo/auth toggle
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

    // Coerce numeric fields safely (form may contain strings or numbers)
    const travelersNum = Number(form.travelers ?? 1);
    const budgetNum = Number(form.budget ?? 0);

    const trip = await prisma.trip.create({
      data: {
        ownerId: userId,
        destination: form.destination,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        travelers: Number.isFinite(travelersNum) ? Math.max(1, Math.trunc(travelersNum)) : 1,
        budgetCents: Number.isFinite(budgetNum) ? Math.max(0, Math.round(budgetNum * 100)) : 0,
        budgetCurrency: form.currency || "USD",
        itinerary: JSON.stringify(itinerary),
        shareToken: Math.random().toString(36).substring(2, 15),
      },
    });

    return NextResponse.json({ id: trip.id, trip });
  } catch (error: any) {
    console.error("Error creating trip:", error);
    return NextResponse.json({ error: "Failed to save trip", details: String(error?.message || error) }, { status: 500 });
  }
}
