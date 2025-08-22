import { NextRequest, NextResponse } from "next/server";
import { ExecutionService } from "../../../../api/src/services/execution_service";

const executionService = new ExecutionService();

export async function POST(request: NextRequest) {
  try {
    const { tripId, userId } = await request.json();

    if (!tripId || !userId) {
      return NextResponse.json(
        { error: 'Trip ID and User ID are required' },
        { status: 400 }
      );
    }

    // Start execution mode
    const context = await executionService.startExecution(tripId, userId);

    return NextResponse.json({
      success: true,
      context,
      message: 'Execution mode started successfully'
    });

  } catch (error) {
    console.error('Error starting execution mode:', error);
    return NextResponse.json(
      { error: 'Failed to start execution mode' },
      { status: 500 }
    );
  }
}
