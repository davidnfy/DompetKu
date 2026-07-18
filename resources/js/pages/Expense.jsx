import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

export default function Expense() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [catRes, trxRes] = await Promise.all([
      api.get('/categories', { params: { type: 'expense' } }),
      api.get('/transactions', { params: { type: 'expense' } }),
    ]);
    setCategories(catRes.data);
    setTransactions(trxRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirm = useConfirm();

  const handleCreate = async (payload) => {
    if (editingTransaction) {
      await api.put(`/transactions/${editingTransaction.id}`, payload);
      showToast('Transaksi pengeluaran berhasil diperbarui.', 'success');
    } else {
      await api.post('/transactions', payload);
      showToast('Transaksi pengeluaran berhasil dicatat.', 'success');
    }
    await loadData();
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Hapus transaksi ini?');
    if (!ok) return;
    await api.delete(`/transactions/${id}`);
    showToast('Transaksi berhasil dihapus.', 'success');
    await loadData();
  };

  const handleCreateCategory = async (payload) => {
    await api.post('/categories', payload);
    showToast('Kategori baru berhasil ditambahkan.', 'success');
    await loadData();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary-800">Pengeluaran</h1>

        {/* Form dengan border dan hover effect */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
          <TransactionForm
            type="expense"
            categories={categories}
            onSubmit={handleCreate}
            onCreateCategory={handleCreateCategory}
            editingTransaction={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
          />
        </div>

        {/* Riwayat dengan border dan hover effect */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700">Riwayat Pengeluaran</h2>
            
            {!loading && transactions.length > 0 && (
              <span className="text-xs text-slate-400">
                Total: {transactions.length} transaksi
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 mr-2"></div>
              Memuat data...
            </div>
          ) : (
            <>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>Belum ada data pengeluaran</p>
                  <p className="text-xs mt-1">Mulai tambahkan pengeluaran pertama Anda</p>
                </div>
              ) : (
                <TransactionTable
                  transactions={transactions}
                  type="expense"
                  onDelete={handleDelete}
                  onEdit={setEditingTransaction}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}