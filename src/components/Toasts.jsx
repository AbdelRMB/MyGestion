import React from 'react';
import { useToast } from '../contexts/ToastContext';

export default function Toasts() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center justify-between gap-3 transition-opacity duration-200 ${
            t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-slate-800'
          }`}
        >
          <div className="flex-1 pr-4">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/80 hover:text-white px-2 py-1 rounded"
            aria-label="close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
