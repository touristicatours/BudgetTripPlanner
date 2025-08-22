"use client";
import { useEffect, useState } from "react";

export default function Enhancements({ id }: { id: string }) {
  const [sugs, setSugs] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetch(`/api/trips/${id}/autopilot`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setSugs(j.suggestions || []))
      .catch(() => setSugs([]));
  }, [id]);

  async function uploadReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch(`/api/trips/${id}/receipts`, { method: "POST", body: fd });
    const j = await r.json();
    setMsg(j.ok ? "Receipt uploaded ✅" : "Upload failed ❌");
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Autopilot suggestions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {sugs.map(s => (
            <div key={s.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 capitalize">{s.kind}</span>
                <button className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                  Apply
                </button>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap">{JSON.stringify(s.payload, null, 2)}</pre>
              </div>
            </div>
          ))}
          {!sugs.length && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <div className="text-sm">No suggestions yet.</div>
              <div className="text-xs mt-1">Check back later for personalized recommendations.</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Receipts inbox</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              onChange={uploadReceipt}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept="image/*,.pdf"
            />
          </div>
          {msg && (
            <div className={`text-sm p-2 rounded ${msg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Export options</h3>
        <div className="flex gap-3">
          <a 
            href={`/trips/${id}/export`} 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </a>
        </div>
      </div>
    </div>
  );
}
