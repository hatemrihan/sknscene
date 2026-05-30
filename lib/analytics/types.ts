// ─── Analytics Event Types ────────────────────────────────────
// Standard e-commerce funnel events used across all tracking systems
// (Meta Pixel, GA4, server-side CAPI, Supabase events table)

export type PageViewParams = {
    url: string;
    referrer: string;
    locale: string;
};

export type ViewContentParams = {
    content_ids: string[];
    content_name: string;
    content_type: string;
    value: number;
    currency: string;
};

export type AddToCartParams = {
    content_ids: string[];
    content_name: string;
    value: number;
    currency: string;
    num_items: number;
};

export type InitiateCheckoutParams = {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
};

export type AddPaymentInfoParams = {
    value: number;
    currency: string;
    payment_method: string;
};

export type PurchaseParams = {
    value: number;
    currency: string;
    transaction_id: string;
    content_ids: string[];
    num_items: number;
};

export type AnalyticsEvent =
    | { name: 'PageView'; params: PageViewParams }
    | { name: 'ViewContent'; params: ViewContentParams }
    | { name: 'AddToCart'; params: AddToCartParams }
    | { name: 'InitiateCheckout'; params: InitiateCheckoutParams }
    | { name: 'AddPaymentInfo'; params: AddPaymentInfoParams }
    | { name: 'Purchase'; params: PurchaseParams };
