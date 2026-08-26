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
  const getTodayLocalDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  };

  const getDaysAgoLocalDate = (daysCount) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const d = new Date(Date.now() - tzoffset);
    d.setDate(d.getDate() - daysCount);
    return d.toISOString().slice(0, 10);
  };

  const [startDate, setStartDate] = useState(getDaysAgoLocalDate(7));
  const [endDate, setEndDate] = useState(getTodayLocalDate());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      if (!startDate || !endDate) return;

      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/dashboard', {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        });
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
  }, [startDate, endDate]);

  return (
    <AppLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1b4d3e]">
              Halo, {user?.name || 'Pengguna'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Berikut ringkasan keuanganmu</p>
          </div>
          <FilterChips 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl animate-fade-in font-medium">
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
            <div className="bg-white rounded-2xl px-5 py-4 border border-gray-200/80 shadow-sm transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="w-8 h-8 rounded-xl bg-gray-150 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faCircleDollarToSlot} className="text-gray-400" />
                </span>
                <span>
                  Rata-rata pengeluaran harian ({data.period_days} hari):{' '}
                  <span className="font-bold text-red-700">
                    {formatCurrency(data.average_daily_expense)}
                  </span>
                  <span className="mx-2 text-gray-300 hidden sm:inline">•</span>
                  Rata-rata pemasukan harian:{' '}
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(data.average_daily_income)}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <SummaryCard
                label="Total pemasukan"
                value={data.total_income}
                icon={faArrowTrendUp}
                colorClass="text-emerald-700"
                valueColorClass="text-black"
                bgClass="bg-[#eefaf4]"
                iconBg="bg-emerald-100"
              />
              <SummaryCard
                label="Total Pengeluaran"
                value={data.total_expense}
                icon={faArrowTrendDown}
                colorClass="text-red-700"
                valueColorClass="text-red-700 font-bold"
                bgClass="bg-[#fff5f5]"
                iconBg="bg-red-100"
              />
              <SummaryCard
                label="Sisa uang"
                value={data.balance}
                icon={faScaleBalanced}
                colorClass="text-emerald-700"
                valueColorClass="text-emerald-700 font-bold"
                bgClass="bg-[#eefaf4]"
                iconBg="bg-emerald-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/income" 
                className="p-5 bg-[#1b4d3e] hover:bg-[#153b2f] rounded-2xl text-white shadow-sm transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-base">Tambah Pemasukan</h3>
                  <p className="text-xs text-gray-300 mt-0.5">Catat gaji, bonus, atau profit bisnis</p>
                </div>
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-transform">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </Link>

              <Link 
                to="/shopping-list" 
                className="p-5 bg-[#1b4d3e] hover:bg-[#153b2f] rounded-2xl text-white shadow-sm transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-base">Daftar belanja</h3>
                  <p className="text-xs text-gray-300 mt-0.5">Kelola kebutuhan belanja terintegrasi</p>
                </div>
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-transform">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartPie} className="text-red-600 text-sm" />
                  </span>
                  <h2 className="text-sm font-bold text-gray-700">
                    Rincian Kategori Pengeluaran
                  </h2>
                </div>
                <DonutChart categoryBreakdown={data.category_breakdown} />
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faScaleBalanced} className="text-emerald-700 text-xs" />
                  </span>
                  <h2 className="text-sm font-bold text-gray-700">Sisa uang</h2>
                </div>
                <CircularProgress
                  balance={data.balance}
                  remainingPercentage={data.remaining_percentage}
                  expensePercentage={data.expense_percentage}
                  totalIncome={data.total_income}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faChartLine} className="text-gray-500 text-sm" />
                </span>
                <h2 className="text-sm font-bold text-gray-700">
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

function SummaryCard({ label, value, icon, colorClass, valueColorClass, bgClass, iconBg }) {
  return (
    <div className={`${bgClass} rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-transparent`}>
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <FontAwesomeIcon icon={icon} className={`${colorClass} text-base`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-500 mb-0.5">{label}</p>
        <p className={`text-lg font-bold ${valueColorClass || 'text-black'} truncate`}>{formatCurrency(value)}</p>
      </div>
    </div>
  );
}