'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Search, Download, Plus, Eye, Pencil, Trash2, ChevronDown, X, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { fetchProducts } from '@/lib/api';
import { exportToCSV } from '@/lib/export';

const API_BASE = 'http://localhost:8090/api';

const conditionColors: Record<string, { bg: string; color: string }> = {
  'Reconditionné': { bg: '#EFF6FF', color: '#1A3FA0' },
  'Occasion':      { bg: '#FFF7ED', color: '#EA580C' },
  'Neuf':          { bg: '#F0FDF4', color: '#16A34A' },
};

const conditionMap: Record<string, string> = {
  NEW: 'Neuf', REFURBISHED: 'Reconditionné', USED: 'Occasion',
};
const conditionReverseMap: Record<string, string> = {
  'Neuf': 'NEW', 'Reconditionné': 'REFURBISHED', 'Occasion': 'USED',
};

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function DetailModal({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails du produit</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {product.image && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src={product.image} alt={product.name} style={{ maxHeight: 180, borderRadius: 8, objectFit: 'contain' }} />
            </div>
          )}
          <div className="modal-detail-grid">
            <div className="modal-detail-item"><span>Nom</span><strong>{product.name}</strong></div>
            <div className="modal-detail-item"><span>SKU</span><strong>{product.ref}</strong></div>
            <div className="modal-detail-item"><span>Catégorie</span><strong>{product.categorie}</strong></div>
            <div className="modal-detail-item"><span>État</span>
              <span className="admin-condition-badge" style={{ background: conditionColors[product.condition]?.bg, color: conditionColors[product.condition]?.color }}>
                {product.condition}
              </span>
            </div>
            <div className="modal-detail-item"><span>Prix</span><strong>{product.price.toLocaleString()} TND</strong></div>
            <div className="modal-detail-item"><span>Statut</span>
              <span className={`admin-status-badge ${product.statut === 'Actif' ? 'admin-badge-actif' : 'admin-badge-epuise'}`}>{product.statut}</span>
            </div>
            <div className="modal-detail-item"><span>Créé le</span><strong>{product.date}</strong></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="admin-btn-outline" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    condition: 'Reconditionné',
    price: 1000,
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du téléversement');

      setForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Le nom du produit est obligatoire'); return; }
    setSaving(true);
    setError('');
    try {
      const token = getToken();
      const body = {
        name: form.name,
        description: form.name,
        shortDesc: form.name,
        categoryId: 1, // PC Portables
        condition: conditionReverseMap[form.condition] || 'REFURBISHED',
        basePrice: form.price,
        salePrice: form.price,
        sku: form.sku || `SKU-${Date.now()}`,
        images: form.imageUrl ? [{ url: form.imageUrl, isPrimary: true, altText: form.name, sortOrder: 0 }] : [],
        specifications: [],
        tagNames: [],
      };
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Erreur ${res.status}`);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ajouter un nouveau produit</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-form-group">
            <label>Nom du produit</label>
            <input className="admin-input modal-input" placeholder="ex: Dell Latitude 5420" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="modal-form-group">
            <label>SKU / Référence</label>
            <input className="admin-input modal-input" placeholder="ex: DELL-5420-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
          </div>
          <div className="modal-form-group">
            <label>État</label>
            <select className="admin-select modal-input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              {['Neuf', 'Reconditionné', 'Occasion'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>Prix de vente (TND)</label>
            <input type="number" className="admin-input modal-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
          </div>
          <div className="modal-form-group">
            <label>Image du produit (Téléverser depuis le PC)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#EFF6FF', color: '#1A3FA0', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                {uploading ? 'Téléversement...' : 'Choisir une image'}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {form.imageUrl && (
                <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ImageIcon size={14} /> Image chargée
                </span>
              )}
            </div>
            {form.imageUrl && (
              <div style={{ marginTop: 10, width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <img src={form.imageUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="admin-btn-outline" onClick={onClose} disabled={saving || uploading}>Annuler</button>
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving || uploading}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Création...' : 'Créer le produit'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ product, onClose, onSaved }: { product: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product.name,
    condition: product.condition,
    price: product.price,
    imageUrl: product.image || '',
  });
  const [fullProduct, setFullProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/products/${product.id}`)
      .then(r => r.json())
      .then(data => {
        setFullProduct(data);
        if (data.images?.[0]?.url) {
          setForm(f => ({ ...f, imageUrl: data.images[0].url }));
        }
      })
      .catch(() => setError('Impossible de charger les détails du produit'));
  }, [product.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du téléversement');

      setForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullProduct) return;
    setSaving(true);
    setError('');
    try {
      const token = getToken();

      let imagesToSubmit = fullProduct.images?.map((img: any) => ({
        url: img.url || img.imageUrl,
        isPrimary: img.isPrimary || img.is_primary,
        altText: img.altText || img.alt_text || '',
        sortOrder: img.sortOrder || img.sort_order || 0
      })) || [];

      if (form.imageUrl) {
        imagesToSubmit = [{ url: form.imageUrl, isPrimary: true, altText: form.name, sortOrder: 0 }];
      }

      const body = {
        name: form.name,
        description: fullProduct.description || '',
        shortDesc: fullProduct.shortDesc || '',
        brandId: fullProduct.brandId || null,
        categoryId: fullProduct.categoryId || 1,
        condition: conditionReverseMap[form.condition] || form.condition,
        basePrice: form.price,
        salePrice: form.price,
        sku: fullProduct.sku || product.ref,
        weightKg: fullProduct.weightKg || null,
        isFeatured: fullProduct.isFeatured || false,
        metaTitle: fullProduct.metaTitle || '',
        metaDesc: fullProduct.metaDesc || '',
        images: imagesToSubmit,
        specifications: fullProduct.specifications?.map((s: any) => ({ specKey: s.specKey, specValue: s.specValue, sortOrder: s.sortOrder })) || [],
        tagNames: fullProduct.tags || [],
      };

      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody.message || errBody.errors?.join(', ') || `Erreur ${res.status}`;
        throw new Error(msg);
      }

      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier le produit</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {!fullProduct && !error && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} />
            </div>
          )}
          {fullProduct && (
            <>
              <div className="modal-form-group">
                <label>Nom du produit</label>
                <input className="admin-input modal-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="modal-form-group">
                <label>État</label>
                <select className="admin-select modal-input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                  {['Neuf', 'Reconditionné', 'Occasion'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="modal-form-group">
                <label>Prix de vente (TND)</label>
                <input type="number" className="admin-input modal-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
              </div>
              <div className="modal-form-group">
                <label>Image du produit (Téléverser depuis le PC)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#EFF6FF', color: '#1A3FA0', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                    {uploading ? 'Téléversement...' : 'Changer l\'image'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                  {form.imageUrl && (
                    <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ImageIcon size={14} /> Image définie
                    </span>
                  )}
                </div>
                {form.imageUrl && (
                  <div style={{ marginTop: 10, width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src={form.imageUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </>
          )}
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="admin-btn-outline" onClick={onClose} disabled={saving || uploading}>Annuler</button>
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving || uploading || !fullProduct}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ product, onClose, onDeleted }: { product: any; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      onDeleted();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#DC2626' }}>Supprimer le produit</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#475569', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer <strong>"{product.name}"</strong> ?<br />
            <span style={{ color: '#EF4444', fontSize: 13 }}>Cette action est irréversible.</span>
          </p>
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="admin-btn-outline" onClick={onClose} disabled={deleting}>Annuler</button>
          <button className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminProduitsPage() {
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<number[]>([]);
  const [marque, setMarque]       = useState('Toutes marques');
  const [etat, setEtat]           = useState('Tous états');
  const [categorie, setCategorie] = useState('Toutes catégories');

  const [products, setProducts]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const [showAddModal, setShowAddModal]   = useState(false);
  const [viewProduct, setViewProduct]     = useState<any>(null);
  const [editProduct, setEditProduct]     = useState<any>(null);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      const mapped = res.content.map((p: any) => ({
        id: p.id,
        image: p.images?.[0]?.url || p.images?.[0]?.imageUrl || null,
        name: p.name,
        ref: p.sku || `REF-${p.id}`,
        categorie: p.categoryName || 'PC',
        condition: conditionMap[p.condition] || p.condition || 'Neuf',
        price: p.salePrice || p.basePrice || 0,
        stockOk: p.isActive,
        statut: p.isActive ? 'Actif' : 'Inactif',
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
      }));
      setProducts(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase());
    const matchMarque   = marque === 'Toutes marques' || p.name.split(' ')[0] === marque;
    const matchEtat     = etat === 'Tous états' || p.condition === etat;
    const matchCat      = categorie === 'Toutes catégories' || p.categorie === categorie;
    return matchSearch && matchMarque && matchEtat && matchCat;
  });

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll    = () => { if (selected.length === filtered.length && filtered.length > 0) setSelected([]); else setSelected(filtered.map(p => p.id)); };

  const uniqueCategories = ['Toutes catégories', ...Array.from(new Set(products.map(p => p.categorie).filter(Boolean)))];
  const uniqueBrands = ['Toutes marques', ...Array.from(new Set(products.map(p => p.name.split(' ')[0]).filter(Boolean)))];

  const handleExport = () => {
    const headers = ['ID', 'Nom du produit', 'SKU / Référence', 'Catégorie', 'État', 'Prix (TND)', 'Statut', 'Date de création'];
    const rows = filtered.map(p => [
      p.id,
      p.name,
      p.ref,
      p.categorie,
      p.condition,
      p.price,
      p.statut,
      p.date
    ]);
    exportToCSV('export_produits', headers, rows);
  };

  return (
    <>
      <div className="admin-page">
        <AdminHeader title="Gestion des produits" breadcrumb="Catalogue · Produits" />
        <div className="admin-content">
          <div className="admin-card">
            {/* Filters Bar */}
            <div className="admin-filters-bar">
              <div className="admin-search-field">
                <Search size={16} className="admin-search-icon-sm" />
                <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="admin-input" />
              </div>
              <div className="admin-filters-right">
                {[
                  { value: marque,    setter: setMarque,    options: uniqueBrands },
                  { value: etat,      setter: setEtat,      options: ['Tous états', 'Neuf', 'Occasion', 'Reconditionné'] },
                  { value: categorie, setter: setCategorie, options: uniqueCategories },
                ].map(filter => (
                  <div key={filter.options[0]} className="admin-select-wrapper">
                    <select value={filter.value} onChange={e => filter.setter(e.target.value)} className="admin-select">
                      {filter.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={14} className="admin-select-icon" />
                  </div>
                ))}
                <button className="admin-btn-outline" onClick={handleExport}><Download size={16} /> Exporter</button>
                <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Ajouter un produit</button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="admin-empty-state"><Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} /></div>
            ) : (
              <table className="admin-table admin-table-full">
                <thead>
                  <tr>
                    <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                    <th>IMAGE</th>
                    <th>NOM &amp; RÉFÉRENCE</th>
                    <th>ÉTAT</th>
                    <th>PRIX</th>
                    <th>STATUT</th>
                    <th>CRÉÉ LE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => {
                    const cond = conditionColors[product.condition] || { bg: '#64748B', color: '#FFFFFF' };
                    return (
                      <tr key={product.id} className={selected.includes(product.id) ? 'admin-row-selected' : ''}>
                        <td><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                        <td>
                          <div className="admin-product-image">
                            {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : '💻'}
                          </div>
                        </td>
                        <td>
                          <div className="admin-product-name">{product.name}</div>
                          <div className="admin-product-ref">{product.ref}</div>
                        </td>
                        <td>
                          <span className="admin-condition-badge" style={{ background: cond.bg, color: cond.color }}>{product.condition}</span>
                        </td>
                        <td className="admin-table-price">{product.price.toLocaleString()} TND</td>
                        <td>
                          <span className={`admin-status-badge ${product.statut === 'Actif' ? 'admin-badge-actif' : 'admin-badge-epuise'}`}>{product.statut}</span>
                        </td>
                        <td className="admin-table-date">{product.date}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn" title="Voir les détails" onClick={() => setViewProduct(product)}><Eye size={16} /></button>
                            <button className="admin-action-btn" title="Modifier" onClick={() => setEditProduct(product)}><Pencil size={16} /></button>
                            <button className="admin-action-btn admin-action-delete" title="Supprimer" onClick={() => setDeleteProduct(product)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && filtered.length === 0 && (
              <div className="admin-empty-state" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#64748B' }}>
                  💻
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Aucun produit disponible</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Aucun produit ne correspond à vos critères de recherche.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal  && <AddModal     onClose={() => setShowAddModal(false)} onSaved={loadProducts} />}
      {viewProduct   && <DetailModal  product={viewProduct}   onClose={() => setViewProduct(null)} />}
      {editProduct   && <EditModal    product={editProduct}   onClose={() => setEditProduct(null)}   onSaved={loadProducts} />}
      {deleteProduct && <DeleteModal  product={deleteProduct} onClose={() => setDeleteProduct(null)} onDeleted={loadProducts} />}
    </>
  );
}
