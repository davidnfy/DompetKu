import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../utils/format';
import { getIcon } from '../utils/iconMap';

export default function TransactionTable({ transactions, type, onDelete, onEdit }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const accentTextClass = type === 'income' ? 'text-emerald-700' : 'text-red-700';
  const accentBgClass = type === 'income' ? 'bg-emerald-100' : 'bg-red-100';

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100/80 text-gray-500 text-left border-none">
            <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider border-none">Tanggal</th>
            <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider border-none">Kategori</th>
            <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider border-none">Catatan</th>
            <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-right border-none">Jumlah</th>
            <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-center border-none">Aksi</th>
          </tr>
        </thead>
        <tbody className="border-none">
          {paginatedTransactions.map((trx) => (
            <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors border-none">
              <td className="px-6 py-4 text-gray-500 whitespace-nowrap border-none">
                {new Date(trx.transaction_date).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).replace('.', ':')}
              </td>
              <td className="px-6 py-4 border-none">
                <span className="inline-flex items-center gap-2.5 text-gray-700">
                  <span className={`w-7 h-7 rounded-lg ${accentBgClass} flex items-center justify-center shrink-0`}>
                    <FontAwesomeIcon icon={getIcon(trx.category?.icon)} className={`text-xs ${accentTextClass}`} />
                  </span>
                  {trx.category?.name}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 max-w-xs truncate border-none">
                {trx.description || '-'}
              </td>
              <td className={`px-6 py-4 text-right font-bold ${accentTextClass} border-none`}>
                {type === 'income' ? '+' : '-'} {formatCurrency(trx.amount)}
              </td>
              <td className="px-6 py-4 border-none">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(trx)}
                    className="text-gray-300 hover:text-emerald-700 transition-colors"
                    title="Edit transaksi"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    onClick={() => onDelete(trx.id)}
                    className="text-gray-300 hover:text-red-700 transition-colors"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 text-xs text-gray-500 font-bold">
          <div>
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, transactions.length)} dari {transactions.length} transaksi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="text-gray-700 font-bold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
