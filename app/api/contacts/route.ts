import { NextRequest, NextResponse } from 'next/server';
import { createContact, getAllContacts } from '@/models/contact';

// POST - Create new contact request
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const { email, name, message } = data;

        // Basic validation
        if (!email || !name) {
            return NextResponse.json(
                { success: false, error: 'Please provide both email and name.' },
                { status: 400 }
            );
        }

        // Create the contact request
        const contactRequest = await createContact({
            email,
            name,
            message: message || '',
        });

        return NextResponse.json({
            success: true,
            message: 'Contact request submitted successfully',
            data: {
                _id: contactRequest.id, // mapped for legacy frontend compatibility (if any)
                id: contactRequest.id,
                email: contactRequest.email,
                name: contactRequest.name,
                message: contactRequest.message,
                status: contactRequest.status,
                createdAt: contactRequest.created_at,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error submitting contact request:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit contact request. Please try again.' },
            { status: 500 }
        );
    }
}

// GET - Fetch all contacts (admin only)
// Auth is enforced at the middleware level for /admin/* — the PATCH/DELETE
// handlers in [id]/route.ts carry their own getServerSession guards.
export async function GET() {
    try {
        // Fetch all contacts, sorted by most recent first
        const contacts = await getAllContacts();

        return NextResponse.json({
            success: true,
            data: contacts.map(c => ({
                _id: c.id, // mapped for legacy frontend
                id: c.id,
                name: c.name,
                email: c.email,
                message: c.message,
                status: c.status,
                createdAt: c.created_at,
                updatedAt: c.updated_at
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contacts.' },
            { status: 500 }
        );
    }
}
