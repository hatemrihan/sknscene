import { NextResponse } from "next/server";

// TEMPORARY debug endpoint — DELETE after fixing auth
export async function GET() {
    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
        VERCEL_URL: process.env.VERCEL_URL || "NOT SET",
        VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
        // What NextAuth would use as callback:
        expectedCallback: `${process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`}/api/auth/callback/google`,
    });
}
