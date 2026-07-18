import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faWallet, faBell } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

export default function MobileHeader({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-primary-800 text-white shadow-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-11 h-11 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none touch-target"
          aria-label="Menu"
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faWallet} className="text-white text-xs" />
          </div>
          <span className="font-bold tracking-tight text-base">DompetKu</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-100 border border-accent-500/30">
          {user?.username || 'User'}
        </span>
      </div>
    </header>
  );
}
