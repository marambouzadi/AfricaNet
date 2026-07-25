'use client'

import { useEffect, useState } from 'react'
import { Package, Search, Eye, Download, X } from 'lucide-react'

interface OrderItem {
    productSnapshot?: { name?: string }
    quantity: number
    unitPrice?: number
    totalPrice?: number
}

interface Order {
    id: number
    orderNumber: string
    status: string
    totalAmount: number
    subtotal?: number
    taxAmount?: number
    shippingAmount?: number
    discountAmount?: number
    paymentMethod?: string
    createdAt: string
    items?: OrderItem[]
    shippingAddress?: Record<string, string>
}

const statusStyles: Record<string, string> = {
    PENDING:    'bg-yellow-100 text-yellow-800',
    CONFIRMED:  'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED:    'bg-yellow-100 text-yellow-800',
    DELIVERED:  'bg-green-100 text-green-800',
    CANCELLED:  'bg-red-100 text-red-800',
    REFUNDED:   'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
    PENDING:    'En attente',
    CONFIRMED:  'Confirmée',
    PROCESSING: 'En préparation',
    SHIPPED:    'Expédiée',
    DELIVERED:  'Livrée',
    CANCELLED:  'Annulée',
    REFUNDED:   'Remboursée',
}

export default function OrdersPage() {
    const [orders, setOrders]               = useState<Order[]>([])
    const [loading, setLoading]             = useState(true)
    const [error, setError]                 = useState('')
    const [search, setSearch]               = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [downloadingId, setDownloadingId] = useState<number | null>(null)

    /* ── Fetch order list ── */
    useEffect(() => {
        let ignore = false
        const token = localStorage.getItem('accessToken')

        if (!token) {
            setError('Vous devez être connecté pour voir vos commandes.')
            setLoading(false)
            return
        }

        fetch('http://localhost:8090/api/orders/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error()
                return res.json()
            })
            .then(data => { if (!ignore) setOrders(Array.isArray(data) ? data : data.content || []) })
            .catch(() => { if (!ignore) setError('Impossible de récupérer vos commandes.') })
            .finally(() => { if (!ignore) setLoading(false) })

        return () => { ignore = true }
    }, [])

    /* ── Open order detail modal ── */
    const handleViewOrder = async (orderId: number) => {
        const token = localStorage.getItem('accessToken')
        if (!token) return
        setDetailLoading(true)
        try {
            const res = await fetch(`http://localhost:8090/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error()
            setSelectedOrder(await res.json())
        } catch {
            alert('Impossible de charger les détails de cette commande.')
        } finally {
            setDetailLoading(false)
        }
    }

    /* ── Download invoice PDF ── */
    const handleDownloadInvoice = async (orderId: number, orderNumber: string) => {
        const token = localStorage.getItem('accessToken')
        if (!token) return
        setDownloadingId(orderId)
        try {
            const res = await fetch(`http://localhost:8090/api/orders/${orderId}/invoice`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error()
            const blob = await res.blob()
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href     = url
            a.download = `facture-${orderNumber}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            alert('Impossible de télécharger la facture.')
        } finally {
            setDownloadingId(null)
        }
    }

    /* ── Filtered orders ── */
    const filtered = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (statusLabels[o.status] || o.status).toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mes Commandes</h1>
                    <p className="text-[#6B7280]">Suivez et gérez l&apos;historique de vos achats.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une commande..."
                        className="pl-9 pr-4 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
                {loading ? (
                    <p className="p-6 text-[#6B7280]">Chargement de vos commandes...</p>
                ) : error ? (
                    <p className="p-6 text-red-600">{error}</p>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-[#F5F5F3] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-[#6B7280]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                            {search ? 'Aucune commande trouvée' : 'Aucune commande pour le moment'}
                        </h3>
                        <p className="text-[#6B7280]">Vos futurs achats apparaîtront ici.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[#E2E2DF] text-sm text-[#6B7280]">
                                    <th className="px-6 py-4 font-medium">Commande</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Articles</th>
                                    <th className="px-6 py-4 font-medium">Total</th>
                                    <th className="px-6 py-4 font-medium">Statut</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E2DF]">
                                {filtered.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[#1A1A1A]">{order.orderNumber}</td>
                                        <td className="px-6 py-4 text-sm text-[#6B7280]">
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#1A1A1A] truncate max-w-[200px]">
                                            {order.items?.map(i => i.productSnapshot?.name).filter(Boolean).join(', ') || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-[#1A1A1A]">
                                            {Number(order.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewOrder(order.id)}
                                                    disabled={detailLoading}
                                                    className="p-2 text-[#6B7280] hover:text-[#1A3FA0] transition-colors disabled:opacity-50"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                                                    disabled={downloadingId === order.id}
                                                    className="p-2 text-[#6B7280] hover:text-[#1A3FA0] transition-colors disabled:opacity-50"
                                                    title="Télécharger la facture PDF"
                                                >
                                                    <Download className={`h-4 w-4 ${downloadingId === order.id ? 'animate-pulse' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#E2E2DF]">
                            <div>
                                <h2 className="text-xl font-bold text-[#1A1A1A]">{selectedOrder.orderNumber}</h2>
                                <p className="text-sm text-[#6B7280]">
                                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusStyles[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                                </span>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Articles</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#F5F5F3] last:border-0">
                                            <div>
                                                <p className="font-medium text-[#1A1A1A] text-sm">{item.productSnapshot?.name || 'Produit'}</p>
                                                <p className="text-xs text-[#6B7280]">Qté : {item.quantity}</p>
                                            </div>
                                            {item.totalPrice != null && (
                                                <p className="font-medium text-[#1A1A1A] text-sm">
                                                    {Number(item.totalPrice).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-[#F5F5F3] rounded-xl p-4 space-y-2 text-sm">
                                {selectedOrder.subtotal != null && (
                                    <div className="flex justify-between text-[#6B7280]">
                                        <span>Sous-total</span>
                                        <span>{Number(selectedOrder.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                                    </div>
                                )}
                                {selectedOrder.taxAmount != null && (
                                    <div className="flex justify-between text-[#6B7280]">
                                        <span>TVA</span>
                                        <span>{Number(selectedOrder.taxAmount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                                    </div>
                                )}
                                {selectedOrder.shippingAmount != null && (
                                    <div className="flex justify-between text-[#6B7280]">
                                        <span>Livraison</span>
                                        <span>{Number(selectedOrder.shippingAmount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                                    </div>
                                )}
                                {selectedOrder.discountAmount != null && Number(selectedOrder.discountAmount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Remise</span>
                                        <span>-{Number(selectedOrder.discountAmount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-[#1A1A1A] text-base pt-2 border-t border-[#E2E2DF]">
                                    <span>Total</span>
                                    <span>{Number(selectedOrder.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                                </div>
                            </div>

                            {/* Shipping address */}
                            {selectedOrder.shippingAddress && Object.keys(selectedOrder.shippingAddress).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Adresse de livraison</h3>
                                    <div className="text-sm text-[#1A1A1A] leading-relaxed">
                                        {selectedOrder.shippingAddress.fullName && <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>}
                                        {selectedOrder.shippingAddress.street && <p>{selectedOrder.shippingAddress.street}</p>}
                                        <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                                        {selectedOrder.shippingAddress.country && <p className="uppercase font-semibold text-[#6B7280]">{selectedOrder.shippingAddress.country}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Payment method */}
                            {selectedOrder.paymentMethod && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B7280]">Paiement</span>
                                    <span className="font-medium text-[#1A1A1A]">{selectedOrder.paymentMethod}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={() => {
                                    const o = selectedOrder
                                    setSelectedOrder(null)
                                    handleDownloadInvoice(o.id, o.orderNumber)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                            >
                                <Download className="h-4 w-4" /> Télécharger la facture
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2.5 border border-[#E2E2DF] rounded-xl text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay for detail */}
            {detailLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-xl">
                        <div className="w-5 h-5 border-2 border-[#1A3FA0] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-[#1A1A1A]">Chargement des détails...</span>
                    </div>
                </div>
            )}
        </div>
    )
}