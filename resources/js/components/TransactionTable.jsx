import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../utils/format';
import { getIcon } from '../utils/iconMap';

export default function TransactionTable({ transactions, type, onDelete, onEdit }) {
  const accentTextClass = type === 'income' ? 'text-income' : 'text-expense';
  const accentBgClass = type === 'income' ? 'bg-income/10' : 'bg-expense/10';

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400 text-sm border border-gray-100">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50/70 text-gray-500 text-left">
            <th className="px-6 py-3 font-medium">Tanggal</th>
            <th className="px-6 py-3 font-medium">Kategori</th>
            <th className="px-6 py-3 font-medium">Catatan</th>
            <th className="px-6 py-3 font-medium text-right">Jumlah</th>
            <th className="px-6 py-3 font-medium text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((trx) => (
            <tr key={trx.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                {new Date(trx.transaction_date).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-6 py-3.5">
                <span className="inline-flex items-center gap-2.5 text-gray-700">
                  <span className={`w-7 h-7 rounded-lg ${accentBgClass} flex items-center justify-center shrink-0`}>
                    <FontAwesomeIcon icon={getIcon(trx.category?.icon)} className={`text-xs ${accentTextClass}`} />
                  </span>
                  {trx.category?.name}
                </span>
              </td>
              <td className="px-6 py-3.5 text-gray-400 max-w-xs truncate">
                {trx.description || '-'}
              </td>
              <td className={`px-6 py-3.5 text-right font-semibold ${accentTextClass}`}>
                {type === 'income' ? '+' : '-'} {formatCurrency(trx.amount)}
              </td>
              <td className="px-6 py-3.5">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(trx)}
                    className="text-gray-300 hover:text-income transition-colors"
                    title="Edit transaksi"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    onClick={() => onDelete(trx.id)}
                    className="text-gray-300 hover:text-expense transition-colors"
                    title="Hapus transaksi"
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
  );
}
