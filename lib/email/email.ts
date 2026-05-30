import * as React from 'react';
import { Resend } from 'resend';
import { getAdminEmails } from '@/lib/auth/route';
import { OrderEmailTemplate, AdminOrderEmailTemplate } from '@/components/email-template';

// ─── Resend Client (lazy — avoids build-time crash when env is absent) ────

let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

// The "from" address must be a verified domain in Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Sknscene <noreply@sknscene.netlify.app>';

// ─── Types ────────────────────────────────────────────────────

interface SendNewsletterInput {
    recipients: string[];
    subject: string;
    heading: string;
    message: string;
}

interface SendResult {
    success: boolean;
    message?: string;
    error?: string;
    results?: { sent: number; failed: number };
}

interface OrderEmailData {
    customerEmail?: string;
    customerName: string;
    orderId: string;
    orderItems: {
        name: string;
        quantity: number;
        price: number;
        size?: string;
        color?: string;
        attributes?: Record<string, string>;
    }[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    discountAmount: number;
    promoCode?: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: {
        governorate: string;
        city: string;
        address: string;
        apartment?: string;
    };
    customerPhone: string;
}

// ─── Newsletter Email ─────────────────────────────────────────

export async function sendNewsletterEmail(input: SendNewsletterInput): Promise<SendResult> {
    const { recipients, subject, heading, message } = input;

    let sent = 0;
    let failed = 0;

    // Resend supports batch sending (up to 100 per call).
    // For larger lists we chunk into batches.
    const BATCH_SIZE = 50;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        try {
            await getResend().batch.send(
                batch.map((email) => ({
                    from: FROM_EMAIL,
                    to: email,
                    subject,
                    html: buildNewsletterHtml(heading, message),
                }))
            );
            sent += batch.length;
        } catch (err) {
            console.error(`❌ Batch send failed (${i}–${i + batch.length}):`, err);
            failed += batch.length;
        }
    }

    if (failed === recipients.length) {
        return { success: false, error: 'All emails failed to send', results: { sent, failed } };
    }

    return {
        success: true,
        message: `Newsletter sent to ${sent} recipients${failed > 0 ? ` (${failed} failed)` : ''}`,
        results: { sent, failed },
    };
}

// ─── Order Confirmation Email (to customer — only if email exists) ────

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    if (!data.customerEmail) {
        return { success: true }; // No customer email — skip silently
    }

    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: [data.customerEmail],
            subject: `Order Confirmed — ${data.orderId}`,
            react: React.createElement(OrderEmailTemplate, {
                customerName: data.customerName,
                orderId: data.orderId,
                orderItems: data.orderItems,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                codFee: data.codFee,
                discountAmount: data.discountAmount,
                promoCode: data.promoCode,
                totalAmount: data.totalAmount,
                paymentMethod: data.paymentMethod,
                shippingAddress: data.shippingAddress,
                customerPhone: data.customerPhone,
            }),
        });
        return { success: true };
    } catch (err) {
        console.error('❌ Customer email failed:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
    }
}

// ─── Admin Order Notification (ALWAYS fires — regardless of customer email) ──

export async function sendAdminOrderNotification(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    const adminEmails = getAdminEmails();

    if (adminEmails.length === 0) {
        console.warn('⚠️ No admin emails configured — skipping admin notification');
        return { success: false, error: 'No admin emails' };
    }

    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: adminEmails,
            subject: `🛒 New Order #${data.orderId} — ${data.customerName} — ${data.totalAmount.toLocaleString()} USD`,
            react: React.createElement(AdminOrderEmailTemplate, {
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                orderId: data.orderId,
                orderItems: data.orderItems,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                codFee: data.codFee,
                discountAmount: data.discountAmount,
                promoCode: data.promoCode,
                totalAmount: data.totalAmount,
                paymentMethod: data.paymentMethod,
                shippingAddress: data.shippingAddress,
                customerPhone: data.customerPhone,
            }),
        });
        return { success: true };
    } catch (err) {
        console.error('❌ Admin notification email failed:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send admin email' };
    }
}

// ─── HTML Templates ───────────────────────────────────────────

function buildNewsletterHtml(heading: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:#1c1917;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px">Sknscene</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px">
        <h2 style="color:#1c1917;margin:0 0 16px;font-size:20px;font-weight:600">${heading}</h2>
        <div style="color:#44403c;font-size:15px;line-height:1.7">${message.replace(/\n/g, '<br>')}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#fafaf9;text-align:center;border-top:1px solid #e7e5e4">
        <p style="color:#a8a29e;font-size:12px;margin:0">You received this because you subscribed to Sknscene updates.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
