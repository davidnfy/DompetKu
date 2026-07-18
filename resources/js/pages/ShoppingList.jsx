import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faTrash,
  faPlus,
  faCircleNotch,
  faCheck,
  faPen,
  faSave,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

export default function ShoppingList() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  // Edit item states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const loadItems = async () => {
    try {
      const { data } = await api.get('/shopping-list');
      setItems(data);
    } catch (err) {
      showToast('Gagal memuat daftar belanja.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const confirm = useConfirm();

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !quantity) {
      showToast('Mohon lengkapi semua field.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/shopping-list', {
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
      });
      setName('');
      setPrice('');
      setQuantity('1');
      showToast('Barang berhasil ditambahkan ke daftar.', 'success');
      await loadItems();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan barang.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCheck = async (item) => {
    try {
      // Optimistic UI toggle
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, is_checked: !i.is_checked } : i))
      );
      await api.put(`/shopping-list/${item.id}/toggle`);
    } catch (err) {
      showToast('Gagal mengubah status barang.', 'error');
      // Revert if error
      await loadItems();
    }
  };

  const handleDeleteItem = async (id) => {
    const ok = await confirm('Hapus barang ini dari daftar?');
    if (!ok) return;
    try {
      await api.delete(`/shopping-list/${id}`);
      showToast('Barang berhasil dihapus.', 'success');
      await loadItems();
    } catch (err) {
      showToast('Gagal menghapus barang.', 'error');
    }
  };

  const handleClearChecked = async () => {
    const ok = await confirm('Hapus semua barang yang telah dibeli?');
    if (!ok) return;
    try {
      await api.delete('/shopping-list/clear-checked');
      showToast('Barang selesai belanja dibersihkan.', 'success');
      await loadItems();
    } catch (err) {
      showToast('Gagal membersihkan barang.', 'error');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditQuantity(String(item.quantity));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim() || !editPrice || !editQuantity) {
      showToast('Isian edit tidak boleh kosong.', 'warning');
      return;
    }

    try {
      await api.put(`/shopping-list/${id}`, {
        name: editName.trim(),
        price: parseFloat(editPrice),
        quantity: parseInt(editQuantity, 10),
      });
      setEditingId(null);
      showToast('Barang berhasil diperbarui.', 'success');
      await loadItems();
    } catch (err) {
      showToast('Gagal memperbarui barang.', 'error');
    }
  };

  // Calculations
  const uncheckedItems = items.filter((i) => !i.is_checked);
  const totalShoppingPrice = uncheckedItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800 flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-600">
                <FontAwesomeIcon icon={faCartShopping} />
              </span>
              Daftar Belanja
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Catatan barang belanjaan terintegrasi
            </p>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
          <form onSubmit={handleAddItem} className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Tambah Barang Baru</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nama Barang</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all"
                  placeholder="Contoh: Susu Kotak, Beras, dll"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Jumlah</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-accent-500/15 hover:shadow-accent-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
                Tambah ke Daftar
              </button>
            </div>
          </form>
        </div>

        {/* Shopping List Items */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <FontAwesomeIcon icon={faCircleNotch} spin className="text-lg mr-2" />
              Memuat daftar belanja...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🛒</div>
              <p className="font-semibold text-sm">Daftar Belanja Masih Kosong</p>
              <p className="text-xs mt-1">Tambahkan item untuk mulai mencatat rencana belanjaan Anda</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 transition-colors ${
                    item.is_checked ? 'bg-slate-50/60' : 'hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleCheck(item)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                        item.is_checked
                          ? 'bg-accent-500 border-accent-500 text-white'
                          : 'border-slate-300 hover:border-accent-500 text-transparent'
                      }`}
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                    </button>

                    {/* Content Area / Inline Edit Form */}
                    {editingId === item.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="Harga"
                        />
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                          placeholder="Jumlah"
                        />
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <span
                          className={`font-semibold text-sm transition-all block break-words ${
                            item.is_checked ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.name}
                        </span>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{formatCurrency(item.price)}</span>
                          <span>•</span>
                          <span>Jumlah: {item.quantity}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions / Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-0 pl-9 shrink-0">
                    {!editingId && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">Subtotal</div>
                        <div className={`font-bold text-sm ${item.is_checked ? 'text-slate-400' : 'text-slate-800'}`}>
                          {formatCurrency(parseFloat(item.price) * item.quantity)}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-2 text-accent-600 hover:bg-accent-50 rounded-xl transition-all"
                            title="Simpan"
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            title="Batal"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faPen} className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sticky Total Footer */}
          {!loading && items.length > 0 && (
            <div className="bg-primary-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Total Estimasi Belanja</div>
                <div className="text-xs text-slate-400 mt-0.5">(Hanya menghitung barang yang belum dibeli)</div>
              </div>
              <div className="text-2xl font-black text-accent-400">
                {formatCurrency(totalShoppingPrice)}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
