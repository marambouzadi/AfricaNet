'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { CartSidebar } from '@/components/cart/cart-sidebar'

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  condition?: string
}

type CartContextType = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  notification: string | null
  clearNotification: () => void
  isLoaded: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('africanet_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('africanet_cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const clearNotification = useCallback(() => setNotification(null), [])
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
    setNotification(`${item.name} ajouté au panier`)
    setIsCartOpen(true)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        notification,
        clearNotification,
        isLoaded,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      <CartSidebar />
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
