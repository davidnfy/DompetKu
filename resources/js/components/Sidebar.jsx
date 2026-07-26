import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faArrowTrendUp,
  faArrowTrendDown,
  faUsers,
  faTags,
  faRightFromBracket,
  faWallet,
  faGear,
  faCartShopping,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const userNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: faChartPie },
  { to: '/income', label: 'Pemasukan', icon: faArrowTrendUp },
  { to: '/expense', label: 'Pengeluaran', icon: faArrowTrendDown },
  { to: '/shopping-list', label: 'Daftar Belanja', icon: faCartShopping },
];

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: faChartPie },
  { to: '/admin/users', label: 'Kelola Akun', icon: faUsers },
  { to: '/admin/categories', label: 'Kelola Kategori', icon: faTags },
];

export default function Sidebar({ onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'U';

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#181818] text-slate-100 flex flex-col overflow-hidden shrink-0 shadow-xl border-r border-[#262626]">
      
      <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#24523e] flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faWallet} className="text-white text-base" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">DompetKu</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-11 h-11 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none touch-target"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white" />
        </button>
      </div>

      <div className="px-6 py-6 border-b border-[#262626] shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#24523e] flex items-center justify-center text-white font-bold text-base shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate leading-snug">{user?.name || 'Pengguna'}</h4>
            <p className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</p>
            {isAdmin && (
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-emerald-400 mt-1">
                Administrator
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 min-h-0 overflow-y-auto">
        {(isAdmin ? adminNavItems : userNavItems).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'sidebar-link-active text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="w-4 text-xs" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-6 border-t border-[#262626] pt-4 shrink-0 space-y-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'sidebar-link-active text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <FontAwesomeIcon icon={faGear} className="w-4 text-xs" />
          Pengaturan
        </NavLink>

        <button
          onClick={() => {
            onClose?.();
            handleLogout();
          }}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-xs" />
          Logout
        </button>
      </div>
    </aside>
  );
}
