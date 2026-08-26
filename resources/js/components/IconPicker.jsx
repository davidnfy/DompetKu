import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_GROUPS, getIcon } from '../utils/iconMap';

export default function IconPicker({ value, onChange }) {
  return (
    <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-3 bg-gray-50/50">
      {ICON_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            {group.label}
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {group.icons.map((iconName) => {
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-income text-white shadow-sm scale-105'
                      : 'bg-white text-gray-500 hover:bg-income/10 hover:text-income border border-gray-100'
                  }`}
                  title={iconName}
                >
                  <FontAwesomeIcon icon={getIcon(iconName)} className="text-sm" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
