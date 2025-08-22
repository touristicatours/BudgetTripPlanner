import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { form } = body;

    if (!form) {
      return NextResponse.json(
        { error: "Form data is required" },
        { status: 400 }
      );
    }

    // Call the enhanced itinerary API with ML-powered recommendations
    const itineraryResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/v1/ai/itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tripId: id,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: form.travelers || 2,
        budgetTotal: form.budget || 1000,
        currency: form.currency || 'USD',
        pace: form.pace || 'moderate',
        interests: form.interests || [],
        dietary: form.dietary || [],
        mustSee: form.mustSee || []
      })
    });

    if (!itineraryResponse.ok) {
      throw new Error(`Itinerary API responded with status: ${itineraryResponse.status}`);
    }

    const itineraryData = await itineraryResponse.json();

    // Transform the API response to match the frontend format
    const transformedItinerary = itineraryData.days?.map((day: any, index: number) => ({
      day: index + 1,
      title: day.summary || `Day ${index + 1} in ${form.destination}`,
      activities: day.items?.map((item: any) => ({
        timeOfDay: item.time?.split(':')[0] >= 12 ? 
          (item.time?.split(':')[0] >= 18 ? 'evening' : 'afternoon') : 'morning',
        name: item.title,
        note: item.notes,
        category: item.category,
        cost: item.estCost ? `${item.estCost} ${itineraryData.currency}` : undefined,
        // ML-powered data
        rating: item.rating,
        user_ratings_total: item.user_ratings_total,
        price_level: item.price_level,
        placeId: item.placeId,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        mlScore: item.mlScore
      })) || []
    })) || [];

    return NextResponse.json({
      success: true,
      itinerary: transformedItinerary,
      provider: itineraryData.provider || 'ml-powered',
      message: 'Recommendations refreshed successfully'
    });

  } catch (error) {
    console.error('Error refreshing itinerary:', error);
    return NextResponse.json(
      { 
        error: "Failed to refresh recommendations",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
