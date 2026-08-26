import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatCurrency, formatShortDate } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function LineChartComponent({ dailyTrend }) {
  const data = {
    labels: dailyTrend.map((d) => formatShortDate(d.date)),
    datasets: [
      {
        label: 'Pemasukan',
        data: dailyTrend.map((d) => d.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Pengeluaran',
        data: dailyTrend.map((d) => d.expense),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(value, true),
          font: { size: 10 },
        },
        grid: { color: '#F3F4F6' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  );
}
