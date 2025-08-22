"use client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { downloadJSON, copy, compressToParam } from "@/lib/share";
import TripMap from "./TripMap";

export default function ItineraryViewer({ form, itinerary }: { form: any; itinerary: any }) {
  const ref = useRef<HTMLDivElement>(null);

  async function exportPDF() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const r = Math.min(W / canvas.width, H / canvas.height);
    const w = canvas.width * r, h = canvas.height * r;
    pdf.addImage(img, "PNG", (W - w) / 2, 24, w, h);
    pdf.save(`itinerary-${form.destination}.pdf`);
  }

  async function shareLink() {
    const p = compressToParam({ form, itinerary });
    const url = `${location.origin}/plan?p=${p}`;
    await copy(url);
    alert("Share link copied!");
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={() => downloadJSON(`itinerary-${form.destination}.json`, { form, itinerary })} className="border rounded-md px-3 py-1 bg-white">Download JSON</button>
        <button onClick={shareLink} className="border rounded-md px-3 py-1 bg-white">Copy share link</button>
        <button onClick={exportPDF} className="border rounded-md px-3 py-1 bg-white">Export PDF</button>
      </div>

      <div ref={ref} className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">{form.destination}</h2>
          <p className="text-sm text-gray-500">
            {form.startDate} – {form.endDate} • {form.travelers} traveler{form.travelers > 1 ? "s" : ""}
          </p>
        </div>
        
        {/* Trip Map */}
        <TripMap 
          destination={form.destination} 
          itinerary={itinerary}
        />
        
        {itinerary?.map((d: any, i: number) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium">{d.title}</h3>
              <span className="text-xs text-gray-500">Day {d.day}</span>
            </div>
            <ol className="mt-3 space-y-2">
              {d.activities?.map((a: any, j: number) => (
                <li key={j} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-14">{a.timeOfDay ?? ""}</span>
                  <div>
                    <div className="text-sm">{a.name}{a.cost ? ` · ${a.cost}` : ""}</div>
                    {a.note && <div className="text-xs text-gray-500">{a.note}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
