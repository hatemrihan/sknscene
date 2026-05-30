import { Metadata } from 'next';
import Nav from './sections/nav';
import Header from './sections/header';
import Categories from './sections/categories';
import Featured from './sections/featured';
import Products from './sections/products';
import Explore from './sections/explore';
import Footer from './sections/footer';

const BASE_URL = 'https://sknscene.netlify.app';

export const metadata: Metadata = {
    title: 'Sknscene — Premium Skincare for Girls',
    description: 'Premium skincare for girls — curated clean beauty formulas, modern self-care essentials, delivered to your door in Lebanon.',
    alternates: {
        canonical: BASE_URL,
    },
    openGraph: {
        title: 'Sknscene — Premium Skincare for Girls',
        description: 'Premium skincare for girls — curated clean beauty formulas, modern self-care essentials, delivered to your door in Lebanon.',
        url: BASE_URL,
        locale: 'en_US',
    },
};

export default function Home() {
    // ── JSON-LD: Organization & WebSite ──────────────────────
    const organizationLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Sknscene',
        url: BASE_URL,
        logo: `${BASE_URL}/icon.png`,
        sameAs: [
            'https://instagram.com/sknscene',
            'https://tiktok.com/@sknscene',
        ],
    };

    const websiteLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Sknscene',
        url: BASE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${BASE_URL}/shop?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
            />
            <Nav />
            <Header />
            <Categories />
            <Featured />
            <Products />
            <Explore />
            <Footer />
        </>
    );
}
