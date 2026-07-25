'use client'

import { useState } from 'react'
import { UploadCloud, CheckCircle2, Laptop, HardDrive, Smartphone, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
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

        try {
            const res = await fetch('http://localhost:8090/api/trade-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    deviceType: DEVICE_TYPE_MAP[formData.deviceType] || 'LAPTOP',
                    model: `${formData.brand} ${formData.model}`.trim(),
                    conditionOverall: conditionInfo.code,
                    conditionDetails: {
                        general: {
                            score: conditionInfo.score,
                            notes: formData.hasCharger ? 'Chargeur original fourni' : 'Sans chargeur original'
                        }
                    },
                    images: []
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || 'Erreur lors de la soumission de votre demande')
            }

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
                            <div className="border-2 border-dashed border-[#E2E2DF] rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                <UploadCloud className="h-8 w-8 text-[#1A3FA0] mx-auto mb-3" />
                                <p className="font-medium text-[#1A1A1A]">Cliquez ou glissez vos photos ici</p>
                                <p className="text-sm text-[#6B7280] mt-1">Formats acceptés : JPG, PNG (Max 5MB)</p>
                            </div>
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

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">Demande envoyée !</h2>
                        <p className="text-[#6B7280] mb-8 text-lg max-w-md mx-auto">
                            Merci {formData.firstName}. Notre intelligence artificielle et nos experts analysent votre {formData.brand} {formData.model}.
                            <br/><br/>
                            Vous recevrez une estimation par email d'ici 24 heures.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/dashboard/reprises" className="bg-[#1A3FA0] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
                                Suivre ma demande
                            </Link>
                            <Link href="/" className="bg-[#F5F5F3] text-[#1A1A1A] px-6 py-3 rounded-lg font-medium hover:bg-[#E2E2DF] transition-colors">
                                Retour à l'accueil
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