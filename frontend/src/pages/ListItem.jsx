import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import LocationPicker from '../components/LocationPicker';

const categories = ['clothing', 'wedding', 'electronics', 'gear'];

export default function ListItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'clothing',
    rentPerDay: '',
    securityDeposit: '',
  });
  const [location, setLocation] = useState(null); // { address, lat, lng }
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      return setError('Please add at least one photo of your item');
    }
    if (!location) {
      return setError('Please select a pickup location on the map');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('address', location.address);
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      images.forEach((img) => formData.append('images', img));

      await api.post('/products/list-item', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-emerald" />
        </div>
        <h1 className="font-display text-2xl mb-2">Listing submitted</h1>
        <p className="text-muted mb-6">
          Your item is under review. We'll notify you once it's approved and live on RentWear.
        </p>
        <button
          onClick={() => navigate('/my-listings')}
          className="bg-emerald text-paper px-6 py-3 rounded-xl hover:bg-emerald-light transition"
        >
          View my listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-1">List your item</h1>
      <p className="text-muted mb-8">
        Rent out what you own. Submitted items are reviewed before going live — this keeps RentWear safe for everyone.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
        <input
          name="title" placeholder="Item title (e.g. Designer Sherwani)" required
          value={form.title} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
        />
        <textarea
          name="description" placeholder="Describe the item — condition, size, brand, etc." required rows={3}
          value={form.description} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
        />

        <div className="grid grid-cols-3 gap-3">
          <select
            name="category" value={form.category} onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            name="rentPerDay" type="number" placeholder="Rent/day (₹)" required
            value={form.rentPerDay} onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
          />
          <input
            name="securityDeposit" type="number" placeholder="Deposit (₹)" required
            value={form.securityDeposit} onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pickup location</label>
          <LocationPicker onLocationSelect={setLocation} />
          <p className="text-xs text-muted mt-2">
            Only your general area is shown to buyers — never your exact address.
          </p>
        </div>

        <label className="block">
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            images.length > 0 ? 'border-emerald bg-emerald/5' : 'border-ink/15 hover:border-emerald'
          }`}>
            <input
              type="file" multiple accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="hidden"
            />
            {images.length > 0 ? (
              <div className="flex flex-col items-center gap-2 text-emerald">
                <CheckCircle2 size={28} />
                <p className="text-sm font-medium">{images.length} photo(s) selected</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-muted" />
                <p className="text-sm text-muted">Add photos of your item</p>
              </div>
            )}
          </div>
        </label>

        {error && <p className="text-wine text-sm">{error}</p>}

        <button
          type="submit" disabled={submitting}
          className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}