import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commander',
  description: 'Finalisez votre commande sur AfricaNet — livraison rapide et paiement sécurisé.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
