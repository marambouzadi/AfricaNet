import type { Metadata, Viewport } from 'next'
import { Inter, Lora } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { CartNotification } from '@/components/shared/cart-notification'
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

export const metadata: Metadata = {
  title: 'AfricaNet — Votre partenaire informatique de confiance',
  description:
    "AfricaNet vous propose une sélection rigoureuse d'ordinateurs portables neufs, reconditionnés et d'occasion avec garantie, service de reprise et assistance technique en Tunisie.",
  icons: {
    icon: '/africanet-logo.jpg',
    apple: '/africanet-logo.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#1A3FA0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased bg-[#F5F5F3] font-sans">
        <CartProvider>
          {children}
          <CartNotification />
        </CartProvider>
      </body>
    </html>
  )
}
