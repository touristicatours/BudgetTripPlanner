import type { Offer, SearchParams } from "@tripweaver/shared";

// GetYourGuide Partner API implementation
export async function searchActivitiesGyg(params: SearchParams): Promise<Offer[]> {
  const { destination, date, categories, budget } = params;
  
  if (!process.env.GYG_API_KEY) {
    return [];
  }

  try {
    const url = `https://api.getyourguide.com/1.0/tours`;
    const searchParams = new URLSearchParams({
      q: destination,
      count: "20",
      currency: "USD",
      language: "en",
    });

    if (date) {
      searchParams.append("date", date);
    }

    if (categories && categories.length > 0) {
      searchParams.append("categories", categories.join(","));
    }

    const response = await fetch(`${url}?${searchParams}`, {
      headers: {
        "X-API-Key": process.env.GYG_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`GetYourGuide API error: ${response.status}`);
    }

    const data = await response.json();
    const offers: Offer[] = data.data?.tours?.map((tour: any) => ({
      id: tour.id,
      title: tour.title,
      price: tour.price?.amount || 0,
      currency: tour.price?.currency || "USD",
      supplier: "gyg" as const,
      url: tour.url,
      lat: tour.location?.lat,
      lng: tour.location?.lng,
      startAt: tour.start_time,
      endAt: tour.end_time,
      extra: {
        duration: tour.duration,
        rating: tour.rating,
        review_count: tour.review_count,
        categories: tour.categories,
      },
    })) || [];

    return offers;
  } catch (error) {
    console.error("GetYourGuide API error:", error);
    return [];
  }
}
