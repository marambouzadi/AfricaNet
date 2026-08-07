import type { Metadata, Viewport } from 'next'
import { Inter, Lora } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { UserProvider } from '@/lib/user-context'
import { CartNotification } from '@/components/shared/cart-notification'
import { Chatbot } from '@/components/shared/chatbot'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const SITE_URL = 'https://africanet.tn'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AfricaNet — Votre partenaire informatique de confiance',
    template: '%s | AfricaNet',
  },
  description:
    "AfricaNet vous propose une sélection rigoureuse d'ordinateurs portables neufs, reconditionnés et d'occasion avec garantie, service de reprise et assistance technique en Tunisie.",
  keywords: [
    'ordinateur portable', 'PC portable', 'laptop', 'Tunisie',
    'reconditionné', 'occasion', 'neuf', 'AfricaNet',
    'reprise informatique', 'achat PC', 'vente PC',
  ],
  authors: [{ name: 'AfricaNet', url: SITE_URL }],
  creator: 'AfricaNet',
  icons: {
    icon: '/africanet-logo.jpg',
    apple: '/africanet-logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: SITE_URL,
    siteName: 'AfricaNet',
    title: 'AfricaNet — Votre partenaire informatique de confiance',
    description:
      "Sélection rigoureuse d'ordinateurs portables neufs, reconditionnés et d'occasion avec garantie en Tunisie.",
    images: [
      {
        url: '/africanet-logo.jpg',
        width: 800,
        height: 600,
        alt: 'AfricaNet — PC portables en Tunisie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AfricaNet — Votre partenaire informatique de confiance',
    description:
      "PC portables neufs, reconditionnés et d'occasion avec garantie en Tunisie.",
    images: ['/africanet-logo.jpg'],
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
}

export const viewport: Viewport = {
  themeColor: '#1A3FA0',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${lora.variable}`}>
      <head>
        <link rel="dns-prefetch" href="//localhost:8090" />
        <link rel="preconnect" href="http://localhost:8090" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-[#F5F5F3] font-sans">
        <UserProvider>
          <CartProvider>
            {children}
            <CartNotification />
            <Chatbot />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}

