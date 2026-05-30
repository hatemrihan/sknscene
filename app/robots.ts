import { MetadataRoute } from 'next';

const BASE_URL = 'https://sknscene.netlify.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/api',
                    '/admin/',
                    '/admin',
                    '/cart/',
                    '/cart',
                    '/checkout/',
                    '/checkout',
                ],
            },
            {
                // Block AI training crawlers
                userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
                disallow: '/',
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}