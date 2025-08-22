import { NextResponse } from "next/server";
import { saveTrip } from "@/lib/trips";

export async function GET() {
  try {
    const demoTrip = await saveTrip({
      form: {
        destination: "Rome",
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        travelers: 2,
        currency: "EUR",
        budget: 1200,
        pace: "balanced",
        interests: ["culture", "history"],
        mustSee: [],
        tone: "Concise",
        detail: "Concise",
        activitiesPerDay: 3,
        includeFlights: false,
      },
      itinerary: [
        { 
          day: 1, 
          title: "Historic Center", 
          activities: [
            { timeOfDay: "morning", name: "Colosseum", note: "Buy skip-the-line tickets" },
            { timeOfDay: "afternoon", name: "Roman Forum", note: "Ancient ruins" },
            { timeOfDay: "evening", name: "Trevi Fountain", note: "Make a wish!" }
          ] 
        },
        { 
          day: 2, 
          title: "Vatican City", 
          activities: [
            { timeOfDay: "morning", name: "Vatican Museums", note: "Book in advance" },
            { timeOfDay: "afternoon", name: "St. Peter's Basilica", note: "Dress modestly" },
            { timeOfDay: "evening", name: "Piazza Navona", note: "Beautiful square" }
          ] 
        }
      ]
    });
    
    return NextResponse.json({ ok: true, id: demoTrip.id });
  } catch (error) {
    console.error("Demo trip creation failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to create demo trip" }, { status: 500 });
  }
}
