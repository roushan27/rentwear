import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import dayjs from 'dayjs';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import 'react-calendar/dist/Calendar.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [range, setRange] = useState(null);
  const [cost, setCost] = useState(null);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [reviewData, setReviewData] = useState({ reviews: [], avgRating: 0, count: 0 });

  useEffect(() => {
    api.get(`/products/${slug}`).then((res) => setProduct(res.data));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api.get(`/reviews/product/${product._id}`).then((res) => setReviewData(res.data));
  }, [product]);

  useEffect(() => {
    if (!range || !product) return;
    const [start, end] = range;
    const startDate = dayjs(start).format('YYYY-MM-DD');
    const endDate = dayjs(end).format('YYYY-MM-DD');

    setError('');
    api
      .post('/rentals/calculate', { productId: product._id, startDate, endDate })
      .then((res) => setCost(res.data))
      .catch((err) => {
        setCost(null);
        setError(err.response?.data?.message || 'Could not calculate cost');
      });
  }, [range, product]);

  const isDateDisabled = ({ date }) => {
    if (!product) return false;
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    return product.disabledDates.includes(dateStr);
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    const [start, end] = range;
    setBooking(true);
    setError('');
    try {
      await api.post('/rentals/book', {
        productId: product._id,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      setSuccess('Booking confirmed! Check My Rentals for details.');
      setRange(null);
      setCost(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (!product) return <p className="max-w-6xl mx-auto px-4 md:px-6 py-12 text-muted">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid md:grid-cols-2 gap-8 md:gap-12">
      <div>
        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-ink/5 mb-4">
          <img
            src={product.images?.[0] || '/placeholder-image.svg'}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.svg';
            }}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs uppercase tracking-wider text-gold font-medium">{product.category}</p>
          {user && (
            <button onClick={() => toggleWishlist(product._id)} className="shrink-0">
              <Heart size={20} className={isWishlisted(product._id) ? 'fill-wine text-wine' : 'text-ink/30'} />
            </button>
          )}
        </div>
        <h1 className="font-display text-2xl md:text-3xl mb-2">{product.title}</h1>

        {reviewData.count > 0 && (
          <div className="mb-3">
            <StarRating rating={reviewData.avgRating} showValue count={reviewData.count} />
          </div>
        )}

        <p className="text-muted mb-6 text-sm md:text-base">{product.description}</p>

        {product.location?.address && (
          <p className="text-xs text-muted mb-4">📍 {product.location.address}</p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm mb-8">
          <span className="text-emerald font-medium">₹{product.rentPerDay}/day rent</span>
          <span className="text-muted">₹{product.securityDeposit} refundable deposit</span>
        </div>

        <h3 className="font-display text-lg mb-3">Select rental dates</h3>
        <div className="mb-6 [&_.react-calendar]:w-full [&_.react-calendar]:border-ink/10 [&_.react-calendar]:rounded-xl [&_.react-calendar]:font-body">
          <Calendar
            selectRange
            onChange={setRange}
            value={range}
            tileDisabled={isDateDisabled}
            minDate={new Date()}
          />
        </div>

        {cost && (
          <div className="bg-white rounded-xl border border-ink/10 p-5 mb-4 font-mono text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted">Days</span><span>{cost.totalDays}</span></div>
            <div className="flex justify-between"><span className="text-muted">Rent</span><span>₹{cost.totalRent}</span></div>
            <div className="flex justify-between"><span className="text-muted">Deposit (refundable)</span><span>₹{cost.securityDeposit}</span></div>
            <div className="flex justify-between font-medium text-emerald border-t border-ink/10 pt-2 mt-2">
              <span>Total</span><span>₹{cost.grandTotal}</span>
            </div>
          </div>
        )}

        {error && <p className="text-wine text-sm mb-4">{error}</p>}
        {success && <p className="text-emerald text-sm mb-4">{success}</p>}

        {product.owner && (
          <button
            onClick={() => navigate(`/chat/${product._id}`)}
            className="w-full mb-3 border border-emerald text-emerald py-3 rounded-xl hover:bg-emerald/5 transition text-sm font-medium"
          >
            💬 Contact seller
          </button>
        )}

        <button
          onClick={handleBook}
          disabled={!cost || booking}
          className="w-full bg-emerald text-paper py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-40"
        >
          {booking ? 'Booking...' : 'Rent now'}
        </button>
      </div>

      <div className="md:col-span-2 mt-2 md:mt-4">
        <h3 className="font-display text-xl mb-4">
          Reviews {reviewData.count > 0 && `(${reviewData.count})`}
        </h3>
        {reviewData.reviews.length === 0 ? (
          <p className="text-muted text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviewData.reviews.map((r) => (
              <div key={r._id} className="bg-white border border-ink/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.userId?.name}</span>
                  <StarRating rating={r.rating} size={13} />
                </div>
                {r.comment && <p className="text-muted text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}