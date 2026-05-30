import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/app/components/contexts/CartContext";
import { AnalyticsProvider } from '@/lib/analytics';

const futura = localFont({
  src: [
    {
      path: '../public/fonts/FuturaCyrillicLight.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicBook.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicMedium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicDemi.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicBold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicHeavy.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/FuturaCyrillicExtraBold.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sknscene.netlify.app'),
  title: {
    template: '%s | Sknscene',
    default: 'Sknscene — Premium Skincare for Girls',
  },
  description: 'Premium skincare for girls — curated clean beauty formulas, modern self-care essentials, delivered to your door in Lebanon.',
  openGraph: {
    title: 'Sknscene — Premium Skincare for Girls',
    description: 'Premium skincare for girls — curated clean beauty formulas, modern self-care essentials, delivered to your door in Lebanon.',
    url: 'https://sknscene.netlify.app',
    siteName: 'Sknscene',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://sknscene.netlify.app/og-default.jpg',
      width: 1200,
      height: 630,
      alt: 'Sknscene',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sknscene — Premium Skincare for Girls',
    description: 'Premium skincare for girls — curated clean beauty formulas, modern self-care essentials, delivered to your door in Lebanon.',
    images: ['https://sknscene.netlify.app/og-default.jpg'],
  },
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
    canonical: 'https://sknscene.netlify.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${futura.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <CartProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </CartProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
