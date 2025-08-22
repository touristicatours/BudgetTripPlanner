import type { Offer, SearchParams } from "@tripweaver/shared";

// Booking.com hotels (API if available, otherwise deep-link)
export async function searchHotelsBooking(params: SearchParams): Promise<Offer[]> {
  const { destination, dates, pax, area } = params;
  
  if (process.env.BOOKING_API_KEY) {
    // TODO: Implement Booking.com API when approved
    return [];
  }

  try {
    const deepLink = bookingHotelsDeepLink({
      city: destination,
      dates: dates!,
      pax,
      area,
    });

    return [{
      id: `booking-hotel-${destination}-${dates?.start}`,
      title: `Hotels in ${destination}`,
      price: 0, // Price not available via deep-link
      currency: "USD",
      supplier: "booking" as const,
      url: deepLink,
      extra: {
        note: "Prices available on Booking.com",
      },
    }];
  } catch (error) {
    console.error("Booking.com deep-link error:", error);
    return [];
  }
}

// Airbnb (deep-link only - no public API)
export async function searchHotelsAirbnb(params: SearchParams): Promise<Offer[]> {
  const { destination, dates, pax } = params;
  
  try {
    const deepLink = airbnbDeepLink({
      city: destination,
      dates: dates!,
      guests: pax,
    });

    return [{
      id: `airbnb-${destination}-${dates?.start}`,
      title: `Airbnb in ${destination}`,
      price: 0, // Price not available via deep-link
      currency: "USD",
      supplier: "airbnb" as const,
      url: deepLink,
      extra: {
        note: "Prices available on Airbnb",
      },
    }];
  } catch (error) {
    console.error("Airbnb deep-link error:", error);
    return [];
  }
}

function bookingHotelsDeepLink(params: {
  city: string;
  dates: { start: string; end: string };
  pax: number;
  area?: string;
}): string {
  const { city, dates, pax, area } = params;
  const startDate = new Date(dates.start).toISOString().split('T')[0];
  const endDate = new Date(dates.end).toISOString().split('T')[0];
  
  let url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${startDate}&checkout=${endDate}&group_adults=${pax}`;
  
  if (area) {
    url += `&selected_currency=USD&nflt=neighborhood%3D${encodeURIComponent(area)}`;
  }
  
  return url;
}

function airbnbDeepLink(params: {
  city: string;
  dates: { start: string; end: string };
  guests: number;
}): string {
  const { city, dates, guests } = params;
  const startDate = new Date(dates.start).toISOString().split('T')[0];
  const endDate = new Date(dates.end).toISOString().split('T')[0];
  
  return `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?checkin=${startDate}&checkout=${endDate}&adults=${guests}`;
}
