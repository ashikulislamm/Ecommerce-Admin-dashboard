'use client';

import React from 'react';
import { useToastStore } from '@/lib/toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform animate-in slide-in-from-top-3 ${
            t.type === 'success'
              ? 'bg-white/95 border-emerald-200 text-slate-900 shadow-emerald-900/5'
              : t.type === 'error'
              ? 'bg-white/95 border-rose-200 text-slate-900 shadow-rose-900/5'
              : t.type === 'warning'
              ? 'bg-white/95 border-amber-200 text-slate-900 shadow-amber-900/5'
              : 'bg-white/95 border-sky-200 text-slate-900 shadow-sky-900/5'
          }`}
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-sky-600" />}
          </div>

          {/* Message & Title */}
          <div className="flex-1 text-xs">
            {t.title && <h4 className="font-bold text-slate-900 mb-0.5">{t.title}</h4>}
            <p className="font-medium text-slate-700 leading-relaxed">{t.message}</p>
          </div>

          {/* Close */}
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
