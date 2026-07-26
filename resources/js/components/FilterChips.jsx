import React from 'react';

export default function FilterChips({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  const getTodayLocalDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
  };

  const todayStr = getTodayLocalDate();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm w-full sm:w-auto">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-1 rounded-lg uppercase shrink-0">DARI</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none w-full cursor-pointer"
        />
      </div>
      <span className="text-gray-300 hidden sm:inline mx-1">⇄</span>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-1 rounded-lg uppercase shrink-0">SAMPAI</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none w-full cursor-pointer"
          max={todayStr}
        />
      </div>
    </div>
  );
}
