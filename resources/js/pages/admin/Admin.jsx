import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUsers, faTags } from '@fortawesome/free-solid-svg-icons';
import AppLayout from '../../components/AppLayout';
import Dashboard from './Dashboard';
import Users from './Users';
import Categories from './Categories';

const adminTabs = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: faChartPie },
  { to: '/admin/users', label: 'Kelola Akun', icon: faUsers },
  { to: '/admin/categories', label: 'Kelola Kategori', icon: faTags },
];

export default function Admin() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola akun dan kategori sistem tanpa akses transaksi pengguna.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex flex-wrap gap-2 bg-slate-50 p-4">
            {adminTabs.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="p-6">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
