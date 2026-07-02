import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { PackageOpen } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import ReviewForm from '../components/ReviewForm';

const PIPELINE = ['booked', 'shipped', 'active', 'returned', 'completed'];

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewableIds, setReviewableIds] = useState([]);
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get('/reviews/reviewable').then((res) => {
      setReviewableIds(res.data.map((r) => r._id));
    });
  }, []);

  const handleReviewSubmit = async (rentalId, data) => {
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { rentalId, ...data });
      setReviewableIds((prev) => prev.filter((id) => id !== rentalId));
      setOpenReviewFor(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    api.get('/rentals/my-rentals').then((res) => {
      setRentals(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-1">My Rentals</h1>
      <p className="text-muted mb-8">Track every booking, from pickup to return.</p>

      {rentals.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No rentals yet"
          message="Once you book something, it'll show up here."
          action={
            <Link to="/" className="text-emerald font-medium text-sm hover:underline">
              Browse products →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {rentals.map((r) => (
            <div key={r._id} className="bg-white border border-ink/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <img
                    src={`http://localhost:5000${r.productId?.images?.[0] || ''}`}
                    alt={r.productId?.title}
                    className="w-16 h-20 object-cover rounded-lg bg-ink/5"
                  />
                  <div>
                    <h3 className="font-display text-lg leading-tight">{r.productId?.title}</h3>
                    <p className="text-muted text-sm">
                      {dayjs(r.startDate).format('MMM D')} – {dayjs(r.endDate).format('MMM D, YYYY')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="flex items-center gap-1 mb-4">
                {PIPELINE.map((step, i) => {
                  const currentIndex = PIPELINE.indexOf(r.status === 'overdue' ? 'active' : r.status);
                  const isDone = i <= currentIndex;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`h-1.5 flex-1 rounded-full ${isDone ? 'bg-emerald' : 'bg-ink/10'}`} />
                      {i < PIPELINE.length - 1 && <div className="w-1" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between font-mono text-sm border-t border-ink/10 pt-3">
                <span className="text-muted">Total paid</span>
                <span className="font-medium">₹{r.grandTotal}</span>
              </div>

              {r.penaltyAmount > 0 && (
                <div className="flex justify-between font-mono text-sm text-wine mt-1">
                  <span>Overdue penalty</span>
                  <span>₹{r.penaltyAmount}</span>
                </div>
              )}

              {reviewableIds.includes(r._id) && (
                <div className="mt-3 pt-3 border-t border-ink/10">
                  {openReviewFor === r._id ? (
                    <ReviewForm
                      submitting={submittingReview}
                      onSubmit={(data) => handleReviewSubmit(r._id, data)}
                    />
                  ) : (
                    <button
                      onClick={() => setOpenReviewFor(r._id)}
                      className="text-emerald text-sm font-medium hover:underline"
                    >
                      ⭐ Write a review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}