import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCircleNotch, faXmark } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';
import { getIcon } from '../../utils/iconMap';
import IconPicker from '../../components/IconPicker';
import ModalPortal from '../../components/ModalPortal';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;
  const confirm = useConfirm();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/categories');
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm('Hapus kategori ini?');
    if (!ok) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      await load();
      showToast('Kategori berhasil dihapus.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus kategori.', 'error');
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
      <div className="flex justify-end p-4 border-b border-gray-100">
        <button
          onClick={() => setShowCreate(true)}
          className="bg-income hover:bg-income/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Kategori Sistem Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/70 text-gray-500 text-left border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Kategori</th>
              <th className="px-6 py-3 font-medium">Tipe</th>
              <th className="px-6 py-3 font-medium">Pemilik</th>
              <th className="px-6 py-3 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.slice((currentPage - 1) * perPage, currentPage * perPage).map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-2.5 text-gray-700">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                      <FontAwesomeIcon icon={getIcon(cat.icon)} className="text-xs" />
                    </span>
                    {cat.name}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cat.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                    {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-gray-500">
                  {cat.user ? `@${cat.user.username}` : <span className="text-gray-300">Sistem</span>}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-gray-300 hover:text-expense transition-colors"
                    title="Hapus kategori"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length > perPage && (
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, categories.length)} dari {categories.length}</div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-lg bg-gray-100 text-sm">Prev</button>
            <div className="text-sm text-slate-600">{currentPage} / {Math.max(1, Math.ceil(categories.length / perPage))}</div>
            <button disabled={currentPage === Math.max(1, Math.ceil(categories.length / perPage))} onClick={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil(categories.length / perPage)), p + 1))} className="px-3 py-1 rounded-lg bg-gray-100 text-sm">Next</button>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateSystemCategoryModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </>
  );
}

function CreateSystemCategoryModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('fa-tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/categories', { name: name.trim(), icon, type });
      await onCreated();
      showToast('Kategori sistem berhasil ditambahkan.', 'success');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Kategori Sistem Baru</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {error && (
            <div className="text-sm text-expense bg-expense/10 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Nama Kategori
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-all"
                placeholder="Masukkan nama kategori"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Tipe
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    type === 'income' ? 'bg-income text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    type === 'expense' ? 'bg-expense text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Pilih Ikon
              </label>
              <div className="mt-1">
                <IconPicker value={icon} onChange={setIcon} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-income hover:bg-income/90 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
              Simpan Kategori
            </button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}