import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte AfricaNet en quelques secondes pour profiter de nos offres sur les PC portables neufs, reconditionnés et d\'occasion.',
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children
}
