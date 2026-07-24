import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
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
    setAppMode,
  } = useHospital();

  const [activeCmsTab, setActiveCmsTab] = useState<'dashboard' | 'doctors' | 'departments' | 'slots' | 'blog' | 'inquiries'>('dashboard');

  // New Blog Article Form State
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
      readTime: '4 min read',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Top Portal Switcher Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 md:px-12 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Website CMS & Content Admin Center</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Switch Portal View:</span>
          <button
            onClick={() => setAppMode('public-website')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
          >
            🌐 Public Patient Website
          </button>
          <button
            onClick={() => setAppMode('website-cms')}
            className="px-2.5 py-1 rounded bg-cyan-600 text-white font-bold text-[10px]"
          >
            ⚙️ Website CMS Admin
          </button>
          <button
            onClick={() => setAppMode('hospital-os')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
          >
            🏥 Hospital OS Console
          </button>
        </div>
      </div>

      {/* Main CMS Layout */}
      <div className="flex-1 flex min-w-0">
        {/* CMS Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2 shrink-0">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="font-extrabold text-white text-sm">Bhaskar Reddy CMS</h2>
            <p className="text-[10px] text-slate-400">Content Management & SEO Studio</p>
          </div>

          <div className="space-y-1 pt-2">
            {[
              { id: 'dashboard', label: 'CMS Dashboard', icon: LayoutDashboard },
              { id: 'doctors', label: 'Doctor Profiles & SEO', icon: Users },
              { id: 'departments', label: 'Departments CMS', icon: Briefcase },
              { id: 'slots', label: 'Slot & Fee Configurator', icon: Calendar },
              { id: 'blog', label: 'Blog & Health Articles', icon: FileText },
              { id: 'inquiries', label: 'Website Patient Leads', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCmsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCmsTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CMS Content Workspace */}
        <main className="flex-1 p-6 md:p-8 bg-slate-950 overflow-y-auto space-y-6">
          
          {/* CMS Dashboard */}
          {activeCmsTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Website Traffic & Lead Conversion</h2>
                  <p className="text-xs text-slate-400">Real-time visitor telemetry and appointment booking conversions</p>
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
                  <div className="text-xs text-slate-400">Online Appointment Bookings</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">1,480</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Booking Conversion Rate</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">3.8%</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Pending Patient Callbacks</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">{contactInquiries.length}</div>
                </div>
              </div>

              {/* Popular Doctors & Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">Most Viewed Doctor Profiles</h3>
                  <div className="space-y-2 text-xs">
                    {doctors.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="font-bold text-slate-200">{doc.name}</span>
                        <span className="text-cyan-400 font-mono">2,410 views</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">Published Health Blog Articles</h3>
                  <div className="space-y-2 text-xs">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="font-bold text-slate-200 truncate max-w-xs">{post.title}</span>
                        <span className="text-emerald-400 font-bold">{post.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Profiles CMS */}
          {activeCmsTab === 'doctors' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Doctor Directory & SEO Slug Management</h3>
                <button
                  onClick={() => addToast('Doctor Added', 'New doctor profile added to CMS.', 'success')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                >
                  + Add Doctor Profile
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {doctors.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={doc.image} alt={doc.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-100">{doc.name}</div>
                        <div className="text-[10px] text-cyan-400">{doc.specialization} • {doc.qualification}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        /doctors/{doc.name.toLowerCase().replace(/\s+/g, '-')}
                      </span>
                      <button
                        onClick={() => addToast('SEO Updated', `Updated SEO slug for ${doc.name}`, 'info')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                      >
                        Edit SEO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blog CMS Studio */}
          {activeCmsTab === 'blog' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateBlog} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs max-w-3xl">
                <h3 className="text-base font-bold text-white">Publish New Health Education Article</h3>

                <div>
                  <label className="block text-slate-400 mb-1">Article Headline / Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Essential Tips for Healthy Heart & Blood Pressure"
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Medical Category</label>
                    <select
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Health">General Health</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Author / Reviewing Specialist</label>
                    <input
                      type="text"
                      value={newBlogAuthor}
                      onChange={(e) => setNewBlogAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Short Excerpt (Search Meta Snippet)</label>
                  <textarea
                    rows={2}
                    placeholder="Summary of health insights..."
                    value={newBlogExcerpt}
                    onChange={(e) => setNewBlogExcerpt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold">
                  Publish Article to Website
                </button>
              </form>
            </div>
          )}

          {/* Inquiries Lead Desk */}
          {activeCmsTab === 'inquiries' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Public Website Contact Lead Desk ({contactInquiries.length})</h3>
              
              <div className="space-y-3">
                {contactInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-100">{inq.name}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({inq.phone})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-slate-300">{inq.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">Received: {inq.date}</div>
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
