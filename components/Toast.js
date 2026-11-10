'use client';

import { useBilling } from '@/context/BillingContext';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './Icons';

export default function Toast() {
  const { toast } = useBilling();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold max-w-sm ${
          isSuccess
            ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
            : isWarning
            ? 'bg-amber-950 text-amber-100 border-amber-800'
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}
      >
        {isSuccess && <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
        {isWarning && <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 shrink-0" />}
        {isInfo && <CheckCircleIcon className="w-4 h-4 text-blue-400 shrink-0" />}
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
