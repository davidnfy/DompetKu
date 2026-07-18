import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTrash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';
import ResetPasswordModal from './ResetPasswordModal';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const confirm = useConfirm();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users');
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm('Hapus user ini? Semua transaksi & kategori miliknya juga akan terhapus.');
    if (!ok) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
      showToast('User berhasil dihapus.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus user.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400">
        <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" /> Memuat data...
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h1 className="text-lg font-semibold text-slate-800">Kelola Akun</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar pengguna terdaftar dan aksi administratif.</p>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/70 text-gray-500 text-left border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Nama</th>
              <th className="px-6 py-3 font-medium">Username</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.slice((currentPage - 1) * perPage, currentPage * perPage).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-3.5 text-gray-700">{u.name}</td>
                <td className="px-6 py-3.5 text-gray-500">@{u.username}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-income/10 text-income' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setResetTarget(u)}
                      className="text-gray-300 hover:text-income transition-colors"
                      title="Reset password"
                    >
                      <FontAwesomeIcon icon={faKey} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-gray-300 hover:text-expense transition-colors"
                      title="Hapus user"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        {users.length > perPage && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, users.length)} dari {users.length}</div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-lg bg-gray-100 text-sm">Prev</button>
              <div className="text-sm text-slate-600">{currentPage} / {Math.max(1, Math.ceil(users.length / perPage))}</div>
              <button disabled={currentPage === Math.max(1, Math.ceil(users.length / perPage))} onClick={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil(users.length / perPage)), p + 1))} className="px-3 py-1 rounded-lg bg-gray-100 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}
    </>
  );
}
