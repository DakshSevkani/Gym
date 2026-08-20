import React, { useEffect, useState } from 'react';
import {
  Users,
  Dumbbell,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  Activity,
  Phone,
  Mail,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { Role, DashboardStats, Member, Trainer } from '../types';
import { dashboardApi } from '../api/dashboardApi';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

interface DashboardPageProps {
  activeRole: Role;
  onNavigateTab: (tab: string) => void;
  onShowReceiptModal: (paymentData: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeRole,
  onNavigateTab,
  onShowReceiptModal,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: DashboardStats;
    memberProfile: Member;
    trainerProfile: Trainer;
  } | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, [activeRole]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getDashboardData();
      setData(res);
    } catch (err: any) {
      onShowToast('Loaded default system telemetry data.', 'info');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-blue-400 font-bold">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading Gym Dashboard Telemetry...</span>
        </div>
      </div>
    );
  }

  const { stats, memberProfile, trainerProfile } = data;

  return (
    <div className="space-y-6">
      {/* =================================================== */}
      {/* OWNER DASHBOARD VIEW */}
      {/* =================================================== */}
      {activeRole === 'OWNER' && (
        <>
          {/* Header Overview Banner */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h2 className="text-2xl font-black text-white">Gym Overview & Revenue Dashboard</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time telemetry, membership retention, and financial metrics.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>System Live & Operational</span>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1: Total Users */}
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => onNavigateTab('users')}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL SYSTEM USERS
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">{stats.totalUsers ?? 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                  {stats.totalUsers ?? 0} Active Accounts
                </span>
                <span className="text-slate-500">Live directory</span>
              </div>
            </div>

            {/* Stat 2: Total Trainers */}
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-cyan-500/40 transition-all cursor-pointer" onClick={() => onNavigateTab('trainers')}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL TRAINERS
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">{stats.totalTrainers ?? 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                  {stats.totalTrainers ?? 0} Coaching Staff
                </span>
                <span className="text-slate-500">Live roster</span>
              </div>
            </div>

            {/* Stat 3: Total Members */}
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-emerald-500/40 transition-all cursor-pointer" onClick={() => onNavigateTab('members')}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    GYM MEMBERS
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">{stats.totalMembers ?? 0}</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {stats.totalMembers ?? 0} Enrolled
                </span>
                <span className="text-slate-500">Member passes</span>
              </div>
            </div>

            {/* Stat 4: Total Revenue */}
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-purple-500/40 transition-all cursor-pointer" onClick={() => onNavigateTab('payments')}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL REVENUE
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">₹{(stats.totalRevenue ?? 0).toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold">
                  {(stats.totalRevenue ?? 0) > 0 ? 'Verified Invoices' : '₹0 Recorded'}
                </span>
                <span className="text-slate-500">Total collected</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Monthly Revenue Trend</h3>
                <p className="text-xs text-slate-400">Gross income across active membership plans</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Member Growth Chart */}
            <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Member Growth Rate</h3>
                <p className="text-xs text-slate-400">New active gym registrations by month</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.memberGrowthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="members" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Recent System Activity</h3>
              <button onClick={() => onNavigateTab('members')} className="text-xs font-bold text-blue-400 hover:underline">
                View All Members →
              </button>
            </div>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="divide-y divide-[#334155]">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                        {act.user ? act.user[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-white">{act.user}</span>
                        <p className="text-slate-400">{act.action}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 font-medium">{act.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs bg-[#0F172A] rounded-2xl border border-[#334155]">
                No member registrations or payment transactions logged in the database yet.
              </div>
            )}
          </div>
        </>
      )}

      {/* =================================================== */}
      {/* MEMBER DASHBOARD VIEW */}
      {/* =================================================== */}
      {activeRole === 'MEMBER' && (
        <>
          {!memberProfile ? (
            <div className="p-12 rounded-3xl bg-[#1E293B] border border-[#334155] text-center shadow-xl space-y-4">
              <Users className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-black text-white">No Member Record Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There is currently no member profile registered in the database for your account. Please register a member on the Members page or contact the Gym Owner.
              </p>
              <button
                onClick={() => onNavigateTab('members')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
              >
                Go to Members Page
              </button>
            </div>
          ) : (
            <>
              {/* Pending Owner Setup Banner */}
              {(!memberProfile.assignedTrainerName || memberProfile.status === 'Pending Assignment' || memberProfile.tier?.includes('Unassigned') || memberProfile.tier?.includes('Pending')) && (
                <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3.5 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-300 text-sm">Account Pending Management Setup</h4>
                    <p className="mt-1 leading-relaxed text-slate-300 text-xs">
                      Welcome, <strong>{memberProfile.name}</strong>! Your account is registered, but the Gym Owner has not assigned a membership plan or personal coach yet.
                    </p>
                  </div>
                </div>
              )}

              {/* Welcome Back Card Banner */}
              <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={memberProfile.avatar || getAvatarUrl(memberProfile.id, memberProfile.name)}
                  alt={memberProfile.name}
                  onError={(e) => handleAvatarError(e, memberProfile.name)}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Welcome Back, {memberProfile.name}!
                    </h2>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                      memberProfile.status === 'Pending Assignment'
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                        : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                    }`}>
                      {memberProfile.status || 'MEMBER'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Active Tier: <strong className="text-blue-400">{memberProfile.tier}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Subscription Duration Tracker */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">Subscription Duration Tracker</h3>
                        <p className="text-xs text-slate-400">Track active days remaining until renewal</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black shrink-0 ${
                      memberProfile.daysRemaining > 0
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {memberProfile.daysRemaining > 0 ? `${memberProfile.daysRemaining} Days Left` : '0 Days (Inactive)'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Subscription Status</span>
                      <span className="text-blue-400">
                        {memberProfile.daysRemaining > 0 ? `${Math.min(100, Math.max(5, Math.round((memberProfile.daysRemaining / 30) * 100)))}% Active` : 'Inactive / Unassigned'}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#0F172A] border border-[#334155] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${memberProfile.daysRemaining > 0 ? Math.min(100, Math.max(10, Math.round((memberProfile.daysRemaining / 30) * 100))) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Start & Expiration Dates */}
                  <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#334155] grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Start Date:</span>
                      <strong className="text-white text-sm font-black">{memberProfile.startDate || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Expiration Date:</span>
                      <strong className="text-blue-400 text-sm font-black">{memberProfile.expirationDate || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Assigned Personal Trainer Card */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white">Assigned Personal Trainer</h3>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  </div>

                  {memberProfile.assignedTrainerName ? (
                    <>
                      <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#334155] flex items-center gap-4">
                        <img
                          src={memberProfile.assignedTrainerAvatar || getAvatarUrl('trainer', memberProfile.assignedTrainerName)}
                          alt={memberProfile.assignedTrainerName}
                          onError={(e) => handleAvatarError(e, memberProfile.assignedTrainerName)}
                          className="w-14 h-14 rounded-xl object-cover border border-blue-500/40 shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-black text-white">{memberProfile.assignedTrainerName}</h4>
                          <p className="text-xs text-blue-400 font-bold mt-0.5">{memberProfile.assignedTrainerSpecialty || 'Strength & Fitness Coach'}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span>Phone:</span>
                          <strong className="text-slate-200">{memberProfile.assignedTrainerPhone || 'N/A'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Email:</span>
                          <strong className="text-slate-200">{memberProfile.assignedTrainerEmail || 'N/A'}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#334155] text-center py-6 flex flex-col items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-slate-500 mb-2 stroke-[1.5]" />
                      <h4 className="text-sm font-bold text-slate-300">No Trainer Assigned Yet</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">The Gym Owner has not assigned a dedicated coach to your account in the database.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Payments History Card & Table */}
              <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Your Payment & Transaction History</h3>
                      <p className="text-xs text-slate-400">All membership invoices and payments recorded for your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('payments')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Go to Payments Page →
                  </button>
                </div>

                {Array.isArray(memberProfile.paymentHistory) && memberProfile.paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-3">Transaction ID</th>
                          <th className="py-3 px-3">Plan / Membership</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Payment Method</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                        {memberProfile.paymentHistory.map((p: any, idx: number) => {
                          const txnId = p.transactionId || `TXN_${p.paymentId || p.id || idx + 1}`;
                          const pAmount = Number(p.amount || 0);
                          const pDate = p.paymentDate || p.date || 'Today';
                          const pMethod = p.paymentMethod || p.method || 'UPI QR';
                          const pPlan = p.planName || `${memberProfile.tier} Membership`;

                          return (
                            <tr key={p.id || idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-3 font-mono text-slate-300 font-bold">{txnId}</td>
                              <td className="py-3.5 px-3 font-bold text-white">{pPlan}</td>
                              <td className="py-3.5 px-3 text-slate-400">{pDate}</td>
                              <td className="py-3.5 px-3 text-slate-300 font-medium">{pMethod}</td>
                              <td className="py-3.5 px-3 font-black text-emerald-400 text-sm">₹{pAmount.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Completed
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() =>
                                    onShowReceiptModal({
                                      transactionId: txnId,
                                      memberName: memberProfile.name,
                                      memberEmail: memberProfile.email,
                                      amount: pAmount,
                                      planName: pPlan,
                                      method: pMethod,
                                      date: pDate,
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-all inline-flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Receipt</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : memberProfile.lastPaymentId && memberProfile.lastPaymentAmount ? (
                  <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Latest Confirmed Transaction: {memberProfile.lastPaymentId}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Amount Paid: <strong className="text-emerald-400">₹{Number(memberProfile.lastPaymentAmount || 0).toLocaleString('en-IN')}</strong> • Date: {memberProfile.lastPaymentDate || 'Recent'} • Method: {memberProfile.lastPaymentMethod || 'Online'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onShowReceiptModal({
                          transactionId: memberProfile.lastPaymentId,
                          memberName: memberProfile.name,
                          memberEmail: memberProfile.email,
                          amount: memberProfile.lastPaymentAmount,
                          planName: `${memberProfile.tier} Membership`,
                          method: memberProfile.lastPaymentMethod || 'Online Payment',
                          date: memberProfile.lastPaymentDate || 'Today',
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Official Receipt</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs bg-[#0F172A] rounded-2xl border border-[#334155]">
                    No payment transactions recorded for your account in the database yet.
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* =================================================== */}
      {/* TRAINER DASHBOARD VIEW */}
      {/* =================================================== */}
      {activeRole === 'TRAINER' && (
        <>
          {!trainerProfile ? (
            <div className="p-12 rounded-3xl bg-[#1E293B] border border-[#334155] text-center shadow-xl space-y-4">
              <Dumbbell className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-black text-white">No Trainer Record Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There is currently no trainer record registered in the database for your account. Please register a trainer in the Trainers section.
              </p>
              <button
                onClick={() => onNavigateTab('trainers')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-colors"
              >
                Go to Trainers Directory
              </button>
            </div>
          ) : (
            <>
              {/* Welcome Trainer Header */}
              <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={trainerProfile.avatar || getAvatarUrl(trainerProfile.id, trainerProfile.name)}
                  alt={trainerProfile.name}
                  onError={(e) => handleAvatarError(e, trainerProfile.name)}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-white">Welcome, {trainerProfile.name}!</h2>
                  <p className="text-xs text-blue-400 font-bold mt-1">{trainerProfile.specialty || 'Coaching Staff'}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Rating: <strong className="text-amber-400">★ {trainerProfile.rating || 5.0}</strong> • Experience: {trainerProfile.experienceYears || 0} Years
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('members')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Manage My Assigned Members
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase">ACTIVE COACHING CLIENTS</span>
                  <h3 className="text-4xl font-black text-white mt-2">{trainerProfile.activeClientsCount}</h3>
                  <p className="text-xs text-emerald-400 font-bold mt-2">Database synced</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase">SESSIONS SCHEDULED</span>
                  <h3 className="text-4xl font-black text-blue-400 mt-2">{trainerProfile.activeClientsCount > 0 ? trainerProfile.activeClientsCount * 2 : 0}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-2">Active training roster</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase">EXPERIENCE LEVEL</span>
                  <h3 className="text-4xl font-black text-emerald-400 mt-2">{trainerProfile.experienceYears} <span className="text-lg text-slate-400 font-normal">Yrs</span></h3>
                  <p className="text-xs text-slate-400 font-bold mt-2">Certified trainer</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
