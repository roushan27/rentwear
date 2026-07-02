import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-1">Create your account</h1>
      <p className="text-muted mb-8">Join RentWear to start renting premium pieces.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name" placeholder="Full name" value={form.name} onChange={handleChange} required
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald bg-white"
        />
        <input
          name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald bg-white"
        />
        <input
          name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald bg-white"
        />
        <input
          name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald bg-white"
        />

        {error && <p className="text-wine text-sm">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        Already have an account? <Link to="/login" className="text-emerald font-medium">Login</Link>
      </p>
    </div>
  );
}