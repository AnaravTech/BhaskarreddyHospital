import React from 'react';
import { Volume2, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const TokenDisplay = ({
  tokens = [],
  currentToken = null,
  onCallToken,
  department = 'OPD Consultation',
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-slate-100 text-sm">{department} Live Token Board</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time digital patient queue</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
          <Users className="w-3.5 h-3.5" />
          <span>{tokens.length} In Queue</span>
        </div>
      </div>

      {/* Main Calling Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col justify-between">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Now Serving
          </span>
          <div className="my-2">
            <div className="text-4xl font-black text-cyan-300 font-mono tracking-tight">
              {currentToken ? currentToken.tokenNumber || `#${currentToken.token}` : 'T-014'}
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
              {currentToken ? currentToken.patientName : 'Ravi Varma'}
            </div>
            <div className="text-[11px] text-slate-400">
              {currentToken ? currentToken.doctorName : 'Dr. Vikram Reddy (Room 102)'}
            </div>
          </div>
          {onCallToken && (
            <button
              onClick={() => onCallToken(currentToken)}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Volume2 className="w-3.5 h-3.5" /> Call Patient Announcement
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Next Up In Line
          </span>
          <div className="my-2">
            <div className="text-3xl font-bold text-slate-300 font-mono">
              {tokens[1]?.tokenNumber || 'T-015'}
            </div>
            <div className="text-xs font-semibold text-slate-300 mt-1 truncate">
              {tokens[1]?.patientName || 'Sunita Sharma'}
            </div>
            <div className="text-[11px] text-slate-500">
              Estimated wait: ~8 mins
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg consultation time: 10 mins</span>
          </div>
        </div>
      </div>

      {/* Queue Mini List */}
      {tokens.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {tokens.slice(0, 5).map((tok, idx) => (
            <div
              key={tok.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-cyan-400 w-12">
                  {tok.tokenNumber || `T-${String(idx + 1).padStart(3, '0')}`}
                </span>
                <span className="text-slate-200 font-medium truncate">{tok.patientName}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  idx === 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {idx === 0 ? 'Inside' : 'Waiting'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;
