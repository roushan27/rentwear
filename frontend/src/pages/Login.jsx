import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isPhoneInput = /^[0-9]/.test(form.emailOrPhone);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-1">Welcome back</h1>
      <p className="text-muted mb-8">Login with your email or phone number.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {isPhoneInput ? <Phone size={16} /> : <Mail size={16} />}
          </span>
          <input
            name="emailOrPhone"
            placeholder="Email or phone number"
            value={form.emailOrPhone}
            onChange={handleChange}
            required
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 bg-white transition-all"
          />
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <Lock size={16} />
          </span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-wine text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        New here? <Link to="/register" className="text-emerald font-medium">Create an account</Link>
      </p>
    </div>
  );
}