import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import IconPicker from './IconPicker';
import ModalPortal from './ModalPortal';

export default function CategoryModal({ type, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('fa-tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accentClass = type === 'income' ? 'bg-income hover:bg-income/90' : 'bg-expense hover:bg-expense/90';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), icon, type });
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
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Tambah Kategori {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                placeholder="Contoh: Langganan Musik"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Pilih Ikon
              </label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${accentClass} text-white text-sm font-medium w-full py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2`}
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