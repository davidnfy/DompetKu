import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function PasswordInput({ value, onChange, placeholder, className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-income/40 transition-shadow ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} className="text-sm" />
      </button>
    </div>
  );
}
