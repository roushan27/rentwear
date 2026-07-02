import { useState } from 'react';
import { Star } from 'lucide-react';

export default function ReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-5 space-y-3">
      <div>
        <p className="text-sm font-medium mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                size={26}
                className={
                  i <= (hoverRating || rating)
                    ? 'fill-gold text-gold'
                    : 'text-ink/15'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald text-sm"
      />

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="bg-emerald text-paper px-5 py-2.5 rounded-xl hover:bg-emerald-light transition disabled:opacity-40 text-sm"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}