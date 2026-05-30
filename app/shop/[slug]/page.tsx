import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/models/product';
import { getStoreSettings } from '@/lib/settings';
import { ProductClient } from './_components/ProductClient';

const BASE_URL = 'https://sknscene.netlify.app';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Sknscene',
            robots: { index: false, follow: false },
        };
    }

    const mainImage = product.main_image || `${BASE_URL}/icon.png`;
    const description = (product.description || `Buy ${product.name} at Sknscene.`).slice(0, 160);
    const canonicalUrl = `${BASE_URL}/shop/${slug}`;

    return {
        title: `${product.name} | Sknscene`,
        description,
        keywords: [product.name, ...(product.categories || []), 'Sknscene'].filter(Boolean),
        robots: {
            index: !!product.is_active,
            follow: true,
            googleBot: {
                index: !!product.is_active,
                follow: true,
                'max-image-preview': 'large',
            },
        },
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en': `${BASE_URL}/shop/${slug}`,
            },
        },
        other: {
            'product:price:amount': product.price.toString(),
            'product:price:currency': 'USD',
            'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        },
        openGraph: {
            title: `${product.name} | Sknscene`,
            description,
            url: canonicalUrl,
            siteName: 'Sknscene',
            type: 'website',
            locale: 'en_US',
            images: [{
                url: mainImage,
                width: 1200,
                height: 630,
                alt: product.name,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Sknscene`,
            description,
            images: [mainImage],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) notFound();

    const [relatedProducts, settings] = await Promise.all([
        getRelatedProducts(product.id, product.categories || [], 4),
        getStoreSettings(),
    ]);

    // ── JSON-LD: Product ─────────────────────────────────────
    const priceValidUntil = new Date();
    priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.id,
        image: [product.main_image, ...(product.images || [])].filter(Boolean),
        brand: {
            '@type': 'Brand',
            name: 'Sknscene',
        },
        offers: {
            '@type': 'Offer',
            url: `${BASE_URL}/shop/${slug}`,
            priceCurrency: 'USD',
            price: product.price,
            priceValidUntil: priceValidUntil.toISOString().split('T')[0],
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'Sknscene',
            },
        },
    };

    // ── JSON-LD: Breadcrumb ──────────────────────────────────
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Shop',
                item: `${BASE_URL}/shop`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: product.categories?.[0] || 'Products',
                item: `${BASE_URL}/shop?category=${encodeURIComponent(product.categories?.[0] || '')}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `${BASE_URL}/shop/${slug}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ProductClient
                initialProduct={product}
                relatedProducts={relatedProducts}
                lowStockThreshold={settings.low_stock_threshold}
            />
        </>
    );
}