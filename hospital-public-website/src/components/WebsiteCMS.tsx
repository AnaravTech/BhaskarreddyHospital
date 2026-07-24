import React, { useState } from 'react';
import { useWebsite } from '../context/WebsiteContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const WebsiteCMS: React.FC = () => {
  const {
    doctors,
    blogPosts,
    contactInquiries,
    addBlogPost,
    addToast,
    setActiveView,
  } = useWebsite();

  const [activeCmsTab, setActiveCmsTab] = useState<'dashboard' | 'doctors' | 'blog' | 'inquiries'>('dashboard');

  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Cardiology');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogAuthor, setNewBlogAuthor] = useState('Dr. Vikram Reddy, MD, DM');

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle) return;

    addBlogPost({
      title: newBlogTitle,
      category: newBlogCategory,
      author: newBlogAuthor,
      date: '2026-07-24',
      excerpt: newBlogExcerpt || 'Medical insight for patient wellness and preventive care.',
      content: 'Detailed clinical advice and preventive healthcare guidelines...',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      seoTitle: `${newBlogTitle} | Bhaskar Reddy Hospital`,
      seoDescription: newBlogExcerpt,
      status: 'Published',
    });

    setNewBlogTitle('');
    setNewBlogExcerpt('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 md:px-12 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Website CMS & Content Admin Center</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('public-website')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
          >
            🌐 Public Patient Website
          </button>
          <button
            onClick={() => setActiveView('website-cms')}
            className="px-2.5 py-1 rounded bg-cyan-600 text-white font-bold text-[10px]"
          >
            ⚙️ Website CMS Admin
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-w-0">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2 shrink-0">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="font-extrabold text-white text-sm">Bhaskar Reddy CMS</h2>
            <p className="text-[10px] text-slate-400">Content Management & SEO Studio</p>
          </div>

          <div className="space-y-1 pt-2">
            {[
              { id: 'dashboard', label: 'CMS Dashboard', icon: LayoutDashboard },
              { id: 'doctors', label: 'Doctor Profiles & SEO', icon: Users },
              { id: 'blog', label: 'Blog & Health Articles', icon: FileText },
              { id: 'inquiries', label: 'Patient Leads', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCmsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCmsTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 bg-slate-950 overflow-y-auto space-y-6">
          {activeCmsTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Website Traffic & Conversion</h2>
                  <p className="text-xs text-slate-400">Visitor telemetry and appointment booking conversions</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                  Site Online: 99.98%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Total Monthly Visitors</div>
                  <div className="text-2xl font-black text-white font-mono">142,850</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Online Appointments</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">1,480</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Conversion Rate</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">3.8%</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Pending Leads</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">{contactInquiries.length}</div>
                </div>
              </div>
            </div>
          )}

          {activeCmsTab === 'doctors' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Doctor Directory & SEO Slug Management</h3>
              <div className="space-y-2 text-xs">
                {doctors.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={doc.image} alt={doc.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-100">{doc.name}</div>
                        <div className="text-[10px] text-cyan-400">{doc.specialization}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                      /doctors/{doc.name.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCmsTab === 'blog' && (
            <form onSubmit={handleCreateBlog} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs max-w-3xl">
              <h3 className="text-base font-bold text-white">Publish New Article to Hospital Website</h3>
              <div>
                <label className="block text-slate-400 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  placeholder="Article title"
                  value={newBlogTitle}
                  onChange={(e) => setNewBlogTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="Summary of health insights..."
                  value={newBlogExcerpt}
                  onChange={(e) => setNewBlogExcerpt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold">
                Publish Article
              </button>
            </form>
          )}

          {activeCmsTab === 'inquiries' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Website Contact Lead Desk ({contactInquiries.length})</h3>
              <div className="space-y-3 text-xs">
                {contactInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-slate-100">{inq.name} ({inq.phone})</div>
                    <p className="text-slate-300">{inq.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
