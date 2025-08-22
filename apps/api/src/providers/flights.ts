import type { Offer, SearchParams } from "@tripweaver/shared";

// Kiwi (Tequila API) implementation
export async function searchFlightsKiwi(params: SearchParams): Promise<Offer[]> {
  const { origin, destination, dates, pax, budget } = params;
  
  if (!process.env.TEQUILA_API_KEY) {
    return [];
  }

  try {
    const url = `https://tequila-api.kiwi.com/v2/search`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.TEQUILA_API_KEY,
      },
      body: JSON.stringify({
        fly_from: origin,
        fly_to: destination,
        date_from: dates?.start,
        date_to: dates?.end,
        adults: pax,
        max_stopovers: 2,
        curr: "USD",
        limit: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kiwi API error: ${response.status}`);
    }

    const data = await response.json();
    const offers: Offer[] = data.data?.map((flight: any) => ({
      id: flight.id,
      title: `${flight.airlines[0]} ${flight.route[0].flight_no}`,
      price: flight.price,
      currency: "USD",
      supplier: "kiwi" as const,
      url: `https://www.kiwi.com/us/booking?token=${flight.booking_token}`,
      startAt: flight.route[0].local_departure,
      endAt: flight.route[flight.route.length - 1].local_arrival,
      extra: {
        duration: flight.duration,
        stops: flight.route.length - 1,
        airlines: flight.airlines,
      },
    })) || [];

    return offers;
  } catch (error) {
    console.error("Kiwi API error:", error);
    return [];
  }
}

// Booking.com flights (deep-link fallback)
export async function searchFlightsBooking(params: SearchParams): Promise<Offer[]> {
  const { origin, destination, dates, pax } = params;
  
  try {
    const deepLink = bookingFlightsDeepLink({
      origin,
      dest: destination,
      dates: dates!,
      pax,
    });

    return [{
      id: `booking-${origin}-${destination}-${dates?.start}`,
      title: `Flight from ${origin} to ${destination}`,
      price: 0, // Price not available via deep-link
      currency: "USD",
      supplier: "booking" as const,
      url: deepLink,
      extra: {
        note: "Price available on Booking.com",
      },
    }];
  } catch (error) {
    console.error("Booking.com deep-link error:", error);
    return [];
  }
}

function bookingFlightsDeepLink(params: {
  origin: string;
  dest: string;
  dates: { start: string; end: string };
  pax: number;
}): string {
  const { origin, dest, dates, pax } = params;
  const startDate = new Date(dates.start).toISOString().split('T')[0];
  const endDate = new Date(dates.end).toISOString().split('T')[0];
  
  return `https://www.booking.com/flights/from-${origin}/to-${dest}/?date=${startDate}&date2=${endDate}&adults=${pax}`;
}
