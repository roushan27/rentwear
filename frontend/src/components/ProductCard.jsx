import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product._id);

  const handleHeartClick = (e) => {
    e.preventDefault(); // Link navigate hone se roke
    e.stopPropagation();
    if (!user) return navigate('/login');
    toggleWishlist(product._id);
  };

  return (
    <Link
      to={`/rentwear/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-ink/10 hover:border-gold/50 hover:shadow-xl hover:shadow-ink/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <button
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition shadow-sm"
        >
          <Heart
            size={16}
            className={wishlisted ? 'fill-wine text-wine' : 'text-ink/50'}
          />
        </button>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-gold font-semibold mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg leading-snug mb-1 line-clamp-1">{product.title}</h3>

        {product.location?.address && (
          <p className="flex items-center gap-1 text-xs text-muted mb-2 line-clamp-1">
            <MapPin size={11} className="shrink-0" />
            {product.location.address}
          </p>
        )}

        <div className="flex items-baseline justify-between font-mono text-sm">
          <span className="text-emerald font-medium">₹{product.rentPerDay}/day</span>
          <span className="text-muted text-xs">+₹{product.securityDeposit}</span>
        </div>
      </div>
    </Link>
  );
}