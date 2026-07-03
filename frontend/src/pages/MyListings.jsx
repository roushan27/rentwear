import { useEffect, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EmptyState from '../components/EmptyState';

const statusStyles = {
  pending: 'bg-gold/15 text-gold',
  approved: 'bg-emerald/15 text-emerald',
  rejected: 'bg-wine/15 text-wine',
};

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/my-listings').then((res) => {
      setListings(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="max-w-4xl mx-auto px-6 py-12 text-muted">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">My Listings</h1>
          <p className="text-muted">Items you've listed for rent.</p>
        </div>
        <Link
          to="/list-item"
          className="bg-emerald text-paper px-4 py-2.5 rounded-xl hover:bg-emerald-light transition text-sm"
        >
          + List new item
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="Nothing listed yet"
          message="Have something to rent out? List it and start earning."
          action={
            <Link to="/list-item" className="text-emerald font-medium text-sm hover:underline">
              List your first item →
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div key={item._id} className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-ink/5">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg">{item.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[item.approvalStatus]}`}>
                    {item.approvalStatus}
                  </span>
                </div>
                <p className="font-mono text-sm text-emerald">₹{item.rentPerDay}/day</p>
                {item.approvalStatus === 'rejected' && (
                  <p className="text-xs text-wine mt-2">
                    This listing wasn't approved. Contact support for details.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}