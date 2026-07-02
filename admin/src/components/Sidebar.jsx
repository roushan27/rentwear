import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShieldCheck, ClipboardList, PackagePlus, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/listings', label: 'User Listings', icon: PackagePlus },
  { to: '/kyc', label: 'KYC Requests', icon: ShieldCheck },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
];

export default function Sidebar() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-60 bg-sidebar text-paper min-h-screen p-5 flex flex-col">
      <h1 className="font-display text-xl mb-8 px-2">RentWear</h1>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive ? 'bg-emerald text-paper' : 'text-paper/70 hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-paper/70 hover:bg-white/5 transition"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}