import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte AfricaNet pour accéder à vos commandes, vos reprises et votre espace personnel.',
}

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children
}
