"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

function RemixButton({ id }: { id: string }) {
  const r = useRouter();
  return (
    <button
      onClick={async () => {
        const res = await fetch(`/api/trips/${id}/duplicate`, { method: "POST" });
        const j = await res.json();
        if (j?.trip?.id) r.push(`/trips/${j.trip.id}`);
      }}
      className="px-3 py-2 rounded bg-black text-white"
    >
      Remix this trip
    </button>
  );
}

export default function SharePage() {
  const params = useParams();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/trips/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setTrip(data);
        } else {
          setError("Trip not found");
        }
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        setError("Failed to load trip");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTrip();
    }
  }, [params.id]);

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

  if (error || !trip) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.form.destination}</h1>
            <p className="text-lg text-gray-600">
              {new Date(trip.form.startDate).toLocaleDateString()} - {new Date(trip.form.endDate).toLocaleDateString()}
            </p>
            <p className="text-gray-500">
              {trip.form.travelers} traveler{trip.form.travelers > 1 ? "s" : ""} • Budget: {trip.form.budget} {trip.form.currency}
            </p>
            <div className="mt-4">
              <RemixButton id={trip.id} />
            </div>
          </div>

          <div className="space-y-6">
            {trip.itinerary?.map((day: any, index: number) => (
              <div key={index} className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{day.title}</h3>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t text-center text-gray-500">
            <p>Shared via TripWeaver</p>
            <p className="text-sm">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
