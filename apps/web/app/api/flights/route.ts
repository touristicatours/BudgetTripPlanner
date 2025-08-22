import { NextResponse } from "next/server";
import { searchFlights, type FlightQuery } from "@/lib/flights";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<FlightQuery>;
    const { from, to, departDate } = body;
    if (!from || !to || !departDate) {
      return NextResponse.json({ error: "from, to, departDate required" }, { status: 400 });
    }
    const data = await searchFlights({
      from,
      to,
      departDate,
      returnDate: body.returnDate,
      adults: body.adults ?? 1,
    });
    return NextResponse.json({ ok: true, results: data });
  } catch (e) {
    console.error("[flights] error:", e);
    return NextResponse.json({ ok: false, error: "search failed" }, { status: 500 });
  }
}
