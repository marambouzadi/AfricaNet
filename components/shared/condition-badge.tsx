import { type Condition, conditionStyles } from '@/lib/products'

export function ConditionBadge({
  condition,
  className = '',
}: {
  condition: Condition
  className?: string
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${conditionStyles[condition]} ${className}`}
    >
      {condition}
    </span>
  )
}
