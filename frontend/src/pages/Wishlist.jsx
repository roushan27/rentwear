import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import Container from '../components/Container';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl mb-1">My Wishlist</h1>
      <p className="text-muted mb-8">Items you've saved for later.</p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart icon on any item to save it here."
          action={
            <Link to="/" className="text-emerald font-medium text-sm hover:underline">
              Browse products →
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}