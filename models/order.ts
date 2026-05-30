import { supabaseAdmin } from '../lib/supabase';
import { getStoreSettings } from '../lib/settings';

// ─── Types ────────────────────────────────────────────────────

import { OrderRow, OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from '../lib/database.types';

export type Order = OrderRow;

export type CreateOrderInput = {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    shippingAddress?: Record<string, unknown>;
    governorate?: string;
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    transactionScreenshot?: string;
    subtotal: number;
    shippingCost: number;
    codFee?: number;
    totalAmount: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    promoCode?: string;
    discountAmount?: number;
    notes?: string;
};

// ─── State machine ────────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    pending: ['confirmed', 'shipped', 'delivered', 'cancelled'],
    confirmed: ['shipped', 'delivered', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
    payment_failed: ['pending', 'cancelled'],
    pending_payment: ['confirmed', 'payment_failed', 'cancelled'],
    processing: ['confirmed', 'shipped', 'delivered', 'cancelled'],
};

export function isValidTransition(from: string, to: string): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Helpers ──────────────────────────────────────────────────

function generateOrderNumber(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const clean = prefix.trim().toUpperCase().replace(/-+$/, '');
    return `${clean}-${timestamp}${random}`;
}

// ─── Service ──────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<Order> {
    const settings = await getStoreSettings();
    const orderNumber = generateOrderNumber(settings.order_prefix);

    const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
            order_number: orderNumber,
            customer_name: input.customerName,
            customer_email: input.customerEmail ?? null,
            customer_phone: input.customerPhone,
            shipping_address: input.shippingAddress ?? null,
            governorate: input.governorate ?? null,
            items: input.items,
            subtotal: input.subtotal,
            shipping_cost: input.shippingCost,
            cod_fee: input.codFee ?? 0,
            total: input.totalAmount,
            currency: 'EGP',
            status: input.status ?? 'pending',
            payment_status: input.paymentStatus ?? 'pending',
            payment_method: input.paymentMethod,
            transaction_screenshot: input.transactionScreenshot ?? null,
            promo_code: input.promoCode ?? null,
            discount_amount: input.discountAmount ?? 0,
            notes: input.notes ?? null,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('Duplicate order number generated. Please retry.');
        }
        throw new Error(`Failed to create order: ${error.message}`);
    }

    return data as Order;
}

export async function getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return data as Order | null;
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return data as Order | null;
}

export async function getOrders(options: {
    page?: number;
    limit?: number;
    status?: string;
} = {}): Promise<{ orders: Order[]; total: number }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 50, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (options.status) {
        query = query.eq('status', options.status as OrderStatus);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return { orders: (data as Order[]) ?? [], total: count ?? 0 };
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
    const current = await getOrderById(id);
    if (!current) throw new Error('Order not found');

    if (!isValidTransition(current.status, status)) {
        throw new Error(`Invalid status transition: ${current.status} → ${status}`);
    }

    const updates: Partial<Pick<OrderRow, 'status' | 'payment_status'>> = {
        status: status as OrderStatus,
    };

    // Auto-mark cash orders as paid on delivery
    if (status === 'delivered' && current.payment_method === 'cashOnDelivery') {
        updates.payment_status = 'paid';
    }

    const { data, error } = await supabaseAdmin
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update order status: ${error.message}`);
    return data as Order;
}

export async function deleteOrder(id: string): Promise<Order | null> {
    const order = await getOrderById(id);
    if (!order) return null;

    const { error } = await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete order: ${error.message}`);
    return order;
}