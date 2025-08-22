"use client";
import { useState } from "react";

export type OnboardingData = {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
};

export default function OnboardingSheet({
  open,
  initial,
  onClose,
  onComplete,
}: {
  open: boolean;
  initial?: Partial<OnboardingData>;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    destination: initial?.destination || "Paris",
    startDate: initial?.startDate || new Date().toISOString().slice(0, 10),
    endDate: initial?.endDate || new Date(Date.now() + 3*86400000).toISOString().slice(0, 10),
    travelers: initial?.travelers || 2,
    budget: initial?.budget || 1500,
    currency: initial?.currency || "USD",
  });

  if (!open) return null;

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const done = () => onComplete(data);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6" onClick={(e)=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Get started</h3>
          <button className="text-sm text-gray-500" onClick={onClose}>Skip</button>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded">
          <div className={`h-1 bg-indigo-600 rounded`} style={{ width: `${(step/3)*100}%` }} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium">Destination</label>
            <input value={data.destination} onChange={(e)=>setData({ ...data, destination: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Where to?" />
          </div>
        )}
        {step === 2 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start date</label>
              <input type="date" value={data.startDate} onChange={(e)=>setData({ ...data, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">End date</label>
              <input type="date" value={data.endDate} onChange={(e)=>setData({ ...data, endDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-sm font-medium">Travelers</label>
              <input type="number" min={1} value={data.travelers} onChange={(e)=>setData({ ...data, travelers: Number(e.target.value||1) })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-sm font-medium">Budget</label>
                <input type="number" min={0} value={data.budget} onChange={(e)=>setData({ ...data, budget: Number(e.target.value||0) })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select value={data.currency} onChange={(e)=>setData({ ...data, currency: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  {['USD','EUR','GBP'].map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button className="px-3 py-2 rounded border" onClick={step===1?onClose:prev}>{step===1? 'Close':'Back'}</button>
          {step<3 ? (
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={next}>Continue</button>
          ) : (
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={done}>Create itinerary</button>
          )}
        </div>
      </div>
    </div>
  );
}
