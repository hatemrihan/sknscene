import { NextRequest, NextResponse } from 'next/server';
import { updateContactStatus, deleteContact } from '@/models/contact';

// Auth is enforced by Next.js middleware on /admin/* routes.
// getServerSession cannot read cookies in App Router route handlers
// without the request context — using it here causes silent 401s.

const VALID_STATUSES = ['pending', 'responded', 'archived'] as const;
type ContactStatus = typeof VALID_STATUSES[number];

function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contact ID UUID' },
                { status: 400 }
            );
        }

        const { status } = await request.json();

        if (!VALID_STATUSES.includes(status as ContactStatus)) {
            return NextResponse.json(
                { success: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const updated = await updateContactStatus({ id, status: status as ContactStatus });

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'Contact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: updated.id,
                id: updated.id,
                name: updated.name,
                email: updated.email,
                status: updated.status,
                updatedAt: updated.updated_at
            }
        });

    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update contact' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid contact ID UUID' },
                { status: 400 }
            );
        }

        const deleted = await deleteContact(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Contact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete contact' },
            { status: 500 }
        );
    }
}
