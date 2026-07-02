import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const { user, login } = useAuth();
  const [balance, setBalance] = useState(user?.walletBalance ?? 0);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const balRes = await api.get('/wallet/balance');
    setBalance(balRes.data.walletBalance);
    const histRes = await api.get('/wallet/history');
    setHistory(histRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMoney = async () => {
    setError('');
    if (!amount || amount < 1) {
      return setError('Enter a valid amount');
    }

    setProcessing(true);
    try {
      // Step 1: Backend se Razorpay order banwao
      const { data } = await api.post('/wallet/create-order', { amount: Number(amount) });

      // Step 2: Razorpay checkout kholo
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'RentWear',
        description: 'Wallet Top-up',
        theme: { color: '#234D3B' },
        handler: async function (response) {
          // Step 3: Payment ke baad backend se verify karwao
          try {
            await api.post('/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amount),
            });
            setAmount('');
            fetchData();

            // AuthContext ka wallet balance bhi update karo
            const updatedUser = { ...user, walletBalance: balance + Number(amount) };
            login(updatedUser);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-1">My Wallet</h1>
      <p className="text-muted mb-8">Top up your wallet to book rentals instantly.</p>

      <div className="bg-emerald text-paper rounded-2xl p-6 mb-6">
        <p className="text-sm opacity-80 mb-1">Current balance</p>
        <p className="font-display text-4xl">₹{balance}</p>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 mb-8">
        <h3 className="font-display text-lg mb-4">Add money</h3>
       <div className="flex flex-wrap gap-2 mb-3">
  {[500, 1000, 2000, 5000].map((amt) => (
    <button
      key={amt}
      onClick={() => setAmount(amt)}
      className="px-4 py-2 rounded-full border border-ink/15 text-sm hover:border-emerald hover:text-emerald transition"
    >
      ₹{amt}
    </button>
  ))}
</div>
       <div className="flex flex-col sm:flex-row gap-3">
  <input
    type="number"
    placeholder="Enter amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl border border-ink/15 focus:outline-none focus:border-emerald"
  />
  <button
    onClick={handleAddMoney}
    disabled={processing}
    className="bg-emerald text-paper px-6 py-3 rounded-xl hover:bg-emerald-light transition disabled:opacity-60"
  >
    {processing ? 'Processing...' : 'Add Money'}
  </button>
</div>
        {error && <p className="text-wine text-sm mt-3">{error}</p>}
      </div>

      <h3 className="font-display text-lg mb-4">Transaction history</h3>
      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-muted text-sm">No transactions yet.</p>
        ) : (
          history.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between bg-white border border-ink/10 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{tx.reason}</p>
                <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <span className={`font-mono text-sm font-medium ${tx.type === 'credit' ? 'text-emerald' : 'text-wine'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}