import { NextRequest, NextResponse } from "next/server";
import { ExecutionService } from "../../../../api/src/services/execution_service";

const executionService = new ExecutionService();

export async function POST(request: NextRequest) {
  try {
    const { tripId } = await request.json();

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Stop execution mode
    await executionService.stopExecution(tripId);

    return NextResponse.json({
      success: true,
      message: 'Execution mode stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping execution mode:', error);
    return NextResponse.json(
      { error: 'Failed to stop execution mode' },
      { status: 500 }
    );
  }
}
