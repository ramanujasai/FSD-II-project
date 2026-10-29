import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, onDismiss, className = '' }) => {
  const styles = {
    info: {
      bg: 'bg-[#131b2e] border border-blue-500/30 text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
      subtext: 'text-blue-200/80'
    },
    success: {
      bg: 'bg-[#12281a] border border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      subtext: 'text-emerald-200/80'
    },
    warning: {
      bg: 'bg-[#2a1c0d] border border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
      subtext: 'text-amber-200/80'
    },
    error: {
      bg: 'bg-[#2a1118] border border-rose-500/30 text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
      subtext: 'text-rose-200/80'
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1 text-xs">
        {title && <h5 className="font-semibold text-white mb-0.5">{title}</h5>}
        {message && <div className={current.subtext}>{message}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-white p-0.5 rounded transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
