import { NextRequest, NextResponse } from "next/server";
import { ExecutionService } from "../../../../api/src/services/execution_service";

const executionService = new ExecutionService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Get execution status
    const status = await executionService.getExecutionStatus(tripId);

    if (!status) {
      return NextResponse.json(
        { error: 'Execution not active for this trip' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
      message: 'Execution status retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting execution status:', error);
    return NextResponse.json(
      { error: 'Failed to get execution status' },
      { status: 500 }
    );
  }
}
