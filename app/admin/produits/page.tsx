export const metadata = {
  title: 'Produits — AfricaNet Admin',
}

export default function AdminProduitsPage() {
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Produits</h1>
          <p className="text-[#6B7280]">Gérez le catalogue, ajoutez ou modifiez des produits.</p>
        </div>
        <button className="bg-[#1A3FA0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
          + Ajouter un produit
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-12 text-center">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Interface de gestion des produits</h2>
        <p className="text-[#6B7280]">En cours de construction...</p>
      </div>
    </div>
  )
}
