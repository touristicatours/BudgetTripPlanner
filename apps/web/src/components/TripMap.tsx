"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type TripMapProps = {
  destination: string;
  itinerary?: any[];
  className?: string;
};

export default function TripMap({ destination, itinerary, className = "" }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const noKey = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!mapRef.current) return;
    // If no Google Maps key, gracefully skip map initialization
    if (noKey) { setLoading(false); return; }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load()
      .then(() => {
        if (!mapRef.current) return;

        // Create map centered on destination
        const newMap = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 }, // Will be updated by geocoding
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        setMap(newMap);

        // Geocode destination to get coordinates
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: destination }, (results: any, status: any) => {
          if (status === "OK" && results?.[0]) {
            const location = results[0].geometry.location;
            newMap.setCenter(location);
            
            // Add destination marker
            new (window as any).google.maps.Marker({
              position: location,
              map: newMap,
              title: destination,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new (window as any).google.maps.Size(32, 32)
              }
            });

            // Add itinerary markers if available
            if (itinerary && itinerary.length > 0) {
              itinerary.forEach((day, dayIndex) => {
                day.activities?.forEach((activity: any, activityIndex: number) => {
                  // Try to geocode activity names that might be locations
                  if (activity.name && activity.name.length > 3) {
                    setTimeout(() => {
                                             geocoder.geocode({ 
                         address: `${activity.name}, ${destination}` 
                       }, (results: any, status: any) => {
                        if (status === "OK" && results?.[0]) {
                          const marker = new (window as any).google.maps.Marker({
                            position: results[0].geometry.location,
                            map: newMap,
                            title: activity.name,
                            label: {
                              text: `${dayIndex + 1}.${activityIndex + 1}`,
                              color: "white",
                              fontSize: "10px"
                            },
                            icon: {
                              path: (window as any).google.maps.SymbolPath.CIRCLE,
                              scale: 8,
                              fillColor: "#3B82F6",
                              fillOpacity: 0.8,
                              strokeColor: "#1E40AF",
                              strokeWeight: 2
                            }
                          });

                          // Add info window
                          const infoWindow = new (window as any).google.maps.InfoWindow({
                            content: `
                              <div style="padding: 8px; max-width: 200px;">
                                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${activity.name}</h3>
                                <p style="margin: 0; font-size: 12px; color: #666;">Day ${dayIndex + 1} • ${activity.timeOfDay || 'Activity'}</p>
                                ${activity.note ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">${activity.note}</p>` : ''}
                              </div>
                            `
                          });

                          marker.addListener("click", () => {
                            infoWindow.open(newMap, marker);
                          });
                        }
                      });
                    }, (dayIndex * 100) + (activityIndex * 50)); // Stagger requests
                  }
                });
              });
            }
          } else {
            setError("Could not find location for destination");
          }
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error("Failed to load Google Maps:", err);
        setError("Failed to load map");
        setLoading(false);
      });
  }, [destination, itinerary, noKey]);

  // If no key, render a subtle placeholder instead of an error banner
  if (noKey) {
    return (
      <div className={`rounded-lg border bg-gray-50 p-4 text-center text-xs text-gray-500 ${className}`}>
        Map preview disabled (no Google Maps key)
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border bg-gray-50 p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600">{error}</p>
        <p className="text-xs text-gray-500 mt-1">Make sure you have a valid Google Maps API key</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-white overflow-hidden ${className}`}>
      <div className="p-3 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Trip Map</h3>
        <p className="text-xs text-gray-500">{destination}</p>
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="w-full h-64"
          style={{ minHeight: "256px" }}
        />
      </div>
    </div>
  );
}
