/**
 * Database types for Supabase / PostgreSQL
 * Auto-generation command (run after migrations):
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
 *
 * Until then, these types are manually maintained and match the SQL migrations.
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'payment_failed'
    | 'pending_payment'
    | 'processing';

export type PaymentMethod = 'cashOnDelivery' | 'instaPay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DiscountType = 'percentage' | 'fixed';
export type DefaultCurrency = 'EGP' | 'SAR' | 'AED';

// ─── JSONB sub-shapes (stored as jsonb columns in Postgres) ──────────────────

export type ProductVariant = {
    clientId?: string;
    attributes: Record<string, string>;  // { [optionGroupName]: selectedValue }
    stock: number;
    price?: number;
    images?: string[];
    videos?: string[];
}

export type ProductOptionGroup = {
    name: string;           // Admin-defined label: "Weight", "Flavor", "Item", etc.
    values: string[];       // ["250g", "500g", "1kg"]
}

export type ProductFaq = {
    clientId?: string;
    question: string;
    answer: string;
}

export type CityPricing = {
    cityName: string;
    governorate: string;
    price: number;
    shippingCost?: number;
    codFee?: number;
    isActive: boolean;
}

export type OrderCustomer = {
    name: string;
    email: string;
    phone: string;
    address: string;
    country?: string;
}

export type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;                          // legacy — kept for old orders
    color?: string;                         // legacy — kept for old orders
    attributes?: Record<string, string>;    // new — used for new orders
    image?: string;                         // optional — manual orders may not have images
}

// ─── Table row types ──────────────────────────────────────────────────────────

export type CategoryRow = {
    id: string;           // uuid
    name: string;
    image_url: string | null;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export type ContactRow = {
    id: string;
    name: string;
    email: string;
    message: string | null;
    status: 'pending' | 'responded' | 'archived';
    created_at: string;
    updated_at: string;
}

export type OfferRow = {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    is_active: boolean;
    show_on_home: boolean;
    show_pages: string[];
    display_order: number;
    product_ids: string[];
    discount_label: string;
    created_at: string;
    updated_at: string;
}

export type CurrencySettingsRow = {
    id: string;
    default_currency: DefaultCurrency;
    created_at: string;
    updated_at: string;
}

export type ExchangeRatesRow = {
    id: string;
    base: string;
    rates: Record<string, number>;   // jsonb
    fetched_at: string;
}

export type NewsletterRow = {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    created_at: string;
    updated_at: string;
}

export type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown> | null;  // jsonb
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export type OrderRow = {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_address: Record<string, unknown> | null;
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    cod_fee: number;
    total: number;
    currency: string;
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    transaction_screenshot: string | null;
    promo_code: string | null;
    discount_amount: number;
    notes: string | null;
    governorate: string | null;
    created_at: string;
    updated_at: string;
}

export type PaymentSettingsRow = {
    id: string;
    cod_enabled: boolean;
    insta_pay_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export type ProductRow = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    main_image: string;
    images: string[];              // text[]
    videos: string[];              // text[]
    description: string;
    promo_code: string;
    variants: ProductVariant[];    // jsonb — attribute-based variant combos
    option_groups: ProductOptionGroup[];  // jsonb — admin-defined option types
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    order: number;
    sizes: string;                 // legacy — kept for backward compat
    size_guide: string;            // legacy — kept for backward compat
    show_out_of_stock_badge: boolean;
    show_preorder_badge: boolean;
    detailed_description: string;
    shipping_info: string;
    faqs: ProductFaq[];            // jsonb
    city_pricing: CityPricing[];   // jsonb
    categories: string[];          // text[]
    created_at: string;
    updated_at: string;
}

export type PromoRow = {
    id: string;
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    minimum_order: number | null;
    maximum_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    expires_at: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export type ReturnRow = {
    id: string;
    email: string;
    order_number: string;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    created_at: string;
    updated_at: string;
}

export type StoreSettingsRow = {
    id: string;
    store_name: string;
    store_email: string;
    store_phone: string;
    social_instagram: string;
    social_tiktok: string;
    social_facebook: string;
    meta_title: string;
    meta_description: string;
    announcement_bar: string;
    announcement_active: boolean;
    maintenance_mode: boolean;
    order_prefix: string;
    low_stock_threshold: number;
    auto_confirm_orders: boolean;
    created_at: string;
    updated_at: string;
}

export type DropPointRow = {
    id: string;
    name: string;
    address: string;
    governorate: string;
    city: string;
    lat: number;
    lng: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type GovernoratePricingRow = {
    id: string;
    governorate: string;
    shipping_cost: number;
    cod_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type AnalyticsEventRow = {
    id: string;
    event_id: string;
    session_id: string | null;
    event_name: string;
    url_path: string | null;
    referrer: string | null;
    locale: string;
    payload: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// ─── Full Database type (consumed by createClient<Database>) ─────────────────

export type Database = {
    public: {
        Tables: {
            analytics_events: {
                Row: AnalyticsEventRow;
                Insert: Omit<AnalyticsEventRow, 'id' | 'created_at'>;
                Update: Partial<Omit<AnalyticsEventRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            categories: {
                Row: CategoryRow;
                Insert: Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            contacts: {
                Row: ContactRow;
                Insert: Omit<ContactRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ContactRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            offers: {
                Row: OfferRow;
                Insert: Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            currency_settings: {
                Row: CurrencySettingsRow;
                Insert: Omit<CurrencySettingsRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<CurrencySettingsRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            exchange_rates: {
                Row: ExchangeRatesRow;
                Insert: Omit<ExchangeRatesRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ExchangeRatesRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            newsletters: {
                Row: NewsletterRow;
                Insert: Omit<NewsletterRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<NewsletterRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            notifications: {
                Row: NotificationRow;
                Insert: Omit<NotificationRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<NotificationRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            orders: {
                Row: OrderRow;
                Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            payment_settings: {
                Row: PaymentSettingsRow;
                Insert: Omit<PaymentSettingsRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<PaymentSettingsRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            products: {
                Row: ProductRow;
                Insert: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            promos: {
                Row: PromoRow;
                Insert: Omit<PromoRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<PromoRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            returns: {
                Row: ReturnRow;
                Insert: Omit<ReturnRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ReturnRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            store_settings: {
                Row: StoreSettingsRow;
                Insert: Omit<StoreSettingsRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<StoreSettingsRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            drop_points: {
                Row: DropPointRow;
                Insert: Omit<DropPointRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<DropPointRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
            governorate_pricing: {
                Row: GovernoratePricingRow;
                Insert: Omit<GovernoratePricingRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<GovernoratePricingRow, 'id' | 'created_at' | 'updated_at'>>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            toggle_all_products_visibility: {
                Args: {
                    p_visible: boolean;
                };
                Returns: number;
            };
            deduct_stock: {
                Args: {
                    p_product_id: string;
                    p_quantity: number;
                    p_variant_name: string | null;
                    p_variant_attrs: Record<string, string> | null;
                };
                Returns: Record<string, unknown>;
            };
            restore_stock: {
                Args: {
                    p_product_id: string;
                    p_quantity: number;
                    p_variant_name: string | null;
                };
                Returns: Record<string, unknown>;
            };
            claim_promo: {
                Args: {
                    p_code: string;
                    p_subtotal: number;
                };
                Returns: Record<string, unknown>;
            };
        };
        Enums: {
            order_status: OrderStatus;
            payment_method: PaymentMethod;
            payment_status: PaymentStatus;
            discount_type: DiscountType;
            contact_status: 'pending' | 'responded' | 'archived';
            return_status: 'pending' | 'approved' | 'rejected' | 'processed';
            default_currency: DefaultCurrency;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}