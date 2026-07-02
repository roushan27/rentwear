import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Bell, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/unread-count');
        setUnreadCount(res.data.count);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      closeMenu();
      navigate('/');
    }
  };

  const navLinks = [
    { to: '/kyc', label: 'KYC' },
    { to: '/my-rentals', label: 'My Rentals' },
    { to: '/my-listings', label: 'Sell/Rent Out' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/inbox', label: 'Messages' },
    { to: '/wallet', label: `Wallet · ₹${user?.walletBalance ?? 0}` },
  ];

  return (
    <nav className="border-b border-ink/10 bg-paper/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="font-display text-2xl tracking-tight text-emerald hover:opacity-80 transition">
          RentWear
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/kyc" className="px-3 py-2 rounded-lg text-sm hover:bg-ink/5 transition">KYC</Link>
              <Link to="/my-rentals" className="px-3 py-2 rounded-lg text-sm hover:bg-ink/5 transition">My Rentals</Link>
              <Link to="/my-listings" className="px-3 py-2 rounded-lg text-sm hover:bg-ink/5 transition">Sell/Rent Out</Link>

              <Link to="/inbox" className="relative p-2.5 rounded-lg hover:bg-ink/5 transition">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-wine rounded-full ring-2 ring-paper" />
                )}
              </Link>

              <Link to="/wishlist" className="p-2.5 rounded-lg hover:bg-ink/5 transition">
                <Heart size={18} />
              </Link>

              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-ink/5 transition font-mono"
              >
                <ShoppingBag size={15} /> ₹{user.walletBalance ?? 0}
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm text-muted hover:bg-wine/5 hover:text-wine transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 bg-emerald text-paper px-4 py-2 rounded-full text-sm hover:bg-emerald-light transition"
            >
              <User size={15} /> Login
            </button>
          )}
        </div>

        {/* Mobile — hamburger + minimal icons */}
        <div className="flex md:hidden items-center gap-1">
          {user && (
            <Link to="/inbox" className="relative p-2 rounded-lg hover:bg-ink/5 transition">
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-wine rounded-full ring-2 ring-paper" />
              )}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-ink/5 transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 bg-paper px-4 py-3 space-y-1">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="block px-3 py-2.5 rounded-lg text-sm hover:bg-ink/5 transition"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-wine hover:bg-wine/5 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { closeMenu(); navigate('/login'); }}
              className="w-full bg-emerald text-paper py-2.5 rounded-lg text-sm hover:bg-emerald-light transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}