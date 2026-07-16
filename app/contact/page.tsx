import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { COMPANY } from '@/lib/constants'
import { Phone, MapPin, Clock, Mail, Send } from 'lucide-react'

export const metadata = {
  title: 'Contactez-nous — AfricaNet',
  description: 'Une question ? Besoin d\'assistance ? Contactez l\'équipe AfricaNet par téléphone, email ou venez nous rendre visite.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-4">Contactez-nous</h1>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions, que ce soit pour un conseil d'achat, le suivi d'une commande ou une demande de SAV.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-[#1A3FA0] text-white p-8 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-serif font-bold mb-6">Informations directes</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold">Téléphone</p>
                      <a href={`tel:+216${COMPANY.phone.replace(/ /g, '')}`} className="text-[#E8EDF8] hover:text-white transition-colors">
                        +216 {COMPANY.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold">Email</p>
                      <a href="mailto:contact@africanet.tn" className="text-[#E8EDF8] hover:text-white transition-colors">
                        contact@africanet.tn
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold">Adresse</p>
                      <p className="text-[#E8EDF8]">{COMPANY.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold">Heures d'ouverture</p>
                      <p className="text-[#E8EDF8]">{COMPANY.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Teaser */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E2DF]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">Vous cherchez une réponse rapide ?</h3>
                <p className="text-sm text-[#6B7280] mb-4">
                  Consultez notre Centre d'Aide. Vous y trouverez les réponses aux questions les plus fréquentes concernant les livraisons, les retours et les garanties.
                </p>
                <a href="#" className="text-[#1A3FA0] font-medium hover:underline">
                  Visiter le Centre d'Aide →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E2DF]">
              <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-6">Envoyez-nous un message</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="firstName">Prénom</label>
                    <input id="firstName" required type="text" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="lastName">Nom</label>
                    <input id="lastName" required type="text" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="email">Email</label>
                    <input id="email" required type="email" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="phone">Téléphone (Optionnel)</label>
                    <input id="phone" type="tel" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" placeholder="+216 00 000 000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="subject">Sujet</label>
                  <select id="subject" className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white">
                    <option>Question sur un produit</option>
                    <option>Suivi de commande</option>
                    <option>Demande de devis (Entreprises)</option>
                    <option>Service Après Vente (Garantie)</option>
                    <option>Autre demande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="message">Message</label>
                  <textarea id="message" required rows={5} className="w-full border border-[#E2E2DF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>

                <button type="button" className="bg-[#1A3FA0] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#0D2660] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Send className="h-5 w-5" />
                  Envoyer le message
                </button>
                <p className="text-xs text-[#6B7280] mt-4">
                  En soumettant ce formulaire, vous acceptez que vos données soient traitées pour répondre à votre demande.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
