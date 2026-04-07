import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2D2D7F',
};

export const metadata: Metadata = {
  title: 'Afterlife - Your Friend for Life and Beyond',
  description:
    'Create your digital legacy, manage your will, and leave messages for your loved ones. Secure, private, and simple digital succession planning.',
  keywords: [
    'digital will',
    'legacy',
    'succession',
    'beneficiary',
    'estate planning',
    'digital assets',
    'afterlife',
  ],
  authors: [{ name: 'Afterlife', url: 'https://afterlife.app' }],
  creator: 'Afterlife',
  publisher: 'Afterlife',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Afterlife',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://afterlife.app',
    siteName: 'Afterlife',
    title: 'Afterlife - Your Friend for Life and Beyond',
    description:
      'Create your digital legacy, manage your will, and leave messages for your loved ones.',
    images: [
      {
        url: 'https://afterlife.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Afterlife - Digital Legacy Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afterlife - Your Friend for Life and Beyond',
    description:
      'Create your digital legacy, manage your will, and leave messages for your loved ones.',
    creator: '@AfterlifeApp',
    images: ['https://afterlife.app/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://afterlife.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Afterlife" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2D2D7F" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#2D2D7F" />
        <script
          async
          src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.17/pwacompat.min.js"
        />
      </head>
      <body className="font-inter antialiased bg-gray-50 dark:bg-[#1A1A2E] text-gray-900 dark:text-gray-100">
        <div id="root" className="min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster
          position="top-center"
          richColors
          closeButton
          expand
          theme="system"
        />
      </body>
    </html>
  );
}
