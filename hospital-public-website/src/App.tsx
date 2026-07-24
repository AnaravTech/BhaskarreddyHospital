import React from 'react';
import { WebsiteProvider, useWebsite } from './context/WebsiteContext';
import { PublicWebsite } from './components/PublicWebsite';
import { WebsiteCMS } from './components/WebsiteCMS';
import { X, CheckCircle2, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, toasts, removeToast } = useWebsite();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {activeView === 'public-website' ? <PublicWebsite /> : <WebsiteCMS />}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.slice(0, 3).map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-start gap-3"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}

            <div className="flex-1 pr-2">
              <div className="text-xs font-bold text-slate-100">{toast.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{toast.message}</div>
            </div>

            <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WebsiteProvider>
      <AppContent />
    </WebsiteProvider>
  );
}
