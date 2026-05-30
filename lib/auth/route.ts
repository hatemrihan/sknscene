import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
    interface Session {
        user?: {
            isAdmin?: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        isAdmin?: boolean;
    }
}

// Admin emails — loaded from env var for easy changes without redeployment.
// Set ADMIN_EMAILS in .env.local as a comma-separated list.
// Falls back to hardcoded list if env var is not set.
const FALLBACK_ADMIN_EMAILS = ["hatemrihann@gmail.com", "hatemrihan100@gmail.com", "laraabroumian@icloud.com"];

export function getAdminEmails(): string[] {
    const envEmails = process.env.ADMIN_EMAILS;
    if (envEmails) {
        return envEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    }
    return FALLBACK_ADMIN_EMAILS;
}

function isAdminEmail(email: string): boolean {
    return getAdminEmails().includes(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "missing-client-id",
            clientSecret: process.env.GOOGLE_SECRET_ID || process.env.GOOGLE_CLIENT_SECRET || "missing-client-secret",
        }),
    ],
    callbacks: {
        // ✅ OPTIMIZED: Simplified signIn callback
        async signIn({ user }) {
            return !!user.email; // Simple boolean check - FAST
        },
        // ✅ OPTIMIZED: Fast JWT token creation
        async jwt({ token, user }) {
            if (user?.email) {
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
                token.isAdmin = isAdminEmail(user.email);
            }
            return token;
        },
        // ✅ OPTIMIZED: Fast session creation
        async session({ session, token }) {
            if (session.user) {
                // NextAuth's native types require checking user existence, and we type-bypass isAdmin to bypass strict ambient declarations
                session.user.email = token.email as string | undefined | null;
                session.user.name = token.name as string | undefined | null;
                session.user.image = token.picture as string | undefined | null;
                session.user.isAdmin = token.isAdmin;
            }
            return session;
        },
        // ✅ OPTIMIZED: Simplified redirect
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (url.startsWith(baseUrl)) return url;
            return baseUrl;
        },
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // ✅ 30 days session
    },
    // ✅ OPTIMIZED: Disable debug mode in production for speed
    debug: process.env.NODE_ENV === 'development',
    // ✅ OPTIMIZED: Add secret for faster JWT operations
    secret: process.env.NEXTAUTH_SECRET,
};