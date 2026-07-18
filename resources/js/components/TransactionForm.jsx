import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import CategorySelect from './CategorySelect';
import CategoryModal from './CategoryModal';

/**
 * Form input transaksi, dipakai ulang di halaman Income & Expense.
 * type: 'income' | 'expense'
 * editingTransaction: kalau ada isinya, form otomatis masuk mode edit
 * onCancelEdit: dipanggil saat user membatalkan edit
 */
export default function TransactionForm({
  type,
  categories,
  onSubmit,
  onCreateCategory,
  editingTransaction,
  onCancelEdit,
}) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const isEditing = Boolean(editingTransaction);
  const accentClass = type === 'income' ? 'bg-income hover:bg-income/90' : 'bg-expense hover:bg-expense/90';

  // Saat editingTransaction berubah (user klik "Edit" di tabel), isi form otomatis
  useEffect(() => {
    if (editingTransaction) {
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id ?? editingTransaction.category?.id ?? '');
      setTransactionDate(
        new Date(editingTransaction.transaction_date).toISOString().slice(0, 16)
      );
      setDescription(editingTransaction.description || '');
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setAmount('');
    setCategoryId('');
    setDescription('');
    setTransactionDate(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !categoryId || !transactionDate) {
      setError('Mohon lengkapi semua field wajib.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        category_id: categoryId,
        transaction_date: transactionDate.replace('T', ' ') + ':00',
        description,
      });
      resetForm();
      if (isEditing) onCancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setError('');
    onCancelEdit();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faXmark} /> Batalkan edit
            </button>
          )}
        </div>

        {error && (
          <div className="text-sm text-expense bg-expense/10 px-4 py-2 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Jumlah (Rp)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-600">Kategori</label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-xs text-income hover:text-income/80 flex items-center gap-1 font-medium"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[10px]" /> Kategori baru
              </button>
            </div>
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              accentClass={type === 'income' ? 'text-income' : 'text-expense'}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Tanggal & Jam</label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Catatan (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={1}
              placeholder="Catatan tambahan"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`${accentClass} text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2`}
          >
            {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
            {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-medium px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {showCategoryModal && (
        <CategoryModal
          type={type}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={onCreateCategory}
        />
      )}
    </>
  );
}
