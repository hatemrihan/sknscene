import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 86400; // Regenerate sitemap every 24 hours

const BASE_URL = 'https://sknscene.netlify.app';

// Priority map for static routes
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { path: '/offers', priority: 0.7, changeFrequency: 'daily' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/return', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/refund', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/shipping', priority: 0.4, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // ── Static routes ─────────────────────────────────────────
    const staticRoutes = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    // ── Dynamic product routes ───────────────────────────────
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true);

    if (error) {
        console.error('[sitemap] Failed to fetch products:', error.message);
    }

    const productRoutes = (products || []).map((product) => ({
        url: `${BASE_URL}/shop/${product.slug}`,
        lastModified: new Date(product.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
}
