import { NextRequest, NextResponse } from "next/server";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type Activity = { timeOfDay: TimeOfDay; name: string; note?: string; category?: string; cost?: string; link?: string };
type ItineraryDay = { day: number; title: string; activities: Activity[] };

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 2;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TIME_SLOTS = ["09:00", "11:00", "14:00", "17:00", "19:00"];

function mockActivities(destination: string, interests: string[], mustSee: string[], activitiesPerDay: number, pace: string): Activity[] {
  const activities: Activity[] = [];
  const baseActivities = [
    "Morning walking tour",
    "Local market visit",
    "Iconic landmark exploration",
    "Museum or gallery visit",
    "Scenic viewpoint",
    "Neighborhood stroll",
    "Riverfront / seaside time",
    "Dinner at a cozy spot",
    "Street-food crawl",
    "Cultural workshop",
    "Historical site visit",
    "Local cafe experience",
  ];

  for (let i = 0; i < activitiesPerDay; i++) {
    const time = TIME_SLOTS[i % TIME_SLOTS.length];
    const baseActivity = baseActivities[i % baseActivities.length];
    const activity: Activity = {
      timeOfDay: i < 2 ? "morning" : i < 4 ? "afternoon" : "evening",
      name: `${baseActivity} in ${destination}`,
      note: i === 0 ? "Buy skip-the-line tickets if possible" : undefined,
      category: pick(interests),
      cost: `${Math.floor(Math.random() * 50) + 10} EUR`,
    };
    activities.push(activity);
  }

  // Add must-see items if available
  if (mustSee.length > 0) {
    const mustSeeItem = mustSee[0];
    activities.unshift({
      timeOfDay: "morning",
      name: `Visit ${mustSeeItem}`,
      note: "Must-see attraction - book tickets in advance",
      category: "must-see",
      cost: `${Math.floor(Math.random() * 100) + 20} EUR`,
    });
  }

  return activities;
}

function buildMockItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  interests: string[],
  mustSee: string[],
  activitiesPerDay: number,
  pace: string
): ItineraryDay[] {
  const days = daysBetween(startDate, endDate);
  const itinerary: ItineraryDay[] = [];

  for (let i = 0; i < days; i++) {
    const dayActivities = mockActivities(destination, interests, mustSee, activitiesPerDay, pace);
    itinerary.push({
      day: i + 1,
      title: `Day ${i + 1} in ${destination}`,
      activities: dayActivities,
    });
  }

  return itinerary;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      destination = "Your Destination",
      startDate = "",
      endDate = "",
      travelers = 1,
      budget = 0,
      currency = "EUR",
      pace = "balanced",
      interests = [] as string[],
      mustSee = [] as string[],
      activitiesPerDay = 3,
      detailLevel = "concise",
      userNotes = "",
    } = body ?? {};

    // Provider selection: DeepSeek -> mock
    const days = daysBetween(startDate, endDate);
    const schemaHint = `You must answer with STRICT JSON (no markdown fences) matching this TypeScript type:
[{"day":1,"title":"Day 1 • ${destination}","activities":[{"timeOfDay":"morning"|"afternoon"|"evening","name":"Place or experience name","note":"1 short practical tip","category":"culture|food|nature|nightlife|shopping|family|adventure","cost":"number +/- currency"}]}]`;

    const constraints = `
- Create realistic, coherent day plans that minimize transit by clustering by neighborhood.
- Respect opening hours and typical durations; avoid more than ${activitiesPerDay} core activities/day.
- Always include at least one local food spot per day.
- Use user's mustSee items first where possible.
- Costs in ${currency}; include approximate amounts (e.g., 18 EUR). If free, write "free".
- Match pace: ${pace}. If packed, keep transitions tight; if relaxed, add breaks.
- Avoid duplicates. Prefer iconic or plausible venues.
`;

    const systemPrompt = `You are a senior travel planner. Produce only valid JSON matching the schema. Do not include any prose, explanations, or code fences.`;

    const userPrompt = `Plan a ${days}-day itinerary for ${destination} for ${travelers} traveler${travelers > 1 ? 's' : ''}.
Budget: ${budget} ${currency}
Interests: ${interests.join(', ') || 'general'} (plus inferred from past: ${process.env.NEXT_PUBLIC_PREF_HINT || 'beach, foodie'})
Must-see: ${mustSee.join(', ') || 'none'}
Detail level: ${detailLevel}
User notes: ${userNotes || 'none'}

${constraints}

${schemaHint}`;

    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
            temperature: 0.2,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
          }),
        });

        const data = await resp.json();
        let itinerary: ItineraryDay[] = [];
        try {
          let content = (data?.choices?.[0]?.message?.content || "").trim();
          // Strip possible fences accidentally added
          content = content.replace(/^```json\n?|```$/gim, "").replace(/^```\n?|```$/gim, "");
          itinerary = JSON.parse(content || "[]");
          if (!Array.isArray(itinerary) || !itinerary.length) throw new Error("bad json");
        } catch {
          itinerary = buildMockItinerary(destination, startDate, endDate, interests, mustSee, activitiesPerDay, pace);
        }

        return NextResponse.json({
          ok: true,
          provider: "deepseek",
          itinerary,
          meta: { destination, startDate, endDate, travelers, budget, currency, pace, interests, mustSee, activitiesPerDay, detailLevel },
        });
      } catch (e) {
        // fall through to mock
      }
    }

    // Mock fallback
    return NextResponse.json({
      ok: true,
      provider: "mock",
      itinerary: buildMockItinerary(destination, startDate, endDate, interests, mustSee, activitiesPerDay, pace),
      meta: { destination, startDate, endDate, travelers, budget, currency, pace, interests, mustSee, activitiesPerDay, detailLevel },
    });
  } catch (e) {
    console.error("[itinerary] error", e);
    return NextResponse.json({ ok: false, error: "Failed to generate itinerary." }, { status: 500 });
  }
}
