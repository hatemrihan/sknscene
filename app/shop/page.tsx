import { Metadata } from 'next';
import { ShopClient } from './_components/ShopClient';

const BASE_URL = 'https://sknscene.netlify.app';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getCategoryFromParams(
    sp: { [key: string]: string | string[] | undefined }
): string | null {
    return typeof sp.category === 'string' ? sp.category : null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const resolvedSP = await searchParams;
    const category = getCategoryFromParams(resolvedSP);
    const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';

    const title = category
        ? `${category} | Sknscene`
        : 'Shop Premium Products | Sknscene';

    const description = `Discover the latest collection of ${category || 'premium products'} in Lebanon. Shop now at Sknscene.`;
    const url = `${BASE_URL}/shop${categoryParam}`;

    return {
        title,
        description,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'Sknscene',
            type: 'website',
            locale: 'en_US',
            images: [{
                url: `${BASE_URL}/og-default.jpg`,
                width: 1200,
                height: 630,
                alt: title,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${BASE_URL}/og-default.jpg`],
        },
    };
}

export default async function ShopPage({ searchParams }: Props) {
    const resolvedSP = await searchParams;
    const category = getCategoryFromParams(resolvedSP);
    const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';

    const title = category || 'Shop';
    const description = `Shop the latest collection of ${category || 'premium products'} at Sknscene.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${BASE_URL}/shop${categoryParam}`,
        inLanguage: 'en',
        publisher: {
            '@type': 'Organization',
            name: 'Sknscene',
            url: BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/icon.png`,
            },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ShopClient />
        </>
    );
}
