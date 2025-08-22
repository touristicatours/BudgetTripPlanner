import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Simple admin credentials check
    // In production, use proper authentication with hashed passwords
    const validCredentials = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    };

    if (username === validCredentials.username && password === validCredentials.password) {
      // Set admin session cookie
      const response = NextResponse.json({ authenticated: true });
      response.cookies.set('admin-session', 'admin-authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json({ authenticated: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ authenticated: false, error: 'Authentication failed' }, { status: 500 });
  }
}
