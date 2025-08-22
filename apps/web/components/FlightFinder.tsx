"use client";

import { useState } from "react";

type Props = {
  defaultFrom?: string;
  defaultTo?: string;
  defaultDepart?: string;
  defaultReturn?: string;
  defaultAdults?: number;
  onSelect?: (opt: any) => void; // optional callback to attach to trip later
};

export default function FlightFinder(p: Props) {
  const [from, setFrom] = useState(p.defaultFrom ?? "DXB");
  const [to, setTo] = useState(p.defaultTo ?? "CDG");
  const [departDate, setDepartDate] = useState(p.defaultDepart ?? "");
  const [returnDate, setReturnDate] = useState(p.defaultReturn ?? "");
  const [adults, setAdults] = useState(p.defaultAdults ?? 1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, departDate, returnDate: returnDate || undefined, adults }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setResults(j.results || []);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function addToTrip(opt: any) {
    if (p.onSelect) p.onSelect(opt);
    navigator.clipboard?.writeText(`${opt.airline} ${opt.from}→${opt.to} ${fmtTime(opt.departTime)} - ${fmtTime(opt.arriveTime)} • €${opt.price.amount}`);
    alert("Flight copied. (Hook up onSelect to attach to your trip)");
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="text-lg font-semibold mb-3">Find flights</h3>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="col-span-1">
          <label className="text-xs text-gray-600">From</label>
          <input value={from} onChange={e=>setFrom(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="DXB" />
        </div>
        <div className="col-span-1">
          <label className="text-xs text-gray-600">To</label>
          <input value={to} onChange={e=>setTo(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="CDG" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-600">Depart</label>
          <input type="date" value={departDate} onChange={e=>setDepartDate(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-600">Return (optional)</label>
          <input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-1">
          <label className="text-xs text-gray-600">Adults</label>
          <input type="number" min={1} value={adults} onChange={e=>setAdults(parseInt(e.target.value || "1"))} className="w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={search} disabled={loading || !from || !to || !departDate} className="px-3 py-1 rounded border bg-white disabled:opacity-50">
          {loading ? "Searching…" : "Search flights"}
        </button>
      </div>

      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}

      {!!results.length && (
        <ul className="mt-4 space-y-3">
          {results.map((r) => (
            <li key={r.id} className="rounded-lg border p-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{r.airline}</div>
                <div className="text-sm text-gray-600">
                  {r.from} → {r.to} · {fmtTime(r.departTime)} — {fmtTime(r.arriveTime)} · {fmtDur(r.durationMinutes)} · {r.stops ? `${r.stops} stop` : "non-stop"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold">€{r.price.amount}</div>
                <button onClick={() => addToTrip(r)} className="px-3 py-1 rounded border bg-white">Add to trip</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    // Use consistent 24-hour format to avoid hydration mismatches
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch { return iso; }
}
function fmtDur(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m`;
}
