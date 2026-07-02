import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProductChat() {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    const res = await api.get(`/messages/${productId}`);
    setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
     api.put(`/messages/${productId}/read`);
    const interval = setInterval(fetchMessages, 4000); // simple polling
    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');
    try {
      await api.post('/messages', { productId, text });
      setText('');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 h-[calc(100dvh-64px)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl">Conversation</h1>
        <p className="flex items-center gap-1.5 text-xs text-muted mt-1">
          <ShieldAlert size={13} />
          For your safety, keep all communication within RentWear. Sharing phone numbers or emails isn't allowed.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-ink/10 rounded-2xl p-4 mb-4 space-y-3">
        {loading ? (
          <p className="text-muted text-sm">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">
            No messages yet. Say hello to start the conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = String(m.senderId) === String(user._id);
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-emerald text-paper rounded-br-sm'
                      : 'bg-ink/5 text-ink rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-wine text-sm mb-2">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-emerald text-paper px-5 py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}