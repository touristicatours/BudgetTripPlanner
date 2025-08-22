// apps/web/app/api/itinerary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { feedbackLearningService } from "@/src/services/feedback-learning.service";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type Activity = { timeOfDay: TimeOfDay; name: string; note?: string; category?: string; cost?: string; link?: string };
type ItineraryDay = { day: number; title: string; activities: Activity[] };

function daysBetween(start: string, end: string) {
  const s = new Date(start), e = new Date(end);
  if (isNaN(+s) || isNaN(+e) || e < s) return 2;
  return Math.max(1, Math.round((+e - +s) / 86_400_000) + 1);
}

function pick<T>(arr: T[], n: number) {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]!);
  return out;
}

const TIME_SLOTS: TimeOfDay[] = ["morning", "afternoon", "evening"];

function mockActivities(dest: string, interests: string[], activitiesPerDay: number, pace: string): Activity[] {
  const bank: Activity[] = [
    { timeOfDay: "morning", name: `Historic walking tour`, category: "culture", note: "Old town + main square" },
    { timeOfDay: "afternoon", name: `Museum visit`, category: "culture", note: "Top gallery or history museum" },
    { timeOfDay: "evening", name: `Local food crawl`, category: "food", note: "Street food + dessert" },
    { timeOfDay: "morning", name: `Market browse`, category: "shopping", note: "Try seasonal snacks" },
    { timeOfDay: "afternoon", name: `Park / viewpoint`, category: "nature", note: "Great photo spot" },
    { timeOfDay: "evening", name: `River/harbor sunset walk`, category: "relaxation" },
    { timeOfDay: "night", name: `Rooftop bar`, category: "nightlife", note: "Panoramic city view" },
    { timeOfDay: "afternoon", name: `Neighborhood exploration`, category: "culture", note: "Trendy cafés + boutiques" },
    { timeOfDay: "morning", name: `Iconic landmark`, category: "culture", note: "Prebook skip-the-line if possible" },
  ];

  // bias by interests
  const liked = bank.filter(b => !interests.length || interests.some(i => b.category?.includes(i)));
  const pool = liked.length ? liked : bank;

  const slots = TIME_SLOTS.slice(0, Math.min(TIME_SLOTS.length, activitiesPerDay));
  const chosen = pick(pool, activitiesPerDay).map((a, i) => ({
    ...a,
    timeOfDay: slots[i % slots.length],
    note: a.note ?? `Explore ${dest} like a local.`,
  }));

  // pace tweak
  if (pace === "relaxed" && chosen.length > 3) chosen.splice(2);           // keep 2–3
  if (pace === "packed" && chosen.length < 4) chosen.push({ timeOfDay: "night", name: "Optional late-night walk", category: "relaxation", note: "Perfect for night owls" });
  return chosen;
}

function buildMockItinerary(
  dest: string, start: string, end: string,
  interests: string[], mustSee: string[], activitiesPerDay: number, pace: string
): ItineraryDay[] {
  const d = daysBetween(start, end);
  return Array.from({ length: d }, (_, i) => {
    const day = i + 1;
    const base = mockActivities(dest, interests, activitiesPerDay, pace);
    // Inject a must-see once if provided
    if (mustSee.length && i === 0) {
      base.unshift({ timeOfDay: "morning", name: `Must-see: ${mustSee[0]}`, category: "must-see", note: "Plan early to avoid queues" });
    }
    return { day, title: `Day ${day} in ${dest}`, activities: base };
  });
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
      pace = "balanced",                 // relaxed | balanced | packed
      interests = [] as string[],        // e.g. ["culture","food"]
      mustSee = [] as string[],
      activitiesPerDay = 3,              // 2–6
      detailLevel = "concise",           // concise | detailed
      userId,                            // Optional: for learning from feedback
    } = body ?? {};

    // Apply feedback learning if user ID is provided
    let enhancedPreferences = { destination, startDate, endDate, travelers, budget, currency, pace, interests, mustSee, activitiesPerDay, detailLevel };
    
    if (userId) {
      try {
        const statedPreferences = { interests, budget, pace, travelers };
        const enhancedProfile = await feedbackLearningService.getEnhancedUserProfile(userId, statedPreferences);
        
        // Update preferences with learned insights
        enhancedPreferences = {
          ...enhancedPreferences,
          interests: enhancedProfile.interests,
          budget: enhancedProfile.budget,
          pace: enhancedProfile.pace
        };
        
        console.log(`🎓 Applied learning for user ${userId}:`, {
          originalInterests: interests,
          enhancedInterests: enhancedProfile.interests,
          originalBudget: budget,
          enhancedBudget: enhancedProfile.budget,
          originalPace: pace,
          enhancedPace: enhancedProfile.pace
        });
      } catch (error) {
        console.warn('Failed to apply feedback learning, using original preferences:', error);
      }
    }

    // Offline-friendly deterministic mock
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        ok: true,
        provider: "mock",
        itinerary: buildMockItinerary(
          destination, 
          startDate, 
          endDate, 
          enhancedPreferences.interests, 
          mustSee, 
          activitiesPerDay, 
          enhancedPreferences.pace
        ),
        meta: enhancedPreferences,
        learning_applied: !!userId
      });
    }

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const days = daysBetween(startDate, endDate);
    const schemaHint = `Return ONLY JSON like:
[{
  "day": 1,
  "title": "Day 1 in ${destination}",
  "activities": [
    {"timeOfDay":"morning","name":"...","note":"...","category":"culture"},
    {"timeOfDay":"afternoon","name":"...","note":"...","category":"food"},
    {"timeOfDay":"evening","name":"...","note":"...","category":"relaxation"}
  ]
}]`;

    const prompt =
`Plan a ${days}-day trip to ${destination}.
Travelers: ${enhancedPreferences.travelers}. Budget approx: ${enhancedPreferences.budget} ${currency}. Pace: ${enhancedPreferences.pace}.
Interests: ${enhancedPreferences.interests.join(", ") || "general"}.
Must-see priorities: ${mustSee.join(", ") || "none"}.
Activities per day: ${activitiesPerDay}. Detail: ${detailLevel}.
Rules:
- Use slots morning/afternoon/evening (optionally night).
- Activities must be short, actionable; include brief 'note' (booking tip, timing, area).
- Keep budget in mind (free/low-cost options okay).
- Start with a must-see on Day 1 if applicable.
- ${schemaHint}`;

    const resp = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    let itinerary: ItineraryDay[] = [];
    try {
      itinerary = JSON.parse(resp.choices?.[0]?.message?.content?.trim() || "[]");
      if (!Array.isArray(itinerary) || !itinerary.length) throw new Error("bad json");
    } catch {
      itinerary = buildMockItinerary(destination, startDate, endDate, interests, mustSee, activitiesPerDay, pace);
    }

    return NextResponse.json({
      ok: true,
      provider: "openai",
      itinerary,
      meta: enhancedPreferences,
      learning_applied: !!userId
    });
  } catch (e) {
    console.error("[itinerary] error", e);
    return NextResponse.json({ ok: false, error: "Failed to generate itinerary." }, { status: 500 });
  }
}
