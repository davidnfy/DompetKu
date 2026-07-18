import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { getIcon } from '../utils/iconMap';

export default function CategorySelect({ categories, value, onChange, accentClass }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = categories.find((c) => String(c.id) === String(value));

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-left bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow"
      >
        {selected ? (
          <>
            <span className={`w-7 h-7 rounded-lg ${accentClass} bg-opacity-10 flex items-center justify-center shrink-0`}>
              <FontAwesomeIcon icon={getIcon(selected.icon)} className={`text-xs ${accentClass}`} />
            </span>
            <span className="text-gray-700 truncate">{selected.name}</span>
          </>
        ) : (
          <span className="text-gray-400 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCircleDot} className="text-gray-300" />
            Pilih kategori
          </span>
        )}
        <FontAwesomeIcon icon={faChevronDown} className={`ml-auto text-xs text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-lg py-1.5">
          {categories.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Belum ada kategori.</p>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onChange(cat.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                String(cat.id) === String(value) ? 'bg-gray-50' : ''
              }`}
            >
              <span className={`w-7 h-7 rounded-lg ${accentClass} bg-opacity-10 flex items-center justify-center shrink-0`}>
                <FontAwesomeIcon icon={getIcon(cat.icon)} className={`text-xs ${accentClass}`} />
              </span>
              <span className="text-gray-700 truncate">{cat.name}</span>
              {!cat.user_id && (
                <span className="ml-auto text-[10px] text-gray-300 font-medium">Sistem</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
