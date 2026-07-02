import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="bg-paper rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl text-emerald mb-1">RentWear Admin</h1>
        <p className="text-muted text-sm mb-6">Sign in to manage the platform.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Admin email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
          />
          <input
            type="password" placeholder="Password" required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
          />
          {error && <p className="text-wine text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}