'use client'

import { useCart } from '@/lib/cart-context'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CartNotification() {
  const { notification, clearNotification } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [notification])

  if (!notification) return null

  return (
    <div
      className={`fixed top-20 right-4 z-[100] flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg border border-[#E2E2DF] transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A8A4A]/10">
        <Check className="h-4 w-4 text-[#1A8A4A]" />
      </div>
      <p className="text-sm font-medium text-[#1A1A1A]">{notification}</p>
      <button
        type="button"
        onClick={clearNotification}
        className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
