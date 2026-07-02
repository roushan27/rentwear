import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const NEXT_STATUS = {
  booked: 'shipped',
  shipped: 'active',
  active: 'returned',
  overdue: 'returned',
};

const NEXT_LABEL = {
  booked: 'Mark as shipped',
  shipped: 'Mark as active',
  active: 'Mark as returned',
  overdue: 'Mark as returned',
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    const res = await api.get('/orders');
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvance = async (order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    setUpdatingId(order._id);
    try {
      await api.put(`/orders/${order._id}/status`, { status: nextStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const filters = ['all', 'booked', 'shipped', 'active', 'overdue', 'returned', 'completed'];

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Orders</h1>
      <p className="text-muted mb-6">Track and update rental order status.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition ${
              filter === f
                ? 'bg-emerald text-paper border-emerald'
                : 'border-ink/15 text-muted hover:border-emerald hover:text-emerald'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div key={o._id} className="bg-white border border-ink/10 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{o.productId?.title}</h3>
                  <p className="text-muted text-sm">{o.userId?.name} · {o.userId?.email}</p>
                  <p className="text-muted text-sm">
                    {dayjs(o.startDate).format('MMM D')} – {dayjs(o.endDate).format('MMM D, YYYY')}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="flex items-center justify-between border-t border-ink/10 pt-3">
                <div className="font-mono text-sm text-muted">
                  <span className="text-ink font-medium">₹{o.grandTotal}</span> total
                  {o.penaltyAmount > 0 && (
                    <span className="text-wine ml-2">+₹{o.penaltyAmount} penalty</span>
                  )}
                </div>

                {NEXT_STATUS[o.status] && (
                  <button
                    onClick={() => handleAdvance(o)}
                    disabled={updatingId === o._id}
                    className="text-sm px-4 py-2 rounded-lg bg-emerald text-paper hover:bg-emerald-light transition disabled:opacity-60"
                  >
                    {updatingId === o._id ? 'Updating...' : NEXT_LABEL[o.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}