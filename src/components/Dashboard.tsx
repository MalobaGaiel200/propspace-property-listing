import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Building, LayoutDashboard, Heart, MessageSquare, PlusCircle, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardStats, User } from '../types';

interface DashboardProps {
  token: string;
  user: User;
  setActiveView: (view: string) => void;
}

export default function Dashboard({ token, user, setActiveView }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load portfolio stats');
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error occurred while loading analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // Chart Colors
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" id="dashboard-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <span className="block mt-4 text-slate-500 text-sm font-semibold">Gathering portfolio analytics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" id="dashboard-error">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Could Not Load Dashboard</h3>
        <p className="text-slate-500 text-sm mb-6">{error || 'Please make sure you are logged in.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard-view">
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-200" />
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Owner Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight mb-2">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-blue-100 text-xs md:text-sm font-light max-w-xl leading-relaxed">
              Monitor your active property listings, read buyer/renter inquiries, and track favorites statistics from a single smart layout.
            </p>
          </div>

          <button
            onClick={() => setActiveView('add-property')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm transition-all shadow-md shrink-0 cursor-pointer"
            id="dash-add-property-btn"
          >
            <PlusCircle className="w-4 h-4" />
            Publish New Listing
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8" id="dashboard-metrics-grid">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <span className="text-2xl font-display font-black text-slate-900">{stats.myTotalListings}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">For Sale</span>
            <span className="text-2xl font-display font-black text-slate-900">{stats.mySalesCount}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">For Rent</span>
            <span className="text-2xl font-display font-black text-slate-900">{stats.myRentalsCount}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Likes</span>
            <span className="text-2xl font-display font-black text-slate-900">{stats.totalLikesOnMyProperties}</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiries Rec.</span>
            <span className="text-2xl font-display font-black text-slate-900">{stats.receivedMessagesCount}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Area */}
      {stats.myTotalListings === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Listings to Analyze</h3>
          <p className="text-slate-500 text-xs mb-6">
            Publish your first listing today to begin tracking metrics, city spreads, property type analytics, and buyer inquiries.
          </p>
          <button
            onClick={() => setActiveView('add-property')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" id="dashboard-charts-grid">
          {/* Chart 1: Property Types Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[380px]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Listing Category Spread
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.propertiesByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {stats.propertiesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Market Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[380px]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Market Intent (Rent vs. Sale)
            </h3>
            <div className="flex-1 min-h-0 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:w-2/3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.marketDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.marketDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#10b981'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 shrink-0 pr-4">
                {stats.marketDistribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-xs" style={{ backgroundColor: idx === 0 ? '#2563eb' : '#10b981' }} />
                    <span className="text-xs text-slate-600 font-medium">
                      {entry.name}: <span className="font-bold text-slate-900">{entry.value} listings</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Row */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Have Pending Message Inquiries?</h3>
            <p className="text-slate-500 text-xs">Read feedback and direct requests submitted by interested leads.</p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('messages')}
          className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-center"
        >
          View Messages Inbox
        </button>
      </div>
    </div>
  );
}
