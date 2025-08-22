import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are TripWeaver, a senior travel planner.
- Ask brief clarifying questions when key details are missing (dates, budget, pace, must‑see).
- Give realistic, local knowledge: cluster activities by neighborhood to reduce transit.
- Include opening hours hints, ideal time windows, and ticket notes where relevant.
- Suggest 2–3 food spots per day (mix of affordable/local and one special option).
- Keep replies concise, scannable, and actionable.
- Prefer bullet points and short paragraphs; NEVER include code blocks.
- Prices should be approximate, in the user's currency if stated, or local currency otherwise.
- If the user asks for an itinerary, propose a day plan and ask one follow‑up to refine.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // Fallback: minimal mock if no key
    if (!apiKey) {
      const last = messages?.slice(-1)[0]?.content || "";
      return NextResponse.json({
        ok: true,
        provider: "mock",
        content: `Here is a compact plan based on: "${last.slice(0, 100)}"\n- Morning: landmark + local cafe\n- Afternoon: museum + park\n- Evening: neighborhood stroll + dinner\nAny dietary preferences or must‑see spots to add?`,
      });
    }

    const dsMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(messages || []).map(m => ({ role: m.role, content: m.content })),
    ].slice(-12); // limit context size

    const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0.5,
        messages: dsMessages,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[chat] deepseek error", resp.status, text);
      return NextResponse.json({ ok: false, error: "AI provider error" }, { status: 502 });
    }

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content || "").trim();

    return NextResponse.json({ ok: true, provider: "deepseek", content });
  } catch (e) {
    console.error("[chat] error", e);
    return NextResponse.json({ ok: false, error: "Failed to get chat response" }, { status: 500 });
  }
}


