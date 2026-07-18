import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalUsers: 0, totalCategories: 0, latestUsers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersRes, categoriesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/categories'),
        ]);

        if (!ignore) {
          setSummary({
            totalUsers: usersRes.data.length,
            totalCategories: categoriesRes.data.length,
            latestUsers: usersRes.data.slice(0, 5),
          });
        }
      } catch (err) {
        if (!ignore) setError('Gagal memuat ringkasan admin.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400">
        <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" /> Memuat data admin...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-expense bg-expense/10 border border-expense/20 px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Akun Terdaftar</p>
          <p className="text-4xl font-extrabold text-slate-900">{summary.totalUsers}</p>
          <p className="text-sm text-slate-500 mt-2">Pengguna yang terdaftar di aplikasi.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Kategori Sistem</p>
          <p className="text-4xl font-extrabold text-slate-900">{summary.totalCategories}</p>
          <p className="text-sm text-slate-500 mt-2">Kategori menu untuk pemasukan/pengeluaran.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Pengguna Terbaru</h2>
          <p className="text-sm text-slate-500 mt-1">5 pengguna terakhir yang mendaftar atau terdaftar.</p>
        </div>
        <div className="overflow-x-auto p-5">
          {summary.latestUsers.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada pengguna.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-left text-xs uppercase tracking-wide">
                  <th className="pb-3 pr-6">Nama</th>
                  <th className="pb-3 pr-6">Username</th>
                  <th className="pb-3 pr-6">Email</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.latestUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200">
                    <td className="py-3 pr-6 text-slate-700">{user.name}</td>
                    <td className="py-3 pr-6 text-slate-600">@{user.username}</td>
                    <td className="py-3 pr-6 text-slate-600 truncate max-w-[220px]">{user.email}</td>
                    <td className="py-3 text-slate-600">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                        user.role === 'admin' ? 'bg-income/10 text-income' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
