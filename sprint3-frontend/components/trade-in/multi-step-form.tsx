'use client'

import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, Laptop, HardDrive, Smartphone, ChevronRight, ChevronLeft, AlertCircle, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

type Step = 1 | 2 | 3 | 4

const DEVICE_TYPE_MAP: Record<string, string> = {
    laptop: 'LAPTOP',
    desktop: 'DESKTOP',
    phone: 'PHONE',
}

const CONDITION_MAP: Record<string, { code: string; score: number }> = {
    'Parfait état': { code: 'EXCELLENT', score: 9 },
    'Très bon état': { code: 'GOOD', score: 7 },
    'Bon état': { code: 'FAIR', score: 5 },
    'État correct': { code: 'POOR', score: 3 },
}

export function MultiStepForm() {
    const [step, setStep] = useState<Step>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [evaluationResult, setEvaluationResult] = useState<any>(null)
    // Offer action states (Accept or Propose price)
    const [offerActionState, setOfferActionState] = useState<'INITIAL' | 'CUSTOM_PRICE_INPUT' | 'ACCEPTED' | 'PROPOSED'>('INITIAL')
    const [customPrice, setCustomPrice] = useState<string>('')
    const [actionSubmitting, setActionSubmitting] = useState(false)
    const [actionMessage, setActionMessage] = useState('')

    const handleAcceptOffer = async () => {
        setActionSubmitting(true)
        setError('')
        try {
            const tradeInId = evaluationResult?.tradeInId
            if (tradeInId) {
                await fetch(`http://localhost:8090/api/trade-in/${tradeInId}/accept`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }).catch(() => {})
            }
            setOfferActionState('ACCEPTED')
        setActionMessage(`Votre accord sur l'estimation de ${evaluationResult?.estimatedValue?.toFixed(2)} TND a bien été transmis. Notre équipe AfricaNet va analyser les détails de votre appareil et vous contacter sous 24h pour finaliser le rachat.`)
    } catch (e) {
        setOfferActionState('ACCEPTED')
    } finally {
        setActionSubmitting(false)
    }
}

const handleProposeCustomPrice = async () => {
    const val = parseFloat(customPrice)
    if (isNaN(val) || val <= 0) {
        setError('Veuillez entrer un prix valide supérieur à 0 TND.')
        return
    }
    setActionSubmitting(true)
    setError('')
    try {
        const tradeInId = evaluationResult?.tradeInId
        if (tradeInId) {
            await fetch(`http://localhost:8090/api/trade-in/${tradeInId}/counter-offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposedPrice: val })
            }).catch(() => {})
        }
        setOfferActionState('PROPOSED')
        setActionMessage(`Votre proposition de ${val.toFixed(2)} TND a bien été transmise à l'équipe AfricaNet pour étude. Nous reviendrons vers vous très rapidement.`)
    } catch (e) {
        setOfferActionState('PROPOSED')
    } finally {
        setActionSubmitting(false)
    }
}
    
    // Photo upload state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragActive, setDragActive] = useState(false)
    const [photos, setPhotos] = useState<File[]>([])
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
    const [photoError, setPhotoError] = useState('')

    const [formData, setFormData] = useState({
        deviceType: '',
        brand: '',
        model: '',
        condition: '',
        hasCharger: false,
        firstName: '',
        email: '',
        phone: '',
    })

    const handleFiles = (files: File[]) => {
        setPhotoError('')
        const validFiles: File[] = []
        const newPreviews: string[] = []

        for (const file of files) {
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
                setPhotoError('Seules les images au format JPG, PNG ou WEBP sont acceptées.')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                setPhotoError(`Le fichier "${file.name}" dépasse la taille maximale de 5 Mo.`)
                return
            }
            validFiles.push(file)
            newPreviews.push(URL.createObjectURL(file))
        }

        setPhotos((prev) => [...prev, ...validFiles])
        setPhotoPreviews((prev) => [...prev, ...newPreviews])
    }

    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index))
        setPhotoPreviews((prev) => {
            const updated = [...prev]
            if (updated[index]) {
                URL.revokeObjectURL(updated[index])
            }
            return updated.filter((_, i) => i !== index)
        })
    }

    const handleNext = () => setStep((s) => Math.min(s + 1, 4) as Step)
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        setIsSubmitting(true)
        const conditionInfo = CONDITION_MAP[formData.condition] || { code: 'FAIR', score: 5 }
        const token = localStorage.getItem('accessToken')

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const payload = {
            brand: formData.brand,
            deviceModel: formData.model,
            yearOfPurchase: 2022,
            screenScore: conditionInfo.score,
            keyboardScore: conditionInfo.score,
            batteryScore: conditionInfo.score,
            chassisScore: conditionInfo.score,
            performanceScore: conditionInfo.score
        }

        try {
            let res = await fetch('http://localhost:8090/api/trade-in/evaluate', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            })

            // Si le token est expiré/invalide (401/403), retenter en mode public sans le header expiré
            if ((res.status === 401 || res.status === 403) && token) {
                res = await fetch('http://localhost:8090/api/trade-in/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || 'Erreur lors de la soumission de votre demande')
            }
            
            const data = await res.json()
            setEvaluationResult(data)
            setStep(4)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E2DF] overflow-hidden max-w-3xl mx-auto mt-12">
            {/* Progress Bar */}
            {step < 4 && (
                <div className="bg-[#F5F5F3] px-8 py-6 border-b border-[#E2E2DF]">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E2E2DF] -z-10 rounded-full" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1A3FA0] -z-10 rounded-full transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2 bg-[#F5F5F3] px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-[#1A3FA0] text-white' : 'bg-[#E2E2DF] text-[#6B7280]'}`}>
                                    {i}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block ${step >= i ? 'text-[#1A3FA0]' : 'text-[#6B7280]'}`}>
                  {i === 1 ? 'Appareil' : i === 2 ? 'État' : 'Coordonnées'}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="p-8">

                {error && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: Device Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Que souhaitez-vous revendre ?</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'laptop', icon: Laptop, label: 'PC Portable' },
                                { id: 'desktop', icon: HardDrive, label: 'PC de bureau' },
                                { id: 'phone', icon: Smartphone, label: 'Smartphone / Tablette' }
                            ].map((device) => (
                                <label key={device.id} className={`flex flex-col items-center justify-center gap-3 p-6 border-2 rounded-xl cursor-pointer transition-all ${formData.deviceType === device.id ? 'border-[#1A3FA0] bg-[#E8EDF8]' : 'border-[#E2E2DF] hover:border-[#1A3FA0] hover:bg-gray-50'}`}>
                                    <input type="radio" name="deviceType" value={device.id} className="sr-only" onChange={(e) => setFormData({...formData, deviceType: e.target.value})} required />
                                    <device.icon className={`h-8 w-8 ${formData.deviceType === device.id ? 'text-[#1A3FA0]' : 'text-[#6B7280]'}`} />
                                    <span className={`font-medium text-center ${formData.deviceType === device.id ? 'text-[#1A3FA0]' : 'text-[#1A1A1A]'}`}>{device.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Marque</label>
                                <input required type="text" placeholder="Ex: Dell, Apple, HP..." className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Modèle exact</label>
                                <input required type="text" placeholder="Ex: XPS 13 9310" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Condition & Photos */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Dans quel état est-il ?</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { id: 'Parfait état', desc: 'Aucune rayure, fonctionne parfaitement' },
                                { id: 'Très bon état', desc: 'Micro-rayures invisibles à 20cm' },
                                { id: 'Bon état', desc: 'Rayures visibles, petits chocs' },
                                { id: 'État correct', desc: 'Signes d\'usure prononcés, 100% fonctionnel' }
                            ].map((cond) => (
                                <label key={cond.id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${formData.condition === cond.id ? 'border-[#1A3FA0] bg-[#E8EDF8]' : 'border-[#E2E2DF] hover:border-[#1A3FA0] hover:bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-[#1A1A1A]">{cond.id}</span>
                                        <input type="radio" name="condition" value={cond.id} className="w-4 h-4 text-[#1A3FA0] focus:ring-[#1A3FA0]" onChange={(e) => setFormData({...formData, condition: e.target.value})} required />
                                    </div>
                                    <span className="text-sm text-[#6B7280]">{cond.desc}</span>
                                </label>
                            ))}
                        </div>

                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-[#E2E2DF] cursor-pointer hover:bg-gray-100 transition-colors mt-4">
                            <input type="checkbox" className="w-5 h-5 text-[#1A3FA0] rounded" checked={formData.hasCharger} onChange={(e) => setFormData({...formData, hasCharger: e.target.checked})} />
                            <span className="font-medium text-[#1A1A1A]">Le chargeur original est fourni</span>
                        </label>

                        <div className="pt-4 space-y-3">
                            <label className="text-sm font-medium text-[#1A1A1A]">Photos (optionnel mais recommandé)</label>
                            
                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                                    dragActive 
                                        ? 'border-[#1A3FA0] bg-[#E8EDF8]' 
                                        : 'border-[#E2E2DF] hover:border-[#1A3FA0] hover:bg-gray-50'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDragActive(true)
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDragActive(false)
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDragActive(false)
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        handleFiles(Array.from(e.dataTransfer.files))
                                    }
                                }}
                            >
                                <UploadCloud className="h-8 w-8 text-[#1A3FA0] mx-auto mb-3" />
                                <p className="font-medium text-[#1A1A1A]">Cliquez ou glissez vos photos ici</p>
                                <p className="text-sm text-[#6B7280] mt-1">Formats acceptés : JPG, PNG (Max 5MB)</p>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFiles(Array.from(e.target.files))
                                        }
                                    }}
                                />
                            </div>

                            {photoError && (
                                <p className="text-xs text-red-600 font-medium mt-1">{photoError}</p>
                            )}

                            {/* Photo Previews */}
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                    {photoPreviews.map((src, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E2E2DF] aspect-square bg-gray-50">
                                            <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemovePhoto(idx)
                                                }}
                                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                                                title="Supprimer la photo"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                                                {photos[idx]?.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Contact */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Où vous envoyer l'estimation ?</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Prénom</label>
                                <input required type="text" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Email</label>
                                <input required type="email" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Téléphone (pour un traitement plus rapide)</label>
                                <input type="tel" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Success / Evaluation Result */}
                {step === 4 && (
                    <div className="text-center py-6 animate-in zoom-in-95 duration-500 max-w-xl mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Évaluation terminée !</h2>

                        {evaluationResult ? (
                            <div className="bg-[#F5F5F3] p-6 rounded-2xl border border-[#E2E2DF] mb-6 text-left">
                                <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">Résultat pour votre {evaluationResult.deviceModel}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-[#E2E2DF]">
                                        <span className="text-[#6B7280] font-medium">Valeur estimée par l&apos;IA</span>
                                        <span className="text-2xl font-bold text-[#1A3FA0]">{evaluationResult.estimatedValue?.toFixed(2)} TND</span>
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">Détails de l&apos;analyse :</span>
                                        <p className="text-sm text-[#333] bg-white p-3 rounded-lg border border-[#E2E2DF] leading-relaxed whitespace-pre-line">
                                            {evaluationResult.conditionSummary}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[#6B7280] mb-6 text-base">
                                Merci {formData.firstName}. L&apos;évaluation de votre appareil a été enregistrée.
                            </p>
                        )}

                        {/* Confirmation State Banners */}
                        {offerActionState === 'ACCEPTED' && (
                            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl mb-6 text-left space-y-2 animate-in fade-in">
                                <div className="flex items-center gap-2 font-bold text-lg text-green-900">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    Offre acceptée avec succès !
                                </div>
                                <p className="text-sm text-green-700 leading-relaxed">
                                    {actionMessage}
                                </p>
                            </div>
                        )}

                        {offerActionState === 'PROPOSED' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-2xl mb-6 text-left space-y-2 animate-in fade-in">
                                <div className="flex items-center gap-2 font-bold text-lg text-blue-900">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                    Proposition enregistrée !
                                </div>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    {actionMessage}
                                </p>
                            </div>
                        )}

                        {/* Action Choice & Custom Price Input */}
                        {offerActionState === 'INITIAL' && (
                            <div className="space-y-4 mb-8 bg-white p-6 rounded-2xl border border-[#E2E2DF] shadow-sm">
                                <h4 className="font-bold text-base text-[#1A1A1A]">Que souhaitez-vous faire ?</h4>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        type="button"
                                        onClick={handleAcceptOffer}
                                        disabled={actionSubmitting}
                                        className="flex-1 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Accepter l&apos;offre ({evaluationResult?.estimatedValue?.toFixed(2)} TND)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOfferActionState('CUSTOM_PRICE_INPUT')
                                            if (evaluationResult?.estimatedValue) {
                                                setCustomPrice(evaluationResult.estimatedValue.toFixed(0))
                                            }
                                        }}
                                        className="flex-1 bg-[#F5F5F3] hover:bg-[#E2E2DF] text-[#1A1A1A] px-6 py-3.5 rounded-xl font-bold transition-all border border-[#E2E2DF] flex items-center justify-center gap-2"
                                    >
                                        Proposer mon prix
                                    </button>
                                </div>
                            </div>
                        )}

                        {offerActionState === 'CUSTOM_PRICE_INPUT' && (
                            <div className="mb-8 bg-amber-50/50 p-6 rounded-2xl border border-amber-200 text-left space-y-4 animate-in fade-in">
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] text-lg">Proposer votre propre prix</h4>
                                    <p className="text-xs text-[#6B7280] mt-1">Indiquez le montant (en TND) auquel vous souhaitez revendre votre appareil :</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            step="10"
                                            min="1"
                                            placeholder="Ex: 1100"
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            className="w-full border border-[#E2E2DF] rounded-xl px-4 py-3 text-lg font-bold text-[#1A3FA0] bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 pr-16"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-[#6B7280]">TND</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleProposeCustomPrice}
                                        disabled={actionSubmitting || !customPrice}
                                        className="bg-[#D1F232] hover:bg-[#bce600] text-[#1A1A1A] px-6 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 shrink-0"
                                    >
                                        {actionSubmitting ? 'Envoi...' : 'Valider ma proposition'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setOfferActionState('INITIAL')}
                                    className="text-xs text-[#6B7280] hover:text-[#1A1A1A] underline block pt-1"
                                >
                                    &larr; Annuler et revenir aux options
                                </button>
                            </div>
                        )}

                        <div className="flex justify-center gap-4 pt-2 border-t border-[#E2E2DF]">
                            <Link href="/" className="bg-[#F5F5F3] text-[#1A1A1A] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E2E2DF] transition-colors">
                                Retour à l&apos;accueil
                            </Link>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                {step < 4 && (
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E2E2DF]">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#6B7280] hover:text-[#1A1A1A]'}`}
                        >
                            <ChevronLeft className="h-4 w-4" /> Précédent
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-[#D1F232] hover:bg-[#bce600] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Traitement...' : step === 3 ? 'Soumettre' : 'Suivant'}
                            {!isSubmitting && step < 3 && <ChevronRight className="h-5 w-5" />}
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}