// src/lib/flights.ts
export type FlightQuery = {
  from: string; // IATA or city, e.g. "DXB"
  to: string;   // IATA or city, e.g. "CDG"
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // optional
  adults?: number;
};

export type FlightOption = {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string; // local ISO
  arriveTime: string; // local ISO
  durationMinutes: number;
  stops: number;
  price: { amount: number; currency: string };
  link?: string; // placeholder to real booking
};

const AIRLINES = ["Emirates", "Qatar", "Air France", "Lufthansa", "KLM", "Turkish", "British Airways"];

function rand(seed: number) {
  // deterministic-ish rng
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function searchFlights(q: FlightQuery): Promise<FlightOption[]> {
  const base = Date.parse(q.departDate + "T08:00:00Z") || Date.now();
  const adults = q.adults ?? 1;

  const items: FlightOption[] = Array.from({ length: 6 }).map((_, i) => {
    const r = rand(base / 1e7 + i);
    const dep = new Date(base + i * 60 * 60 * 1000);
    const dur = 180 + Math.floor(r * 240); // 3–7h
    const arr = new Date(dep.getTime() + dur * 60 * 1000);
    const stops = r > 0.7 ? 1 : 0;
    const airline = AIRLINES[Math.floor(r * AIRLINES.length)];
    const priceBase = 120 + Math.floor(r * 380); // €120–€500
    const amount = priceBase * adults;

    return {
      id: `${q.from}-${q.to}-${i}`,
      airline,
      from: q.from.toUpperCase(),
      to: q.to.toUpperCase(),
      departTime: dep.toISOString(),
      arriveTime: arr.toISOString(),
      durationMinutes: dur + (stops ? 60 : 0),
      stops,
      price: { amount, currency: "EUR" },
      link: "#",
    };
  });

  return items.sort((a, b) => a.price.amount - b.price.amount);
}
