import { ShoppingBag, Tag, Wrench } from 'lucide-react'

const ITEMS = [
  {
    icon: ShoppingBag,
    title: 'Achat',
    description: 'Large sélection de PC neufs, reconditionnés et d\u2019occasion',
  },
  {
    icon: Tag,
    title: 'Vente',
    description: 'Vendez votre ancien PC — estimation gratuite en ligne',
  },
  {
    icon: Wrench,
    title: 'Reprise',
    description: 'Service de reprise avec évaluation par nos experts',
  },
]

export function ValueProps() {
  return (
    <section className="bg-[#1A3FA0] py-12 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3 md:gap-0">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={`flex flex-col items-center px-6 text-center ${
              i < ITEMS.length - 1 ? 'md:border-r md:border-white/20' : ''
            }`}
          >
            <item.icon className="h-8 w-8" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-lg font-bold">{item.title}</h3>
            <p className="mt-1 max-w-xs text-sm text-white/80">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
