import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const categories = ['clothing', 'wedding', 'electronics', 'gear'];
const sortOptions = [
  { value: '', label: 'Newest first' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function FilterPanel({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(filters.minPrice || 0);
  const [localMax, setLocalMax] = useState(filters.maxPrice || 10000);

  useEffect(() => {
    setLocalMin(filters.minPrice || 0);
    setLocalMax(filters.maxPrice || 10000);
  }, [filters.minPrice, filters.maxPrice]);

  const applyPriceRange = () => {
    onChange({ ...filters, minPrice: localMin, maxPrice: localMax });
  };

  const toggleCategory = (cat) => {
    onChange({ ...filters, category: filters.category === cat ? '' : cat });
  };

  const clearAll = () => {
    setLocalMin(0);
    setLocalMax(10000);
    onChange({ category: '', minPrice: '', maxPrice: '', sort: '' });
  };

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.sort ? 1 : 0);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-ink/15 text-sm hover:border-emerald transition"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald text-paper text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        <select
          value={filters.sort || ''}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="px-4 py-2.5 rounded-full border border-ink/15 text-sm focus:outline-none focus:border-emerald bg-white"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted hover:text-wine transition flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-20 top-14 left-0 bg-white border border-ink/10 rounded-2xl p-5 shadow-xl w-72">
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs capitalize border transition ${
                    filters.category === cat
                      ? 'bg-emerald text-paper border-emerald'
                      : 'border-ink/15 text-muted hover:border-emerald hover:text-emerald'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2">
            <p className="text-sm font-medium mb-2">Price per day</p>
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <span>₹{localMin}</span>
              <span>–</span>
              <span>₹{localMax}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={localMin}
              onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - 100))}
              className="w-full accent-emerald mb-1"
            />
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={localMax}
              onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + 100))}
              className="w-full accent-emerald"
            />
          </div>

          <button
            onClick={() => { applyPriceRange(); setOpen(false); }}
            className="w-full mt-3 bg-emerald text-paper py-2.5 rounded-xl text-sm hover:bg-emerald-light transition"
          >
            Apply filters
          </button>
        </div>
      )}
    </div>
  );
}