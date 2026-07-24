import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  BrainCircuit,
  TrendingUp,
  BedDouble,
  FileText,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  quickActionPrompt?: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, beds, patients, invoices } = useHospital();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello Dr. Reddy! I am **Anarav AI Health Copilot**. I have real-time access to hospital occupancy, patient UHID charts, insurance authorizations, and billing metrics. How can I assist your operational decisions today?",
      timestamp: '10:00 AM',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isAiDrawerOpen) return null;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const icuOccupied = beds.filter((b) => b.bedType === 'ICU' && b.status === 'Occupied').length;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      const lower = query.toLowerCase();

      if (lower.includes('bed') || lower.includes('occupancy') || lower.includes('icu')) {
        responseText = `📊 **Real-time Bed Occupancy Insight**:\n\n• **Overall Occupancy**: ${occupiedBeds}/${beds.length} beds occupied (${Math.round((occupiedBeds/beds.length)*100)}%).\n• **ICU Capacity**: ${icuOccupied} out of 4 ICU beds are currently in active use.\n• **Recommendation**: Bed ICU-102 is available and sanitized for incoming cardiac emergencies. Bed ICU-103 is undergoing deep disinfection.`;
      } else if (lower.includes('revenue') || lower.includes('billing') || lower.includes('collection')) {
        responseText = `💰 **Revenue & Collections Overview**:\n\n• **Today's Collections**: ₹${totalRevenue.toLocaleString()} processed across OP and IP counters.\n• **Multi-Mode Distribution**: 45% UPI, 35% Insurance Cashless, 20% Cash.\n• **Pending Settlement**: ₹85,000 approved from Star Health TPA awaiting final hospital discharge disbursement.`;
      } else if (lower.includes('patient') || lower.includes('summary') || lower.includes('srinivas')) {
        const pat = patients.find((p) => p.name.includes('Srinivas') || p.uhid.includes('9012'));
        responseText = `🩺 **Clinical Summary for ${pat?.name || 'Srinivas Goud'} (UHID: ${pat?.uhid})**:\n\n• **Admission**: Admitted on July 22, 2026 to Cardiac ICU-101.\n• **Diagnosis**: Acute Coronary Syndrome (Unstable Angina).\n• **Attending**: Dr. Vikram Reddy.\n• **Allergies**: No known drug allergies.\n• **Insurance Pre-Auth**: Star Health ₹85,000 Approved.`;
      } else {
        responseText = `⚡ **AI Analysis Output**:\n\nI have analyzed your query "${query}". All hospital sub-systems (OPD, IPD, TPA Insurance, Cash Counter) are operational and synchronized with 0 latency. You can trigger automated SMS/WhatsApp alerts for returning OP follow-up patients or inspect floor cleanliness metrics.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const samplePrompts = [
    { title: 'Check ICU Occupancy Status', icon: BedDouble, prompt: 'What is the current bed occupancy in ICU & Private Wards?' },
    { title: 'Summarize Patient Srinivas Goud', icon: FileText, prompt: 'Give me a clinical summary of patient Srinivas Goud' },
    { title: 'Analyze Revenue & Collections', icon: TrendingUp, prompt: 'Provide a breakdown of today revenue and insurance settlements' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Anarav AI Copilot
              <span className="px-1.5 py-0.2 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-mono">
                GPT-4o Medical
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Natural Language Clinical & Operations Intelligence</p>
          </div>
        </div>
        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Suggested Copilot Queries
        </div>
        <div className="space-y-1">
          {samplePrompts.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(sp.prompt)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition text-xs text-slate-300 hover:text-white group"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{sp.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[9px] mt-1.5 font-mono ${
                  msg.sender === 'user' ? 'text-cyan-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300 animate-spin" />
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Anarav Copilot..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
