import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    suggestions: [
      { id: "s1", kind: "weather", payload: { fromDay: 2, toDay: 4, reason: "Rain forecast" } },
      { id: "s2", kind: "price", payload: { item: "Museum A", old: 40, now: 25 } },
    ],
  });
}
