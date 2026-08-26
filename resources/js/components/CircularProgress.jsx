import { formatCurrency } from '../utils/format';

export default function CircularProgress({ balance, remainingPercentage, expensePercentage, totalIncome }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasIncome = totalIncome > 0;

  const remainingLength = hasIncome ? (Math.max(remainingPercentage, 0) / 100) * circumference : 0;
  const expenseLength = hasIncome ? (Math.min(expensePercentage, 100) / 100) * circumference : 0;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />
          {hasIncome && (
            <>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#EF4444"
                strokeWidth={strokeWidth}
                strokeDasharray={`${expenseLength} ${circumference - expenseLength}`}
                strokeLinecap="round"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${remainingLength} ${circumference - remainingLength}`}
                strokeDashoffset={-expenseLength}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400 mb-1">Sisa Saldo</span>
          <span className={`text-lg font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 mt-6 text-xs w-full max-w-[220px]">
        <div className="flex items-center gap-2 w-full">
          <span className="w-2.5 h-2.5 rounded-full bg-income inline-block shrink-0" />
          <span className="text-gray-600">Sisa</span>
          <span className="ml-auto font-medium text-gray-700">{hasIncome ? remainingPercentage : 0}%</span>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="w-2.5 h-2.5 rounded-full bg-expense inline-block shrink-0" />
          <span className="text-gray-600">Pengeluaran</span>
          <span className="ml-auto font-medium text-gray-700">{hasIncome ? expensePercentage : 0}%</span>
        </div>
      </div>
    </div>
  );
}