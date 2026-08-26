import React, { createContext, useContext, useState, useCallback } from 'react';
import ModalPortal from '../components/ModalPortal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '' });
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((message, title = 'Konfirmasi') => {
    return new Promise((resolve) => {
      setState({ open: true, title, message });
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result) => {
    setState({ open: false, title: '', message: '' });
    if (resolver) resolver(result);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state.open && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-slate-800 mb-2">{state.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{state.message}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => handleClose(false)} className="px-3 py-1.5 rounded-md bg-gray-100 text-sm touch-target">Batal</button>
                <button onClick={() => handleClose(true)} className="px-3 py-1.5 rounded-md bg-rose-500 text-white text-sm touch-target">Hapus</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
