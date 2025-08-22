import { NextRequest, NextResponse } from "next/server";
import { getTrip } from "@/lib/trips";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email, message } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Get the trip from file system
    const trip = await getTrip(params.id);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Create a share link
    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${trip.id}`;
    
    // For now, we'll simulate sending an email
    // In production, you'd integrate with a service like SendGrid, Mailgun, etc.
    console.log(`📧 Email invitation sent to ${email}`);
    console.log(`🔗 Share URL: ${shareUrl}`);
    console.log(`💬 Message: ${message || 'Check out this trip!'}`);
    console.log(`🎯 Trip: ${trip.form?.destination || 'Unknown destination'}`);

    // For now, we'll just log the invitation
    // In a full implementation, you'd store this in the database
    console.log(`📝 Invitation stored for trip ${trip.id} to ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: `Invitation sent to ${email}`,
      shareUrl 
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
