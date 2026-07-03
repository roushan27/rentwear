import { useEffect, useState } from 'react';
import { Check, X, FileText } from 'lucide-react';
import api from '../api/axios';

export default function ManageKyc() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingKyc = async () => {
    setLoading(true);
    const res = await api.get('/admin/kyc/pending');
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const handleAction = async (userId, status) => {
    setProcessingId(userId);
    try {
      await api.put(`/admin/kyc/${userId}`, { status });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">KYC Requests</h1>
      <p className="text-muted mb-6">Review and approve identity documents.</p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-muted">No pending KYC requests. All caught up!</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u._id} className="bg-white border border-ink/10 rounded-2xl p-5 flex items-center gap-5">
              <a
                href={u.idProofUrl}
                target="_blank"
                rel="noreferrer"
                className="w-20 h-20 rounded-xl bg-ink/5 flex items-center justify-center overflow-hidden shrink-0 border border-ink/10 hover:border-emerald transition"
              >
                {u.idProofUrl?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={u.idProofUrl} alt="ID proof" className="w-full h-full object-cover" />
                ) : (
                  <FileText className="text-muted" />
                )}
              </a>

              <div className="flex-1">
                <h3 className="font-medium">{u.name}</h3>
                <p className="text-muted text-sm">{u.email}</p>
                <p className="text-muted text-sm">{u.phone}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(u._id, 'verified')}
                  disabled={processingId === u._id}
                  className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-emerald text-paper hover:bg-emerald-light transition disabled:opacity-60"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => handleAction(u._id, 'rejected')}
                  disabled={processingId === u._id}
                  className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-wine text-wine hover:bg-wine/10 transition disabled:opacity-60"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}