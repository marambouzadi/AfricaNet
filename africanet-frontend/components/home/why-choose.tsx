import { BadgeCheck, PhoneCall, PiggyBank, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Produits vérifiés',
    description:
      'Chaque appareil est testé et inspecté par nos techniciens avant mise en vente.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantie incluse',
    description:
      '3 mois de garantie AfricaNet sur tous nos produits reconditionnés et d\u2019occasion.',
  },
  {
    icon: PiggyBank,
    title: 'Meilleur prix reprise',
    description:
      'Obtenez une estimation en ligne et vendez votre PC au meilleur prix du marché.',
  },
  {
    icon: PhoneCall,
    title: 'Support local',
    description:
      'Notre équipe est disponible pour vous accompagner avant et après votre achat.',
  },
]

export function WhyChoose() {
  return (
    <section id="a-propos" className="bg-[#F5F5F3] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          Pourquoi choisir AfricaNet ?
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8EDF8]">
                <feature.icon className="h-5 w-5 text-[#1A3FA0]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-[#1A1A1A]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
