import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 14, showValue = false, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'fill-gold text-gold' : 'text-ink/15'}
          />
        ))}
      </div>
      {showValue && rating > 0 && (
        <span className="text-xs text-muted ml-1">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
}