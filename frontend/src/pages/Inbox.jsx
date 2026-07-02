import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Inbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/my-inbox').then((res) => {
      setConversations(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="max-w-2xl mx-auto px-6 py-12 text-muted">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-1">Messages</h1>
      <p className="text-muted mb-8">Your conversations with buyers and sellers.</p>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          message="When you message a seller or someone messages you, it'll show up here."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const otherParty = c.buyerId?._id === user._id ? c.sellerId : c.buyerId;
            return (
              <Link
                key={c._id}
                to={`/chat/${c.productId?._id}`}
                className="flex items-center gap-3 bg-white border border-ink/10 rounded-xl p-4 hover:border-emerald/50 transition"
              >
                <img
                  src={`http://localhost:5000${c.productId?.images?.[0] || ''}`}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-ink/5"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.productId?.title}</p>
                  <p className="text-muted text-xs truncate">
                    {otherParty?.name} · {c.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}