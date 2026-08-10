'use client'

import { useCart } from '@/lib/cart-context'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSidebar() {
  const { isCartOpen, closeCart, items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E2DF]">
          <h2 className="text-xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Mon Panier ({totalItems})
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 text-[#6B7280] hover:bg-[#F5F5F3] rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6B7280] gap-4">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p>Votre panier est vide</p>
              <button 
                onClick={closeCart}
                className="mt-4 px-6 py-2 bg-[#F5F5F3] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#E2E2DF] transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-[#E2E2DF] pb-4">
                  <div className="h-20 w-20 shrink-0 bg-[#F5F5F3] rounded-lg overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#6B7280]">Pas d'image</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A] line-clamp-2 leading-snug">{item.name}</h3>
                      <p className="text-sm text-[#1A3FA0] font-bold mt-1">{item.price.toFixed(3)} TND</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 border border-[#E2E2DF] rounded hover:border-[#1A3FA0] transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border border-[#E2E2DF] rounded hover:border-[#1A3FA0] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#E2E2DF] bg-[#F5F5F3]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#6B7280] font-medium">Total</span>
              <span className="text-2xl font-bold text-[#1A3FA0]">{totalPrice.toFixed(3)} TND</span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-4 bg-[#D1F232] text-[#1A1A1A] text-center font-bold rounded-xl shadow-[0_4px_14px_rgba(209,242,50,0.39)] hover:shadow-[0_6px_20px_rgba(209,242,50,0.23)] hover:scale-[1.02] transition-all"
              >
                Passer la commande
              </Link>
              <button
                onClick={closeCart}
                className="w-full py-4 bg-white text-[#1A1A1A] text-center font-medium rounded-xl border border-[#E2E2DF] hover:bg-[#F5F5F3] transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
