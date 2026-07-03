import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await api.get('/products');
    setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        {!showForm && !editingProduct && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald text-paper px-4 py-2.5 rounded-xl hover:bg-emerald-light transition"
          >
            <Plus size={18} /> Add product
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <h3 className="font-display text-lg mb-3">New product</h3>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
          />
        </div>
      )}

      {editingProduct && (
        <div className="mb-8">
          <h3 className="font-display text-lg mb-3">Edit product</h3>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            submitting={submitting}
          />
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-ink/5">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wider text-gold font-medium mb-1">{p.category}</p>
                <h3 className="font-display text-lg mb-2">{p.title}</h3>
                <p className="font-mono text-sm text-emerald mb-3">₹{p.rentPerDay}/day + ₹{p.securityDeposit} deposit</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingProduct(p); setShowForm(false); }}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-ink/15 hover:border-emerald hover:text-emerald transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-ink/15 hover:border-wine hover:text-wine transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}