'use client'

import { useState } from 'react'
import { useUser } from '@/lib/user-context'
import { UploadCloud, CheckCircle2, Laptop, HardDrive, Smartphone, ChevronRight, ChevronLeft, AlertCircle, X, Cpu, MemoryStick, HardDriveIcon, Monitor } from 'lucide-react'
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

// PC options
const RAM_OPTIONS = ['2 Go', '4 Go', '8 Go', '12 Go', '16 Go', '32 Go', '64 Go']
const STORAGE_OPTIONS = ['128 Go SSD', '256 Go SSD', '512 Go SSD', '1 To SSD', '256 Go HDD', '512 Go HDD', '1 To HDD']
const SCREEN_OPTIONS = ['11"', '12"', '13"', '13.3"', '14"', '15.6"', '16"', '17"', '17.3"']

// Phone / Tablet options
const PHONE_RAM_OPTIONS = ['2 Go', '3 Go', '4 Go', '6 Go', '8 Go', '12 Go', '16 Go']
const PHONE_STORAGE_OPTIONS = ['16 Go', '32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To']
const PHONE_SCREEN_OPTIONS = ['4.7"', '5.4"', '6.1"', '6.4"', '6.7"', '6.8"', '7"', '8"', '10"', '11"', '12"', '13"']

export function MultiStepForm() {
    const { user } = useUser()
    const [step, setStep] = useState<Step>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [evaluationResult, setEvaluationResult] = useState<any>(null)
    const [offerAccepted, setOfferAccepted] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)
    const [formData, setFormData] = useState({
        deviceType: '',
        brand: '',
        model: '',
        yearOfPurchase: new Date().getFullYear() - 2,
        condition: '',
        hasCharger: false,
        firstName: '',
        email: '',
        phone: '',
        // Caractéristiques techniques
        cpu: '',
        ram: '',
        storage: '',
        screenSize: '',
        notes: '',
    })

    const handleNext = () => setStep((s) => Math.min(s + 1, 4) as Step)
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const token = localStorage.getItem('accessToken')
        if (!token) {
            setError('Vous devez être connecté pour soumettre une demande de reprise.')
            return
        }

        setIsSubmitting(true)

        const conditionInfo = CONDITION_MAP[formData.condition] || { code: 'FAIR', score: 5 }

        // Extraire la valeur numérique de la taille d'écran (ex: "15.6\"" → 15.6)
        const screenSizeNum = formData.screenSize
            ? parseFloat(formData.screenSize.replace('"', ''))
            : null

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api'

            // Upload selected images to server
            const uploadedImageUrls: string[] = []
            if (images.length > 0) {
                for (const imgFile of images) {
                    try {
                        const fd = new FormData()
                        fd.append('file', imgFile)
                        const upRes = await fetch(`${API_URL}/upload/image`, {
                            method: 'POST',
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                            body: fd,
                        })
                        if (upRes.ok) {
                            const upData = await upRes.json()
                            if (upData.url) {
                                uploadedImageUrls.push(upData.url)
                            }
                        }
                    } catch (uploadErr) {
                        console.warn('Erreur lors de l\'upload de l\'image:', uploadErr)
                    }
                }
            }

            const res = await fetch(`/api/trade-in/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    brand: formData.brand,
                    deviceModel: formData.model,
                    yearOfPurchase: formData.yearOfPurchase,
                    screenScore: conditionInfo.score,
                    keyboardScore: conditionInfo.score,
                    batteryScore: conditionInfo.score,
                    chassisScore: conditionInfo.score,
                    performanceScore: conditionInfo.score,
                    // Caractéristiques techniques
                    cpu: formData.cpu || null,
                    ram: formData.ram || null,
                    storage: formData.storage || null,
                    screenSize: screenSizeNum,
                    deviceType: DEVICE_TYPE_MAP[formData.deviceType] || 'LAPTOP',
                    notes: formData.notes || null,
                    imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || 'Erreur lors de la soumission de votre demande')
            }
            
            const data = await res.json()
            setEvaluationResult(data)
            setOfferAccepted(false)
            setStep(4)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAcceptOffer = async () => {
        const id = evaluationResult?.tradeInId || evaluationResult?.id
        if (!id) return
        setIsAccepting(true)
        try {
            const token = localStorage.getItem('accessToken')
            const res = await fetch(`/api/trade-in/${id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (res.ok) {
                setOfferAccepted(true)
            } else {
                const errData = await res.json().catch(() => ({}))
                setError(errData.message || 'Erreur lors de l\'acceptation de l\'offre')
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setIsAccepting(false)
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

                {/* ─── Step 1: Device Info + Specs ─── */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Que souhaitez-vous revendre ?</h2>

                        {/* Type d'appareil */}
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

                        {/* Marque / Modèle / Année */}
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#1A1A1A]">Marque</label>
                                    <input required type="text" placeholder="Ex: Dell, Apple, HP..." className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#1A1A1A]">Année d'achat</label>
                                    <select required className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.yearOfPurchase} onChange={e => setFormData({...formData, yearOfPurchase: parseInt(e.target.value)})}>
                                        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Modèle exact</label>
                                <input required type="text" placeholder="Ex: XPS 13 9310" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                            </div>
                        </div>

                        {/* ── Caractéristiques techniques (optionnel) ── */}
                        <div className="border border-[#E2E2DF] rounded-xl p-5 space-y-4 bg-[#F9F9F8]">
                            <p className="text-sm font-semibold text-[#1A3FA0] flex items-center gap-2">
                                <Cpu className="h-4 w-4" />
                                Caractéristiques techniques <span className="text-[#6B7280] font-normal">(optionnel — améliore l'estimation)</span>
                            </p>

                            {formData.deviceType === 'phone' ? (
                                /* ─── Smartphone / Tablette fields ─── */
                                <>
                                    {/* Puce / SoC */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#1A1A1A] flex items-center gap-1.5">
                                            <Cpu className="h-3.5 w-3.5 text-[#6B7280]" /> Puce / SoC
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Apple A15 Bionic, Snapdragon 8 Gen 2..."
                                            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                            value={formData.cpu}
                                            onChange={e => setFormData({...formData, cpu: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* RAM */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#1A1A1A]">RAM</label>
                                            <select
                                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                value={formData.ram}
                                                onChange={e => setFormData({...formData, ram: e.target.value})}
                                            >
                                                <option value="">-- Sélectionner --</option>
                                                {PHONE_RAM_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Stockage */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#1A1A1A]">Capacité</label>
                                            <select
                                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                value={formData.storage}
                                                onChange={e => setFormData({...formData, storage: e.target.value})}
                                            >
                                                <option value="">-- Sélectionner --</option>
                                                {PHONE_STORAGE_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Taille écran */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#1A1A1A]">Taille écran</label>
                                            <select
                                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                value={formData.screenSize}
                                                onChange={e => setFormData({...formData, screenSize: e.target.value})}
                                            >
                                                <option value="">-- Sélectionner --</option>
                                                {PHONE_SCREEN_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* ─── PC Portable / PC de bureau fields ─── */
                                <>
                                    {/* CPU */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#1A1A1A] flex items-center gap-1.5">
                                            <Cpu className="h-3.5 w-3.5 text-[#6B7280]" /> Processeur (CPU)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Intel Core i5-1135G7, AMD Ryzen 5 5500U..."
                                            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                            value={formData.cpu}
                                            onChange={e => setFormData({...formData, cpu: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* RAM */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#1A1A1A]">RAM</label>
                                            <select
                                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                value={formData.ram}
                                                onChange={e => setFormData({...formData, ram: e.target.value})}
                                            >
                                                <option value="">-- Sélectionner --</option>
                                                {RAM_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Stockage */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#1A1A1A]">Stockage</label>
                                            <select
                                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                value={formData.storage}
                                                onChange={e => setFormData({...formData, storage: e.target.value})}
                                            >
                                                <option value="">-- Sélectionner --</option>
                                                {STORAGE_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Taille écran — only for laptops */}
                                        {formData.deviceType === 'laptop' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[#1A1A1A]">Taille écran</label>
                                                <select
                                                    className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
                                                    value={formData.screenSize}
                                                    onChange={e => setFormData({...formData, screenSize: e.target.value})}
                                                >
                                                    <option value="">-- Sélectionner --</option>
                                                    {SCREEN_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Condition & Photos & Notes ─── */}
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

                        {/* Photos */}
                        <div className="pt-2 space-y-3">
                            <label className="text-sm font-medium text-[#1A1A1A]">Photos (optionnel mais recommandé)</label>
                            <label className="block border-2 border-dashed border-[#E2E2DF] rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                <input type="file" multiple accept="image/jpeg, image/png" className="hidden" onChange={(e) => {
                                    if (e.target.files) {
                                        setImages(Array.from(e.target.files))
                                    }
                                }} />
                                <UploadCloud className="h-8 w-8 text-[#1A3FA0] mx-auto mb-3" />
                                <p className="font-medium text-[#1A1A1A]">Cliquez ou glissez vos photos ici</p>
                                <p className="text-sm text-[#6B7280] mt-1">Formats acceptés : JPG, PNG (Max 5MB)</p>
                            </label>
                            {images.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-[#1A1A1A] mb-3">{images.length} fichier(s) sélectionné(s) :</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg border border-[#E2E2DF] bg-[#F5F5F3] flex items-center justify-center p-3 group overflow-hidden">
                                                <span className="text-xs font-medium text-[#6B7280] text-center line-clamp-3 break-all">{img.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setImages(images.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-1.5 right-1.5 bg-white shadow-sm text-red-500 rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes libres */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-[#1A1A1A]">Informations complémentaires <span className="text-[#6B7280] font-normal">(optionnel)</span></label>
                            <textarea
                                rows={3}
                                placeholder="Ex: batterie remplacée récemment, écran légèrement rayé en haut à droite, acheté au Japon..."
                                className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 resize-none"
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Contact ─── */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Où vous envoyer l'estimation ?</h2>

                        {/* Récapitulatif de l'appareil */}
                        <div className="bg-[#F5F5F3] rounded-xl border border-[#E2E2DF] p-4 space-y-2 text-sm">
                            <p className="font-semibold text-[#1A1A1A] mb-2">Récapitulatif de votre appareil :</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#6B7280]">
                                <span>Type :</span><span className="text-[#1A1A1A] font-medium capitalize">{formData.deviceType === 'laptop' ? 'PC Portable' : formData.deviceType === 'desktop' ? 'PC Bureau' : formData.deviceType === 'phone' ? 'Smartphone/Tablette' : '-'}</span>
                                <span>Marque :</span><span className="text-[#1A1A1A] font-medium">{formData.brand || '-'}</span>
                                <span>Modèle :</span><span className="text-[#1A1A1A] font-medium">{formData.model || '-'}</span>
                                <span>Année :</span><span className="text-[#1A1A1A] font-medium">{formData.yearOfPurchase}</span>
                                {formData.cpu && <><span>CPU :</span><span className="text-[#1A1A1A] font-medium">{formData.cpu}</span></>}
                                {formData.ram && <><span>RAM :</span><span className="text-[#1A1A1A] font-medium">{formData.ram}</span></>}
                                {formData.storage && <><span>Stockage :</span><span className="text-[#1A1A1A] font-medium">{formData.storage}</span></>}
                                {formData.screenSize && <><span>Écran :</span><span className="text-[#1A1A1A] font-medium">{formData.screenSize}</span></>}
                                <span>État :</span><span className="text-[#1A1A1A] font-medium">{formData.condition || '-'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Prénom</label>
                                <input required type="text" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.firstName || user?.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Email</label>
                                <input required type="email" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-gray-50" readOnly value={user?.email || formData.email} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1A1A1A]">Téléphone (pour un traitement plus rapide)</label>
                                <input type="tel" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" value={formData.phone || user?.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step 4: Result ─── */}
                {step === 4 && (
                    <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">Évaluation terminée !</h2>
                        
                        {evaluationResult ? (
                            <div className="bg-[#F5F5F3] p-6 rounded-xl border border-[#E2E2DF] mb-8 text-left max-w-xl mx-auto">
                                <h3 className="font-bold text-xl mb-4 text-[#1A1A1A]">Résultat pour votre {evaluationResult.deviceModel}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-[#E2E2DF]">
                                        <span className="text-[#6B7280]">Valeur estimée</span>
                                        <span className="text-2xl font-bold text-[#1A3FA0]">{evaluationResult.estimatedValue?.toFixed(2)} TND</span>
                                    </div>
                                    {/* Specs affichées dans le résultat */}
                                    {(formData.cpu || formData.ram || formData.storage || formData.screenSize) && (
                                        <div className="pt-2 space-y-1 text-sm">
                                            {formData.cpu && <div className="flex justify-between"><span className="text-[#6B7280]">Processeur</span><span className="font-medium text-[#1A1A1A]">{formData.cpu}</span></div>}
                                            {formData.ram && <div className="flex justify-between"><span className="text-[#6B7280]">RAM</span><span className="font-medium text-[#1A1A1A]">{formData.ram}</span></div>}
                                            {formData.storage && <div className="flex justify-between"><span className="text-[#6B7280]">Stockage</span><span className="font-medium text-[#1A1A1A]">{formData.storage}</span></div>}
                                            {formData.screenSize && <div className="flex justify-between"><span className="text-[#6B7280]">Écran</span><span className="font-medium text-[#1A1A1A]">{formData.screenSize}</span></div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-[#6B7280] mb-8 text-lg max-w-md mx-auto">
                                Merci {formData.firstName}. Notre intelligence artificielle et nos experts analysent votre appareil.
                            </p>
                        )}

                        {offerAccepted ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 max-w-md mx-auto">
                                <div className="flex items-center gap-3 text-green-700 font-semibold mb-1">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Offre acceptée avec succès !
                                </div>
                                <p className="text-sm text-green-600">Notre équipe vous contactera sous 24h pour organiser la remise de votre appareil.</p>
                            </div>
                        ) : (
                            evaluationResult && (
                                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleAcceptOffer}
                                        disabled={isAccepting}
                                        className="bg-[#D1F232] hover:bg-[#bce600] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isAccepting ? 'Traitement...' : 'Accepter l\'offre'}
                                    </button>
                                    <Link href="/" className="bg-[#F5F5F3] text-[#1A1A1A] px-8 py-3 rounded-lg font-medium hover:bg-[#E2E2DF] transition-colors text-center">
                                        Refuser et retourner
                                    </Link>
                                </div>
                            )
                        )}

                        {!evaluationResult && (
                            <div className="flex justify-center mt-6">
                                <Link href="/" className="bg-[#1A3FA0] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
                                    Retourner à l'accueil
                                </Link>
                            </div>
                        )}

                        {offerAccepted && (
                            <div className="flex justify-center mt-4">
                                <Link href="/" className="bg-[#1A3FA0] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
                                    Retourner à l'accueil
                                </Link>
                            </div>
                        )}
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