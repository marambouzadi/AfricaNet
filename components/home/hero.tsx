import Link from 'next/link'
import { ConditionBadge } from '@/components/shared/condition-badge'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'

export function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[520px] max-w-7xl flex-col items-center gap-12 px-4 py-14 lg:flex-row lg:gap-16 lg:py-20">
        <div className="w-full lg:w-1/2">
          <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight text-[#1A1A1A] sm:text-5xl">
            Trouvez votre PC idéal — neuf, reconditionné ou d&apos;occasion.
          </h1>

          <p className="mt-4 max-w-md text-pretty text-lg text-[#6B7280]">
            AfricaNet vous propose une sélection rigoureuse d&apos;ordinateurs
            portables avec garantie, service de reprise, et assistance technique.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/catalogue"
              className="rounded-lg bg-[#1A3FA0] px-6 py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0D2660]"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/reprise"
              className="rounded-lg border border-[#1A3FA0] px-6 py-3 text-center text-sm font-medium text-[#1A3FA0] transition-colors duration-200 hover:bg-[#E8EDF8]"
            >
              Vendre mon PC
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#6B7280]">
            ✓ Garantie 3 mois&nbsp;&nbsp;·&nbsp;&nbsp;✓ Testé par nos techniciens&nbsp;&nbsp;·&nbsp;&nbsp;✓ Reprise possible
          </p>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[#E8EDF8] p-10">
            <LaptopSilhouette className="h-40 w-auto text-[#1A3FA0]/40" />
            <Link
              href="/produit/1"
              className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
            >
              <div className="mb-1.5">
                <ConditionBadge condition="Reconditionné" />
              </div>
              <p className="font-serif text-sm font-semibold text-[#1A1A1A]">
                HP EliteBook 840 G8
              </p>
              <p className="text-base font-bold text-[#1A3FA0]">1 250 TND</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
