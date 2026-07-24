import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Bell, X, Siren, CheckCircle2, Info, AlertTriangle, Trash2 } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { isNotificationOpen, setIsNotificationOpen, toasts, removeToast } = useHospital();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">Live Hospital Alerts</h3>
        </div>
        <button
          onClick={() => setIsNotificationOpen(false)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {toasts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No active alerts at this moment.
          </div>
        ) : (
          toasts.map((toast) => {
            const getIcon = () => {
              switch (toast.type) {
                case 'warning':
                  return <Siren className="w-4 h-4 text-rose-400 shrink-0" />;
                case 'success':
                  return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                case 'error':
                  return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
                default:
                  return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
              }
            };

            return (
              <div
                key={toast.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition relative group"
              >
                <div className="flex items-start gap-2.5">
                  {getIcon()}
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-semibold text-slate-200">{toast.title}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 inline-block">
                      {toast.timestamp}
                    </span>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-300 transition opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
