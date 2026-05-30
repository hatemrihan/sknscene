import { NextRequest, NextResponse } from 'next/server';

// Valid tokens storage (in production, use a database or Redis)
// For simplicity, we'll accept any non-empty token
// You can enhance this by storing valid tokens in memory or database

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log('🔍 Checking auth, token:', token ? 'present' : 'missing');

        if (token && token.length > 0) {
            // Token exists and is not empty
            return NextResponse.json({ authenticated: true }, { status: 200 });
        } else {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }
    } catch (error) {
        console.error('Check auth error:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
