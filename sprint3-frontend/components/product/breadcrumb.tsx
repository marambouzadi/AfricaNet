import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function ProductBreadcrumb({ productName }: { productName: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className="bg-[#F5F5F3]">
      <ol className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-4 text-sm">
        <li>
          <Link href="/" className="text-[#6B7280] transition-colors hover:text-[#1A3FA0]">
            Accueil
          </Link>
        </li>
        <ChevronRight className="size-4 text-[#6B7280]" aria-hidden="true" />
        <li>
          <Link href="/catalogue" className="text-[#6B7280] transition-colors hover:text-[#1A3FA0]">
            Catalogue
          </Link>
        </li>
        <ChevronRight className="size-4 text-[#6B7280]" aria-hidden="true" />
        <li className="font-medium text-[#1A1A1A] truncate max-w-[200px]" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  )
}
