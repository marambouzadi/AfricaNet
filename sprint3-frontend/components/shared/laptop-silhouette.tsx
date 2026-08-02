export function LaptopSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="22" y="12" width="76" height="48" rx="4" />
      <path d="M10 68 L110 68" />
      <path d="M14 60 L106 60 L110 68 L10 68 Z" />
    </svg>
  )
}
