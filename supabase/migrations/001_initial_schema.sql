-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Sknscene — Complete schema (skincare e-commerce)               ║
-- ║  Tables: products, categories, orders, contacts, returns,       ║
-- ║          newsletters, notifications, offers, promos,            ║
-- ║          store_settings, payment_settings, currency_settings,   ║
-- ║          exchange_rates, drop_points, governorate_pricing,      ║
-- ║          analytics_events                                       ║
-- ║  RPC: toggle_all_products_visibility, deduct_stock,             ║
-- ║       restore_stock, claim_promo                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ─── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending','confirmed','shipped','delivered','cancelled',
    'payment_failed','pending_payment','processing'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cashOnDelivery','instaPay');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage','fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_status AS ENUM ('pending','responded','archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE return_status AS ENUM ('pending','approved','rejected','processed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE default_currency AS ENUM ('EGP','SAR','AED','USD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL UNIQUE,
  image_url   text,
  visible     boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Products ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                    text NOT NULL UNIQUE,
  name                    text NOT NULL,
  price                   numeric NOT NULL DEFAULT 0,
  original_price          numeric,
  discount                numeric,
  main_image              text NOT NULL DEFAULT '',
  images                  text[] NOT NULL DEFAULT '{}',
  videos                  text[] NOT NULL DEFAULT '{}',
  description             text NOT NULL DEFAULT '',
  promo_code              text NOT NULL DEFAULT '',
  variants                jsonb NOT NULL DEFAULT '[]',
  option_groups           jsonb NOT NULL DEFAULT '[]',
  stock                   integer NOT NULL DEFAULT 0,
  is_active               boolean NOT NULL DEFAULT true,
  is_featured             boolean NOT NULL DEFAULT false,
  "order"                 integer NOT NULL DEFAULT 0,
  sizes                   text NOT NULL DEFAULT '',
  size_guide              text NOT NULL DEFAULT '',
  show_out_of_stock_badge boolean NOT NULL DEFAULT false,
  show_preorder_badge     boolean NOT NULL DEFAULT false,
  detailed_description    text NOT NULL DEFAULT '',
  shipping_info           text NOT NULL DEFAULT '',
  faqs                    jsonb NOT NULL DEFAULT '[]',
  city_pricing            jsonb NOT NULL DEFAULT '[]',
  categories              text[] NOT NULL DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── Orders ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number            text NOT NULL UNIQUE,
  customer_name           text NOT NULL,
  customer_email          text,
  customer_phone          text,
  shipping_address        jsonb,
  items                   jsonb NOT NULL DEFAULT '[]',
  subtotal                numeric NOT NULL DEFAULT 0,
  shipping_cost           numeric NOT NULL DEFAULT 0,
  cod_fee                 numeric NOT NULL DEFAULT 0,
  total                   numeric NOT NULL DEFAULT 0,
  currency                text NOT NULL DEFAULT 'USD',
  status                  order_status NOT NULL DEFAULT 'pending',
  payment_method          payment_method NOT NULL DEFAULT 'cashOnDelivery',
  payment_status          payment_status NOT NULL DEFAULT 'pending',
  transaction_screenshot  text,
  promo_code              text,
  discount_amount         numeric NOT NULL DEFAULT 0,
  notes                   text,
  governorate             text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── Contacts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  email       text NOT NULL,
  message     text,
  status      contact_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Newsletters (subscribers) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletters (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          text NOT NULL UNIQUE,
  is_active      boolean NOT NULL DEFAULT true,
  subscribed_at  timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── Notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        text NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  data        jsonb,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Offers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           text NOT NULL,
  description     text NOT NULL DEFAULT '',
  image           text NOT NULL DEFAULT '',
  link            text NOT NULL DEFAULT '',
  is_active       boolean NOT NULL DEFAULT true,
  show_on_home    boolean NOT NULL DEFAULT false,
  show_pages      text[] NOT NULL DEFAULT '{}',
  display_order   integer NOT NULL DEFAULT 0,
  product_ids     text[] NOT NULL DEFAULT '{}',
  discount_label  text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Promos ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promos (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            text NOT NULL UNIQUE,
  discount_type   discount_type NOT NULL DEFAULT 'percentage',
  discount_value  numeric NOT NULL DEFAULT 0,
  minimum_order   numeric,
  maximum_discount numeric,
  usage_limit     integer,
  used_count      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  expires_at      timestamptz,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Returns ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         text NOT NULL,
  order_number  text NOT NULL,
  status        return_status NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Store Settings (singleton) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name            text NOT NULL DEFAULT 'Sknscene',
  store_email           text NOT NULL DEFAULT '',
  store_phone           text NOT NULL DEFAULT '',
  social_instagram      text NOT NULL DEFAULT '',
  social_tiktok         text NOT NULL DEFAULT '',
  social_facebook       text NOT NULL DEFAULT '',
  meta_title            text NOT NULL DEFAULT '',
  meta_description      text NOT NULL DEFAULT '',
  announcement_bar      text NOT NULL DEFAULT '',
  announcement_active   boolean NOT NULL DEFAULT false,
  maintenance_mode      boolean NOT NULL DEFAULT false,
  order_prefix          text NOT NULL DEFAULT 'SKN',
  low_stock_threshold   integer NOT NULL DEFAULT 5,
  auto_confirm_orders   boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ─── Payment Settings (singleton) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_settings (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cod_enabled       boolean NOT NULL DEFAULT true,
  insta_pay_enabled boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── Currency Settings (singleton) ────────────────────────────────
CREATE TABLE IF NOT EXISTS currency_settings (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  default_currency  default_currency NOT NULL DEFAULT 'USD',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── Exchange Rates ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exchange_rates (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  base        text NOT NULL DEFAULT 'USD',
  rates       jsonb NOT NULL DEFAULT '{}',
  fetched_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Drop Points ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drop_points (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  address       text NOT NULL DEFAULT '',
  governorate   text NOT NULL DEFAULT '',
  city          text NOT NULL DEFAULT '',
  lat           double precision NOT NULL DEFAULT 0,
  lng           double precision NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Governorate Pricing (shipping) ──────────────────────────────
CREATE TABLE IF NOT EXISTS governorate_pricing (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  governorate     text NOT NULL UNIQUE,
  shipping_cost   numeric NOT NULL DEFAULT 0,
  cod_fee         numeric NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Analytics Events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    text NOT NULL,
  session_id  text,
  event_name  text NOT NULL,
  url_path    text,
  referrer    text,
  locale      text NOT NULL DEFAULT 'en',
  payload     jsonb NOT NULL DEFAULT '{}',
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- ─── RPC Functions ────────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════════

-- Toggle all product visibility
CREATE OR REPLACE FUNCTION toggle_all_products_visibility(p_visible boolean)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE products SET is_active = p_visible;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Deduct stock (product-level or variant-level)
CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id uuid,
  p_quantity integer,
  p_variant_name text DEFAULT NULL,
  p_variant_attrs jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_variants jsonb;
  v_variant jsonb;
  v_idx integer;
  v_current_stock integer;
BEGIN
  SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  IF p_variant_attrs IS NOT NULL THEN
    v_variants := v_product.variants;
    FOR v_idx IN 0..jsonb_array_length(v_variants) - 1 LOOP
      v_variant := v_variants->v_idx;
      IF v_variant->'attributes' @> p_variant_attrs THEN
        v_current_stock := (v_variant->>'stock')::integer;
        IF v_current_stock < p_quantity THEN
          RETURN jsonb_build_object('success', false, 'error', 'Insufficient variant stock');
        END IF;
        v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_current_stock - p_quantity));
        UPDATE products SET variants = v_variants, updated_at = now() WHERE id = p_product_id;
        RETURN jsonb_build_object('success', true, 'remaining_stock', v_current_stock - p_quantity);
      END IF;
    END LOOP;
    RETURN jsonb_build_object('success', false, 'error', 'Variant not found');
  ELSE
    IF v_product.stock < p_quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock');
    END IF;
    UPDATE products SET stock = stock - p_quantity, updated_at = now() WHERE id = p_product_id;
    RETURN jsonb_build_object('success', true, 'remaining_stock', v_product.stock - p_quantity);
  END IF;
END;
$$;

-- Restore stock
CREATE OR REPLACE FUNCTION restore_stock(
  p_product_id uuid,
  p_quantity integer,
  p_variant_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET stock = stock + p_quantity, updated_at = now() WHERE id = p_product_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Claim promo code
CREATE OR REPLACE FUNCTION claim_promo(p_code text, p_subtotal numeric)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_promo promos%ROWTYPE;
  v_discount numeric;
BEGIN
  SELECT * INTO v_promo FROM promos WHERE code = p_code AND is_active = true FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Promo code not found or inactive');
  END IF;

  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Promo code has expired');
  END IF;

  IF v_promo.usage_limit IS NOT NULL AND v_promo.used_count >= v_promo.usage_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Promo code usage limit reached');
  END IF;

  IF v_promo.minimum_order IS NOT NULL AND p_subtotal < v_promo.minimum_order THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum order not met');
  END IF;

  IF v_promo.discount_type = 'percentage' THEN
    v_discount := p_subtotal * (v_promo.discount_value / 100);
  ELSE
    v_discount := v_promo.discount_value;
  END IF;

  IF v_promo.maximum_discount IS NOT NULL AND v_discount > v_promo.maximum_discount THEN
    v_discount := v_promo.maximum_discount;
  END IF;

  UPDATE promos SET used_count = used_count + 1 WHERE id = v_promo.id;

  RETURN jsonb_build_object(
    'success', true,
    'discount', v_discount,
    'discount_type', v_promo.discount_type::text,
    'discount_value', v_promo.discount_value,
    'code', v_promo.code
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ─── Auto-update timestamps trigger ──────────────────────────────
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to every table with updated_at
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT unnest(ARRAY[
      'categories','products','orders','contacts','newsletters',
      'notifications','offers','promos','returns','store_settings',
      'payment_settings','currency_settings','drop_points','governorate_pricing'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- ─── Row Level Security ──────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE governorate_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public read payment_settings" ON payment_settings FOR SELECT USING (true);
CREATE POLICY "Public read currency_settings" ON currency_settings FOR SELECT USING (true);
CREATE POLICY "Public read exchange_rates" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "Public read drop_points" ON drop_points FOR SELECT USING (is_active = true);
CREATE POLICY "Public read governorate_pricing" ON governorate_pricing FOR SELECT USING (is_active = true);

-- Public insert for customer-facing operations
CREATE POLICY "Public insert newsletters" ON newsletters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert returns" ON returns FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- ─── Indexes ─────────────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters (email);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promos_code ON promos (code);
CREATE INDEX IF NOT EXISTS idx_governorate_pricing_gov ON governorate_pricing (governorate);

-- ═══════════════════════════════════════════════════════════════════
-- ─── Seed defaults ───────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO store_settings (store_name, store_email, order_prefix)
VALUES ('Sknscene', 'hello@sknscene.com', 'SKN')
ON CONFLICT DO NOTHING;

INSERT INTO payment_settings (cod_enabled, insta_pay_enabled)
SELECT true, false
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);

INSERT INTO currency_settings (default_currency)
SELECT 'USD'
WHERE NOT EXISTS (SELECT 1 FROM currency_settings);
