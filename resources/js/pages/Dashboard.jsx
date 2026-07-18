import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faScaleBalanced,
  faCircleNotch,
  faChartPie,
  faChartLine,
  faCircleDollarToSlot,
  faPlus,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import FilterChips from '../components/FilterChips';
import DonutChart from '../components/DonutChart';
import CircularProgress from '../components/CircularProgress';
import LineChartComponent from '../components/LineChartComponent';
import api from '../api/axios';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
 
export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/dashboard', { params: { days } });
        if (!ignore) setData(data);
      } catch (err) {
        if (!ignore) {
          setError('Gagal memuat data dashboard.');
          showToast('Gagal memuat data dashboard.', 'error');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, [days]);

  return (
    <AppLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">
              Halo, {user?.name || 'Pengguna'} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">Berikut ringkasan keuanganmu</p>
          </div>
          <FilterChips value={days} onChange={setDays} />
        </div>

        {error && (
          <div className="text-sm text-expense bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl animate-fade-in font-medium">
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2 text-lg" />
            Memuat data dashboard...
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500 font-medium">
                <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faCircleDollarToSlot} className="text-slate-400" />
                </span>
                <span>
                  Rata-rata pengeluaran harian ({days} hari terakhir):{' '}
                  <span className="font-bold text-expense">
                    {formatCurrency(data.average_daily_expense)}
                  </span>
                  <span className="mx-2 text-slate-300 hidden sm:inline">•</span>
                  Rata-rata pemasukan harian:{' '}
                  <span className="font-bold text-income">
                    {formatCurrency(data.average_daily_income)}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <SummaryCard
                label="Total Pemasukan"
                value={data.total_income}
                icon={faArrowTrendUp}
                colorClass="text-accent-600"
                bgClass="bg-gradient-to-br from-accent-50 to-white"
                iconBg="bg-accent-100/70"
              />
              <SummaryCard
                label="Total Pengeluaran"
                value={data.total_expense}
                icon={faArrowTrendDown}
                colorClass="text-expense"
                bgClass="bg-gradient-to-br from-rose-50 to-white"
                iconBg="bg-rose-100/70"
              />
              <SummaryCard
                label="Sisa Saldo"
                value={data.balance}
                icon={faScaleBalanced}
                colorClass={data.balance >= 0 ? 'text-accent-600' : 'text-expense'}
                bgClass={data.balance >= 0 ? 'bg-gradient-to-br from-accent-50/40 to-white' : 'bg-gradient-to-br from-rose-50/40 to-white'}
                iconBg={data.balance >= 0 ? 'bg-accent-100/40' : 'bg-rose-100/40'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/income" 
                className="p-5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 rounded-3xl text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-base">Tambah Pemasukan</h3>
                  <p className="text-xs text-slate-100 mt-1">Catat gaji, bonus, atau profit bisnis</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </Link>

              <Link 
                to="/shopping-list" 
                className="p-5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 rounded-3xl text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-base">Daftar Belanja</h3>
                  <p className="text-xs text-slate-100 mt-1">Kelola kebutuhan belanja terintegrasi</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartPie} className="text-expense text-sm" />
                  </span>
                  <h2 className="text-sm font-bold text-slate-700">
                    Rincian Kategori Pengeluaran
                  </h2>
                </div>
                <DonutChart categoryBreakdown={data.category_breakdown} />
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faScaleBalanced} className="text-white text-xs" />
                  </span>
                  <h2 className="text-sm font-bold text-slate-700">Sisa Uang</h2>
                </div>
                <CircularProgress
                  balance={data.balance}
                  remainingPercentage={data.remaining_percentage}
                  expensePercentage={data.expense_percentage}
                  totalIncome={data.total_income}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faChartLine} className="text-slate-500 text-sm" />
                </span>
                <h2 className="text-sm font-bold text-slate-700">
                  Tren Pemasukan & Pengeluaran Harian
                </h2>
              </div>
              <LineChartComponent dailyTrend={data.daily_trend} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value, icon, colorClass, bgClass, iconBg }) {
  return (
    <div className={`${bgClass} rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
        <FontAwesomeIcon icon={icon} className={`${colorClass} text-lg`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
        <p className={`text-xl font-extrabold ${colorClass} truncate`}>{formatCurrency(value)}</p>
      </div>
    </div>
  );
}