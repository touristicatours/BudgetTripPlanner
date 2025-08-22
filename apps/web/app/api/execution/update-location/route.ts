import { NextRequest, NextResponse } from "next/server";
import { ExecutionService, LocationUpdate } from "../../../../api/src/services/execution_service";

const executionService = new ExecutionService();

export async function POST(request: NextRequest) {
  try {
    const { tripId, userId, latitude, longitude, accuracy } = await request.json();

    if (!tripId || !userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Trip ID, User ID, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const locationUpdate: LocationUpdate = {
      tripId,
      userId,
      latitude,
      longitude,
      timestamp: new Date(),
      accuracy
    };

    // Update location and get real-time status
    const status = await executionService.updateLocation(locationUpdate);

    return NextResponse.json({
      success: true,
      status,
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}
