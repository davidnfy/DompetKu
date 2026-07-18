import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

// Palet warna untuk tiap kategori pengeluaran (donut chart)
const COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'];

export default function DonutChart({ categoryBreakdown }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data pengeluaran pada periode ini.
      </div>
    );
  }

  const data = {
    labels: categoryBreakdown.map((c) => c.category_name),
    datasets: [
      {
        data: categoryBreakdown.map((c) => c.total_amount),
        backgroundColor: categoryBreakdown.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
  };

  return (
    <div className="h-72">
      <Doughnut data={data} options={options} />
    </div>
  );
}
