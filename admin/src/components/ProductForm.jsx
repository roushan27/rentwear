import { useState } from 'react';

const categories = ['clothing', 'wedding', 'electronics', 'gear'];

export default function ProductForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'clothing',
    rentPerDay: initialData?.rentPerDay || '',
    securityDeposit: initialData?.securityDeposit || '',
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach((img) => formData.append('images', img));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
      <input
        name="title" placeholder="Product title" required
        value={form.title} onChange={handleChange}
        className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
      />
      <textarea
        name="description" placeholder="Description" required rows={3}
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

      <label className="block">
        <div className="border-2 border-dashed border-ink/15 rounded-xl p-6 text-center cursor-pointer hover:border-emerald transition">
          <input
            type="file" multiple accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="hidden"
          />
          <p className="text-sm text-muted">
            {images.length > 0 ? `${images.length} image(s) selected` : 'Click to select images (max 5)'}
          </p>
        </div>
      </label>

      <div className="flex gap-3">
        <button
          type="submit" disabled={submitting}
          className="bg-emerald text-paper px-6 py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
        >
          {submitting ? 'Saving...' : initialData ? 'Update product' : 'Create product'}
        </button>
        {onCancel && (
          <button
            type="button" onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-ink/15 hover:border-ink/30 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}