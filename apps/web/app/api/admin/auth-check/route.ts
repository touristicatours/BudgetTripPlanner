import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // In a real implementation, you would validate the session token
    // For now, we'll use a simple check
    const isValidSession = adminSession.value === 'admin-authenticated';
    
    if (!isValidSession) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
