import { useEffect, useState } from 'react';
import { SearchX } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Container from '../components/Container';
import FilterPanel from '../components/FilterPanel';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', sort: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = { search, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await api.get('/products', { params });
      setProducts(res.data);
      setLoading(false);
    };
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search, filters]);

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-10 max-w-xl">
        <h1 className="font-display text-4xl md:text-5xl mb-3 leading-tight">
          Rent the extraordinary.
        </h1>
        <p className="text-muted text-base">
          Luxury outfits, wedding wear & gadgets — worn, returned, remembered.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search lehengas, gadgets, gear..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md mb-6 px-5 py-3.5 rounded-full border border-ink/15 focus:outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/10 bg-white transition-all"
      />

      <FilterPanel filters={filters} onChange={setFilters} />

      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No products found"
          message="Try adjusting your filters or search term."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}