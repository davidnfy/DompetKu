const OPTIONS = [7, 14, 21, 30];

export default function FilterChips({ value, onChange }) {
  return (
    <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-fit">
      {OPTIONS.map((days) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === days
              ? 'bg-income text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {days} Hari
        </button>
      ))}
    </div>
  );
}
