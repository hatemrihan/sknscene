import { NextRequest, NextResponse } from 'next/server';
import { getActiveSubscribers } from '@/models/newsletter';
import { sendNewsletterEmail } from '@/lib/email/email';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { subject, heading, message, recipientType, selectedEmails } = data;

        // Validation
        if (!subject || !heading || !message) {
            return NextResponse.json(
                { success: false, error: 'Subject, heading, and message are required.' },
                { status: 400 }
            );
        }

        if (!recipientType || (recipientType !== 'all' && recipientType !== 'selected')) {
            return NextResponse.json(
                { success: false, error: 'Invalid recipient type. Must be "all" or "selected".' },
                { status: 400 }
            );
        }

        // Get recipients based on type
        let recipients: string[] = [];

        if (recipientType === 'all') {
            // Fetch all active newsletter subscribers
            const subscribers = await getActiveSubscribers();
            recipients = subscribers.map(sub => sub.email);
        } else if (recipientType === 'selected') {
            if (!selectedEmails || !Array.isArray(selectedEmails) || selectedEmails.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Selected emails are required when recipient type is "selected".' },
                    { status: 400 }
                );
            }
            recipients = selectedEmails;
        }

        if (recipients.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No recipients found to send the newsletter.' },
                { status: 400 }
            );
        }

        console.log(`📧 Preparing to send newsletter to ${recipients.length} recipients`);

        // Send the newsletter
        const result = await sendNewsletterEmail({
            recipients,
            subject,
            heading,
            message
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
                results: result.results
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                results: result.results || null
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Error in newsletter send endpoint:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send newsletter. Please try again.' },
            { status: 500 }
        );
    }
}
