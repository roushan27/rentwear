import { useEffect, useState } from 'react';
import { Check, X, MapPin } from 'lucide-react';
import api from '../api/axios';

export default function ManageListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = await api.get('/products/pending');
    setListings(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
      await api.put(`/products/${id}/approval`, { status });
      setListings((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">User Listings</h1>
      <p className="text-muted mb-6">Review items submitted by users before they go live.</p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted">No pending listings. All caught up!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div key={item._id} className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-ink/5">
                {item.images?.[0] && (
                  <img
                    src={`http://localhost:5000${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wider text-gold font-medium mb-1">{item.category}</p>
                <h3 className="font-display text-lg mb-1">{item.title}</h3>
                <p className="text-muted text-sm mb-2 line-clamp-2">{item.description}</p>

                <p className="font-mono text-sm text-emerald mb-1">
                  ₹{item.rentPerDay}/day + ₹{item.securityDeposit} deposit
                </p>

                {item.location?.address && (
                  <p className="flex items-center gap-1 text-xs text-muted mb-2">
                    <MapPin size={12} /> {item.location.address}
                  </p>
                )}

                <div className="text-xs text-muted border-t border-ink/10 pt-2 mt-2 mb-3">
                  Listed by <span className="font-medium text-ink">{item.owner?.name}</span> · {item.owner?.email}
                  {item.owner?.phone && <> · {item.owner.phone}</>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(item._id, 'approved')}
                    disabled={processingId === item._id}
                    className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg bg-emerald text-paper hover:bg-emerald-light transition disabled:opacity-60"
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(item._id, 'rejected')}
                    disabled={processingId === item._id}
                    className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg border border-wine text-wine hover:bg-wine/10 transition disabled:opacity-60"
                  >
                    <X size={15} /> Reject
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