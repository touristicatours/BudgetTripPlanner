"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSaved, bumpPref } from "@/lib/clientStore";

interface TripData {
  id: string;
  form: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget: number;
    currency: string;
  };
  itinerary: any[];
}

const TIME_SLOTS = [
  { value: 'morning', label: '🌅 Morning (6AM-12PM)', color: 'bg-blue-50 text-blue-800' },
  { value: 'afternoon', label: '☀️ Afternoon (12PM-6PM)', color: 'bg-orange-50 text-orange-800' },
  { value: 'evening', label: '🌆 Evening (6PM-10PM)', color: 'bg-purple-50 text-purple-800' },
  { value: 'night', label: '🌙 Night (10PM-6AM)', color: 'bg-gray-50 text-gray-800' }
];

export default function TripPage() {
  const params = useParams();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<any[]>([]);
  const [targetDay, setTargetDay] = useState<number>(1);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string>('afternoon');
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/trips/db/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setTrip(data);
        } else {
          console.error("Failed to fetch trip:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch trip:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTrip();
    }
    // Load saved items for adding into days
    if (typeof window !== 'undefined') {
      setSaved(getSaved());
    }
  }, [params.id]);

  const addToItinerary = async (savedItem: any, day: number, timeSlot: string) => {
    if (!trip) return;
    
    const dayIdx = Math.max(0, Math.min((trip.itinerary?.length || 1) - 1, day - 1));
    const next = [...(trip.itinerary || [])];
    const dayData = { 
      ...(next[dayIdx] || { 
        title: `Day ${dayIdx + 1} • ${trip.form.destination}`, 
        activities: [] 
      }) 
    };
    
    dayData.activities = [
      ...(dayData.activities || []), 
      { 
        timeOfDay: timeSlot, 
        name: savedItem.title, 
        note: savedItem.subtitle || 'Added from Saved',
        tags: savedItem.tags || []
      }
    ];
    
    next[dayIdx] = dayData;
    
    // Persist via PATCH
    const res = await fetch(`/api/trips/db/${trip.id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ itinerary: next }) 
    });
    
    if (res.ok) {
      setTrip({ ...trip, itinerary: next });
      bumpPref((savedItem.tags?.[0]) || 'saved', 2);
      setShowTimeSelector(false);
    } else {
      alert('Failed to add to day');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600">This trip may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.form.destination}</h1>
            <p className="text-lg text-gray-600">
              {new Date(trip.form.startDate).toLocaleDateString()} - {new Date(trip.form.endDate).toLocaleDateString()}
            </p>
            <p className="text-gray-500">
              {trip.form.travelers} traveler{trip.form.travelers > 1 ? "s" : ""} • Budget: {trip.form.budget} {trip.form.currency}
            </p>
          </div>

          {/* Autopilot */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Autopilot</h3>
            <button
              className="px-3 py-2 rounded bg-black text-white"
              onClick={async () => {
                const j = await fetch(`/api/trips/${trip.id}/autopilot`).then(r => r.json());
                alert(`Got ${j?.suggestions?.length || 0} suggestions`);
              }}
            >Fetch suggestions</button>
          </div>

          {/* Receipts */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Receipts</h3>
            <form
              onChange={async (e:any) => {
                const f = e.currentTarget.querySelector("input[type=file]") as HTMLInputElement;
                if (!f?.files?.[0]) return;
                const fd = new FormData(); fd.append("file", f.files[0]);
                await fetch(`/api/trips/${trip.id}/receipts`, { method:"POST", body: fd });
                alert("Uploaded!");
                f.value = "";
              }}
            >
              <input type="file" />
            </form>
          </div>

          {/* Export */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Export</h3>
            <a className="underline" href={`/trips/${trip.id}/export`}>Download PDF</a>
          </div>

          {/* Visual Builder */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Visual Builder</h3>
            <a className="underline" href={`/trips/${trip.id}/visual-builder`}>Open Visual Builder</a>
          </div>

          {/* Trip Content */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
            <div className="space-y-6">
              {trip.itinerary?.map((day: any, index: number) => (
                <div key={index} className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">{day.title}</h3>
                  <div className="space-y-3">
                    {day.activities?.map((activity: any, actIndex: number) => (
                      <div key={actIndex} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500 w-16 flex-shrink-0">
                          {activity.timeOfDay || ""}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          {activity.note && (
                            <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                          )}
                          {activity.tags && activity.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {activity.tags.map((tag: string, tagIdx: number) => (
                                <span key={tagIdx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Saved items section with day/time selector */}
          <div className="mt-10 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Saved Items</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Day:</label>
                  <select 
                    className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={targetDay} 
                    onChange={e => setTargetDay(Number(e.target.value))}
                  >
                    {trip.itinerary?.map((_: any, i: number) => (
                      <option key={i} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Time:</label>
                  <select 
                    className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={targetTimeSlot} 
                    onChange={e => setTargetTimeSlot(e.target.value)}
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {saved.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">💾</div>
                <p className="text-sm text-gray-600">Nothing saved yet. Go to Explore and tap ❤ to save spots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saved.map((s, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{s.title}</h4>
                        {s.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{s.subtitle}</p>
                        )}
                        {s.tags && s.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.tags.map((tag: string, tagIdx: number) => (
                              <span key={tagIdx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => addToItinerary(s, targetDay, targetTimeSlot)}
                      >
                        Add to Day {targetDay}
                      </button>
                      
                      <button
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setShowTimeSelector(!showTimeSelector)}
                      >
                        ⏰
                      </button>
                    </div>

                    {/* Quick time slot selector */}
                    {showTimeSelector && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Quick add to specific time:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOTS.map(slot => (
                            <button
                              key={slot.value}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${slot.color} hover:opacity-80`}
                              onClick={() => addToItinerary(s, targetDay, slot.value)}
                            >
                              {slot.label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
