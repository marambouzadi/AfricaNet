'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { useUser } from '@/lib/user-context'
import { useEffect } from 'react'
import { getUserAddresses, createAddress } from '@/lib/api'
import { AddressForm, AddressFormData } from '@/components/shared/address-form'

type CheckoutStep = 'shipping' | 'payment' | 'success'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, isLoaded } = useCart()
  const { user, isLoading: isUserLoading } = useUser()
  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)

  // Address Selection State
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [isCreatingAddress, setIsCreatingAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'delivery'>('card')
  const shippingFee = totalPrice >= 200 ? 0 : 7
  const finalTotal = totalPrice + shippingFee

  useEffect(() => {
    if (user) {
      getUserAddresses()
        .then((data: any) => {
          const fetchedAddresses = Array.isArray(data) ? data : data.content || []
          setAddresses(fetchedAddresses)
          if (fetchedAddresses.length > 0) {
            const defaultAddr = fetchedAddresses.find((a: any) => a.isDefault) || fetchedAddresses[0]
            setSelectedAddressId(defaultAddr.id)
          } else {
            setIsCreatingAddress(true)
          }
        })
        .catch(console.error)
        .finally(() => setLoadingAddresses(false))
    }
  }, [user])

  if (!isLoaded) return null

  // If cart is empty and not on success page, redirect to cart
  if (items.length === 0 && step !== 'success') {
    router.push('/panier')
    return null
  }

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/connexion?redirect=/checkout')
    }
    return null
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAddressId) {
      alert("Veuillez sélectionner ou ajouter une adresse de livraison.")
      return
    }
    setStep('payment')
  }

  const handleAddNewAddress = async (data: AddressFormData) => {
    try {
      const newAddress = await createAddress(data)
      setAddresses(prev => [...prev, newAddress])
      setSelectedAddressId(newAddress.id)
      setIsCreatingAddress(false)
    } catch (err: any) {
      throw err
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const token = localStorage.getItem('accessToken')

    try {
      // 1. Créer la commande backend
      const selectedAddress = addresses.find(a => a.id === selectedAddressId)
      if (!selectedAddress) throw new Error("Adresse introuvable")

      const orderPayload = {
        items: items.map(item => ({
          productId: Number(item.id),
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: selectedAddress.fullname,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state || selectedAddress.city,
          postalCode: selectedAddress.postalCode || '1000',
          country: selectedAddress.country || 'Tunisie',
          phone: selectedAddress.phone || user.phone || '00000000'
        },
        paymentMethod: paymentMethod === 'card' ? 'CARD' : 'CASH_ON_DELIVERY',
        customerNotes: ''
      }

      const orderRes = await fetch('http://localhost:8090/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}))
        throw new Error(errorData.message || 'Impossible de créer la commande')
      }

      const orderData = await orderRes.json()

      // 2. Si carte bancaire / Flouci -> Initier paiement Flouci
      if (paymentMethod === 'card') {
        const flouciRes = await fetch(`http://localhost:8090/api/payments/flouci/initiate?orderId=${orderData.id}`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        if (!flouciRes.ok) {
          throw new Error('Erreur d\'initialisation du paiement Flouci')
        }

        const flouciData = await flouciRes.json()
        clearCart()

        // Redirection vers le portail de paiement Flouci
        if (flouciData.paymentLink) {
          window.location.href = flouciData.paymentLink
          return
        }
      }

      // 3. Si paiement à la livraison
      clearCart()
      setStep('success')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue lors du paiement.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/panier" className="inline-flex items-center text-sm text-[#6B7280] hover:text-[#1A3FA0] mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au panier
            </Link>
            <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Paiement sécurisé</h1>
          </div>

          {step === 'success' ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#E2E2DF] max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">Commande confirmée !</h2>
              <p className="text-[#6B7280] mb-8 text-lg">
                Merci pour votre achat. Votre numéro de commande est le <span className="font-bold text-[#1A1A1A]">#AN-{Math.floor(100000 + Math.random() * 900000)}</span>.<br/>
                Un e-mail de confirmation a été envoyé à votre adresse.
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Suivre ma commande
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
              {/* Left Column: Forms */}
              <div className="space-y-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E2E2DF] -z-10 rounded-full" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1A3FA0] -z-10 rounded-full transition-all duration-300" style={{ width: step === 'payment' ? '100%' : '50%' }} />
                  
                  <div className="flex flex-col items-center gap-2 bg-[#F5F5F3] px-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A3FA0] text-white flex items-center justify-center font-bold">1</div>
                    <span className="text-sm font-medium text-[#1A3FA0]">Livraison</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 bg-[#F5F5F3] px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step === 'payment' ? 'bg-[#1A3FA0] text-white' : 'bg-[#E2E2DF] text-[#6B7280]'}`}>2</div>
                    <span className={`text-sm font-medium transition-colors ${step === 'payment' ? 'text-[#1A3FA0]' : 'text-[#6B7280]'}`}>Paiement</span>
                  </div>
                </div>

                {/* Step 1: Shipping */}
                {step === 'shipping' && (
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
                    <div className="p-6 border-b border-[#E2E2DF] bg-gray-50 flex items-center gap-3">
                      <Truck className="h-5 w-5 text-[#1A3FA0]" />
                      <h2 className="text-xl font-bold text-[#1A1A1A]">Informations de livraison</h2>
                    </div>
                    <div className="p-6">
                      {loadingAddresses ? (
                        <div className="text-center text-[#6B7280]">Chargement de vos adresses...</div>
                      ) : (
                        <div className="space-y-6">
                          {!isCreatingAddress && addresses.length > 0 && (
                            <div className="space-y-4">
                              {addresses.map(addr => (
                                <label 
                                  key={addr.id}
                                  className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[#1A3FA0] bg-[#1A3FA0]/5' : 'border-[#E2E2DF] hover:border-[#1A3FA0]/50'}`}
                                >
                                  <input 
                                    type="radio" 
                                    name="address" 
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="mt-1 w-4 h-4 text-[#1A3FA0] focus:ring-[#1A3FA0]" 
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-[#1A1A1A]">{addr.label || 'Adresse'}</span>
                                      {addr.isDefault && <span className="text-[10px] uppercase font-bold bg-[#D1F232] text-[#1A1A1A] px-2 py-0.5 rounded-full">Défaut</span>}
                                    </div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{addr.fullname}</p>
                                    <p className="text-sm text-[#6B7280] mt-1">{addr.street}</p>
                                    <p className="text-sm text-[#6B7280]">{addr.city}, {addr.postalCode}</p>
                                  </div>
                                </label>
                              ))}
                              
                              <button 
                                type="button"
                                onClick={() => setIsCreatingAddress(true)}
                                className="text-sm font-medium text-[#1A3FA0] hover:underline"
                              >
                                + Ajouter une nouvelle adresse
                              </button>

                              <div className="pt-4 border-t border-[#E2E2DF]">
                                <button onClick={handleShippingSubmit} className="w-full bg-[#1A3FA0] text-white py-3 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
                                  Continuer vers le paiement
                                </button>
                              </div>
                            </div>
                          )}

                          {isCreatingAddress && (
                            <div className="bg-[#F5F5F3] p-6 rounded-2xl border border-[#E2E2DF]">
                              <h3 className="font-bold text-[#1A1A1A] mb-4">Nouvelle adresse de livraison</h3>
                              <AddressForm 
                                onSubmit={handleAddNewAddress}
                                onCancel={() => addresses.length > 0 ? setIsCreatingAddress(false) : null}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 'payment' && (
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
                    <div className="p-6 border-b border-[#E2E2DF] bg-gray-50 flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-[#1A3FA0]" />
                      <h2 className="text-xl font-bold text-[#1A1A1A]">Méthode de paiement</h2>
                    </div>
                    <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                      
                      {/* Payment Methods */}
                      <div className="space-y-3">
                        <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#1A3FA0] bg-[#E8EDF8]' : 'border-[#E2E2DF] hover:border-[#1A3FA0]'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-[#1A3FA0] focus:ring-[#1A3FA0]" />
                            <span className="font-medium text-[#1A1A1A]">Carte Bancaire / Flouci</span>
                          </div>
                          <CreditCard className="h-6 w-6 text-[#6B7280]" />
                        </label>
                        
                        <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'delivery' ? 'border-[#1A3FA0] bg-[#E8EDF8]' : 'border-[#E2E2DF] hover:border-[#1A3FA0]'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="payment" value="delivery" checked={paymentMethod === 'delivery'} onChange={() => setPaymentMethod('delivery')} className="w-5 h-5 text-[#1A3FA0] focus:ring-[#1A3FA0]" />
                            <span className="font-medium text-[#1A1A1A]">Paiement à la livraison</span>
                          </div>
                          <Truck className="h-6 w-6 text-[#6B7280]" />
                        </label>
                      </div>

                      {/* Card Details (mock) */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-4 pt-4 border-t border-[#E2E2DF]">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#1A1A1A]">Numéro de carte</label>
                            <input required type="text" placeholder="0000 0000 0000 0000" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#1A1A1A]">Date d'expiration</label>
                              <input required type="text" placeholder="MM/YY" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[#1A1A1A]">CVC</label>
                              <input required type="text" placeholder="123" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setStep('shipping')} className="px-6 py-3 border border-[#E2E2DF] text-[#1A1A1A] rounded-lg font-medium hover:bg-gray-50 transition-colors">
                          Retour
                        </button>
                        <button type="submit" disabled={isProcessing} className="flex-1 bg-[#D1F232] text-[#1A1A1A] py-3 rounded-lg font-bold hover:bg-[#bce600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                          {isProcessing ? 'Traitement en cours...' : `Payer ${formatPrice(finalTotal)}`}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary */}
              <div className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm border border-[#E2E2DF] h-fit sticky top-24">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Résumé de la commande</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-[#F5F5F3] rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                        <Image src={item.image || '/products/laptop-gray.png'} alt={item.name} fill className="object-contain p-1" />
                        <span className="absolute -top-2 -right-2 bg-[#1A3FA0] text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold z-10">{item.quantity}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-sm font-bold text-[#1A1A1A] mt-1">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-[#E2E2DF] pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Frais de livraison</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-bold' : ''}>
                      {shippingFee === 0 ? 'Gratuit' : '7 TND'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-[#E2E2DF] pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1A1A1A]">Total à payer</span>
                    <span className="text-2xl font-bold text-[#1A3FA0]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm text-[#1A1A1A]">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1A1A1A]">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Garantie AfricaNet incluse</span>
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
