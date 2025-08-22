'use client';
import { useEffect, useState } from 'react';
import SideDock from '@/components/SideDock';
import { getSaved, removeSaved, SavedItem, bumpPref } from '@/src/lib/clientStore';

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(()=>{ setItems(getSaved()); },[]);

  const unsave = (id:string) => { removeSaved(id); setItems(getSaved()); };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <SideDock />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gradient mb-6">Saved</h1>
            {items.length === 0 ? (
              <p className="text-gray-600">Nothing saved yet. Explore and tap ❤ to save spots.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(it => (
                  <div key={it.id} className="bg-white rounded-xl p-4 shadow border hover:shadow-lg transition-all">
                    <div className="w-full h-36 rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 mb-3" />
                    <h3 className="font-semibold text-gray-900">{it.title}</h3>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {(it.tags||[]).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{t}</span>)}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-primary text-sm" onClick={()=>{ bumpPref((it.tags?.[0])||'saved'); alert('We will prioritize similar spots in your next itineraries.'); }}>Use in plan</button>
                      <button className="px-3 py-2 rounded-xl border text-sm" onClick={()=>unsave(it.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


