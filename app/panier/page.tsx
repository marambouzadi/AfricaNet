'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, isLoaded } = useCart()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#6B7280]">Chargement du panier...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-[#1A3FA0]" />
            Votre Panier
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#E2E2DF]">
              <div className="w-24 h-24 bg-[#F5F5F3] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-[#6B7280]" />
              </div>
              <h2 className="text-2xl font-medium text-[#1A1A1A] mb-4">Votre panier est vide</h2>
              <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                Découvrez notre catalogue d'équipements informatiques et trouvez le PC parfait pour vos besoins.
              </p>
              <Link 
                href="/catalogue"
                className="inline-flex items-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Découvrir nos produits
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#E2E2DF] flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#F5F5F3] rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                      {item.image && item.image !== '/products/laptop-gray.png' ? (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <LaptopSilhouette className="h-12 w-auto text-[#1A3FA0]/25" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
                        <h3 className="text-lg font-medium text-[#1A1A1A] truncate pr-4">{item.name}</h3>
                        <span className="font-bold text-[#1A1A1A] text-lg whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                      
                      {item.condition && (
                        <span className="inline-block bg-[#E8EDF8] text-[#1A3FA0] text-xs px-2 py-1 rounded mb-4">
                          {item.condition}
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#E2E2DF] rounded-lg overflow-hidden bg-[#F5F5F3]">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-medium text-[#1A1A1A] bg-white h-10 flex items-center justify-center border-x border-[#E2E2DF]">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#6B7280] hover:bg-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-[#EF4444] hover:text-[#DC2626] text-sm font-medium transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E2DF] h-fit sticky top-24">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Résumé de la commande</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Frais de livraison</span>
                    <span>Calculés à l'étape suivante</span>
                  </div>
                </div>

                <div className="mb-6 pt-4 border-t border-[#E2E2DF]">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Code promo</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Entrez votre code" className="flex-1 bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0]" />
                    <button type="button" className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors">Appliquer</button>
                  </div>
                </div>
                
                <div className="border-t border-[#E2E2DF] pt-4 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1A1A1A]">Total estimé</span>
                    <span className="text-2xl font-bold text-[#1A3FA0]">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] text-right">Taxes incluses</p>
                </div>
                
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#D1F232] hover:bg-[#bce600] text-[#1A1A1A] py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  Passer à la caisse
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <div className="mt-6 flex items-center justify-center gap-4 text-[#6B7280] text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    <span>Garantie 3 mois</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
