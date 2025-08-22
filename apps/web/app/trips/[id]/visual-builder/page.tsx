"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

interface MapPoint {
  id: string;
  name: string;
  type: "attraction" | "restaurant" | "hotel" | "transport";
  lat: number;
  lng: number;
  day: number;
  timeOfDay: "morning" | "afternoon" | "evening";
  duration: number; // in hours
}

interface DayPlan {
  day: number;
  points: MapPoint[];
  totalDuration: number;
}

export default function VisualTripBuilder() {
  const params = useParams();
  const tripId = params.id as string;
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [tripData, setTripData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [draggedPoint, setDraggedPoint] = useState<MapPoint | null>(null);
  const [showOptimizeRoute, setShowOptimizeRoute] = useState(false);

  useEffect(() => {
    // Fetch trip data
    console.log("Fetching trip data for:", tripId);
    fetch(`/api/trips/${tripId}`)
      .then(r => {
        console.log("Trip API response status:", r.status);
        return r.json();
      })
      .then(j => {
        console.log("Trip data received:", j);
        if (j.error) {
          console.error("Trip not found:", j.error);
          return;
        }
        setTripData(j);
        initializeDays(j);
      })
      .catch(error => {
        console.error("Error fetching trip:", error);
      });
  }, [tripId]);

  const initializeDays = (trip: any) => {
    const tripDays = [];
    const startDate = new Date(trip.form?.startDate);
    const endDate = new Date(trip.form?.endDate);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 1; i <= dayCount; i++) {
      tripDays.push({
        day: i,
        points: generateMockPoints(i, trip.form?.destination),
        totalDuration: 0
      });
    }
    setDays(tripDays);
  };

  const generateMockPoints = (day: number, destination: string) => {
    const mockPoints: { [key: string]: MapPoint[] } = {
      "Paris": [
        { id: "1", name: "Eiffel Tower", type: "attraction", lat: 48.8584, lng: 2.2945, day, timeOfDay: "morning", duration: 2 },
        { id: "2", name: "Louvre Museum", type: "attraction", lat: 48.8606, lng: 2.3376, day, timeOfDay: "afternoon", duration: 3 },
        { id: "3", name: "Le Comptoir du Relais", type: "restaurant", lat: 48.8566, lng: 2.3522, day, timeOfDay: "evening", duration: 1.5 }
      ],
      "Rome": [
        { id: "4", name: "Colosseum", type: "attraction", lat: 41.8902, lng: 12.4922, day, timeOfDay: "morning", duration: 2 },
        { id: "5", name: "Vatican Museums", type: "attraction", lat: 41.9069, lng: 12.4534, day, timeOfDay: "afternoon", duration: 3 },
        { id: "6", name: "Trattoria Da Enzo", type: "restaurant", lat: 41.8902, lng: 12.4922, day, timeOfDay: "evening", duration: 1.5 }
      ],
      "Tokyo": [
        { id: "7", name: "Senso-ji Temple", type: "attraction", lat: 35.7148, lng: 139.7967, day, timeOfDay: "morning", duration: 2 },
        { id: "8", name: "Shibuya Crossing", type: "attraction", lat: 35.6595, lng: 139.7004, day, timeOfDay: "afternoon", duration: 1 },
        { id: "9", name: "Ichiran Ramen", type: "restaurant", lat: 35.6762, lng: 139.6503, day, timeOfDay: "evening", duration: 1 }
      ],
      "Test Destination": [
        { id: "10", name: "Sample Attraction", type: "attraction", lat: 40.7128, lng: -74.0060, day, timeOfDay: "morning", duration: 2 },
        { id: "11", name: "Local Restaurant", type: "restaurant", lat: 40.7589, lng: -73.9851, day, timeOfDay: "afternoon", duration: 1.5 },
        { id: "12", name: "City Park", type: "attraction", lat: 40.7829, lng: -73.9654, day, timeOfDay: "evening", duration: 1 }
      ]
    };

    return mockPoints[destination] || [
      { id: "13", name: "Generic Attraction", type: "attraction", lat: 40.7128, lng: -74.0060, day, timeOfDay: "morning", duration: 2 },
      { id: "14", name: "Local Restaurant", type: "restaurant", lat: 40.7589, lng: -73.9851, day, timeOfDay: "afternoon", duration: 1.5 },
      { id: "15", name: "City View", type: "attraction", lat: 40.7829, lng: -73.9654, day, timeOfDay: "evening", duration: 1 }
    ];
  };

  const handleDragStart = (point: MapPoint) => {
    setDraggedPoint(point);
  };

  const handleDrop = (targetDay: number, targetTime: string) => {
    if (!draggedPoint) return;

    const updatedDays = days.map(day => {
      if (day.day === draggedPoint.day) {
        return {
          ...day,
          points: day.points.filter(p => p.id !== draggedPoint.id)
        };
      }
      if (day.day === targetDay) {
        const updatedPoint = {
          ...draggedPoint,
          day: targetDay,
          timeOfDay: targetTime as "morning" | "afternoon" | "evening"
        };
        return {
          ...day,
          points: [...day.points, updatedPoint]
        };
      }
      return day;
    });

    setDays(updatedDays);
    setDraggedPoint(null);
  };

  const optimizeRoute = (dayNumber: number) => {
    const day = days.find(d => d.day === dayNumber);
    if (!day) return;

    // Simple optimization: sort by time of day
    const optimizedPoints = [...day.points].sort((a, b) => {
      const timeOrder = { morning: 0, afternoon: 1, evening: 2 };
      return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
    });

    setDays(days.map(d => d.day === dayNumber ? { ...d, points: optimizedPoints } : d));
  };

  const getPointIcon = (type: string) => {
    switch (type) {
      case "attraction": return "🏛️";
      case "restaurant": return "🍽️";
      case "hotel": return "🏨";
      case "transport": return "🚇";
      default: return "📍";
    }
  };

  const getTimeColor = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning": return "bg-yellow-100 border-yellow-300";
      case "afternoon": return "bg-orange-100 border-orange-300";
      case "evening": return "bg-purple-100 border-purple-300";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visual Trip Builder
          </h1>
          <p className="text-gray-600">
            Drag and drop to organize your {tripData.form?.destination} itinerary
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Interactive Map</h2>
                <p className="text-sm text-gray-600">Day {selectedDay} - {tripData.form?.destination}</p>
              </div>
              
              {/* Mock Map */}
              <div 
                ref={mapRef}
                className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
              >
                {/* Map Points */}
                {days.find(d => d.day === selectedDay)?.points.map((point) => (
                  <div
                    key={point.id}
                    className="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${((point.lng + 180) / 360) * 100}%`,
                      top: `${((90 - point.lat) / 180) * 100}%`
                    }}
                    draggable
                    onDragStart={() => handleDragStart(point)}
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border-2 border-indigo-500">
                      <span className="text-lg">{getPointIcon(point.type)}</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded text-xs shadow whitespace-nowrap">
                      {point.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Planner */}
          <div className="space-y-6">
            {/* Day Selector */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-3">Select Day</h3>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDay === day.day
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Schedule */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Day {selectedDay} Schedule</h3>
                <button
                  onClick={() => optimizeRoute(selectedDay)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Optimize Route
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {["morning", "afternoon", "evening"].map((timeOfDay) => (
                  <div key={timeOfDay} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 capitalize">
                      {timeOfDay} ({timeOfDay === "morning" ? "🌅" : timeOfDay === "afternoon" ? "☀️" : "🌆"})
                    </h4>
                    
                    <div
                      className={`min-h-16 border-2 border-dashed rounded-lg p-2 ${getTimeColor(timeOfDay)}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(selectedDay, timeOfDay)}
                    >
                      {days
                        .find(d => d.day === selectedDay)
                        ?.points.filter(p => p.timeOfDay === timeOfDay)
                        .map((point) => (
                          <div
                            key={point.id}
                            className="bg-white rounded-lg p-3 shadow-sm border mb-2 cursor-move"
                            draggable
                            onDragStart={() => handleDragStart(point)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getPointIcon(point.type)}</span>
                                <div>
                                  <div className="font-medium text-sm">{point.name}</div>
                                  <div className="text-xs text-gray-500">{point.duration}h</div>
                                </div>
                              </div>
                              <button className="text-red-500 hover:text-red-700 text-sm">
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      
                      {days
                        .find(d => d.day === selectedDay)
                        ?.points.filter(p => p.timeOfDay === timeOfDay).length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-4">
                          Drop activities here
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-3">Day {selectedDay} Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Activities:</span>
                  <span className="font-medium">
                    {days.find(d => d.day === selectedDay)?.points.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span className="font-medium">
                    {days.find(d => d.day === selectedDay)?.points.reduce((sum, p) => sum + p.duration, 0) || 0}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Attractions:</span>
                  <span className="font-medium">
                    {days.find(d => d.day === selectedDay)?.points.filter(p => p.type === "attraction").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurants:</span>
                  <span className="font-medium">
                    {days.find(d => d.day === selectedDay)?.points.filter(p => p.type === "restaurant").length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
