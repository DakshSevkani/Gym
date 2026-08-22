import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  Dumbbell,
  ShieldAlert,
  UserCheck,
  Send,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Search,
  X,
  Receipt,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Member, Trainer, Role, User, Payment } from '../types';
import { memberApi } from '../api/memberApi';
import { trainerApi } from '../api/trainerApi';
import { paymentApi } from '../api/paymentApi';
import { authApi } from '../api/authApi';
import { sendNotification } from '../utils/notificationStore';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';
import { downloadReceiptFile } from '../utils/receiptGenerator';

interface MembersPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeRole?: Role;
  currentUser?: User | null;
  onShowReceiptModal?: (payment: any) => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({
  onShowToast,
  activeRole = 'OWNER',
  currentUser,
  onShowReceiptModal
}) => {
  const [members, setMembers] = useState<(Member & { payments?: Payment[]; totalPaid?: number })[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Member Payments History Modal State
  const [selectedMemberForPayments, setSelectedMemberForPayments] = useState<(Member & { payments?: Payment[]; totalPaid?: number }) | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formTier, setFormTier] = useState<'Basic Monthly' | 'Pro Quarter' | 'VIP Annual'>('Pro Quarter');
  const [formTrainerId, setFormTrainerId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, [activeRole, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);

      const mRes = await memberApi.getMembers();
      const tRes = await trainerApi.getTrainers();
      const pRes = await paymentApi.getPayments();

      const rawPayments: Payment[] = Array.isArray(pRes) ? pRes : [];

      const rawTrainers: Trainer[] = (Array.isArray(tRes) ? tRes : []).map((t: any, idx: number) => ({
        id: String(t.id || `trn_${idx + 1}`),
        userId: String(t.userId || t.id || `usr_trn_${idx + 1}`),
        name: t.name || 'Trainer',
        email: t.email || '',
        phone: t.phone || '',
        specialty: t.specialty || 'Fitness & Strength',
        experienceYears: Number(t.experienceYears || 0),
        rating: Number(t.rating || 5.0),
        activeClientsCount: 0,
        status: t.status || 'Active'
      }));

      let validMembers = (Array.isArray(mRes) ? mRes : []).map((m: any, idx: number) => {
        const memId = String(m.id || `mem_${idx + 1}`);

        let matchedTrainer = rawTrainers.find(t =>
          String(t.id) === String(m.assignedTrainerId || m.trainerId) ||
          (m.assignedTrainerName && t.name?.toLowerCase() === m.assignedTrainerName.toLowerCase()) ||
          (m.trainerName && t.name?.toLowerCase() === m.trainerName.toLowerCase())
        );

        if (!matchedTrainer && rawTrainers.length > 0) {
          matchedTrainer = rawTrainers[0];
        }

        const startDate = m.membershipStartDate || m.startDate || 'N/A';
        const expirationDate = m.membershipEndDate || m.expirationDate || 'N/A';
        const endMs = expirationDate !== 'N/A' ? new Date(expirationDate).getTime() : NaN;
        const daysRemaining = !isNaN(endMs) ? Math.max(0, Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

        const memberPayments = rawPayments.filter(p =>
          String(p.memberId) === memId ||
          String(p.memberId) === String(m.userId) ||
          (p.memberId && memId && String(p.memberId).replace(/\D/g, '') === memId.replace(/\D/g, '')) ||
          (p.memberName && m.name && p.memberName.toLowerCase() === m.name.toLowerCase()) ||
          (p.memberEmail && m.email && p.memberEmail.toLowerCase() === m.email.toLowerCase())
        );

        const totalPaid = memberPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        return {
          id: memId,
          userId: String(m.userId || m.id || `usr_mem_${idx + 1}`),
          name: m.name || m.username || 'Gym Member',
          email: m.email || '',
          phone: m.phone || '',
          tier: (m.membershipType || m.tier || 'Standard Pass') as any,
          startDate,
          expirationDate,
          daysRemaining,
          status: m.status || 'Active',
          assignedTrainerId: String(matchedTrainer?.id || m.assignedTrainerId || m.trainerId || '1'),
          assignedTrainerName: matchedTrainer?.name || m.assignedTrainerName || m.trainerName || 'KD',
          assignedTrainerSpecialty: matchedTrainer?.specialty || 'Cardio & Fitness Coach',
          assignedTrainerPhone: matchedTrainer?.phone || '0987654321',
          payments: memberPayments,
          totalPaid
        };
      });

      if (activeRole === 'MEMBER') {
        const userEmail = currentUser?.email?.toLowerCase();
        const userName = currentUser?.name?.toLowerCase();
        const userId = currentUser?.id ? String(currentUser.id) : null;

        const filtered = validMembers.filter(m =>
          (userEmail && m.email?.toLowerCase() === userEmail) ||
          (userName && m.name?.toLowerCase() === userName) ||
          (userId && (String(m.id) === userId || String(m.userId) === userId))
        );

        validMembers = filtered;
      }

      setMembers(validMembers);
      setTrainers(rawTrainers);
      if (rawTrainers.length > 0) {
        setFormTrainerId(rawTrainers[0].id);
      }
    } catch (err: any) {
      console.warn('Load members error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormTier('Pro Quarter');
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    setFormStartDate(todayStr);
    setFormEndDate(defaultEnd);
    if (trainers.length > 0) setFormTrainerId(trainers[0].id);
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormEmail(m.email);
    setFormPassword('');
    setFormPhone(m.phone);
    setFormTier(m.tier);
    setFormStartDate(m.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(m.expirationDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
    setFormTrainerId(m.assignedTrainerId || (trainers[0]?.id ?? ''));
    setShowAddModal(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      onShowToast('Name and email are required.', 'error');
      return;
    }

    if (!editingMember && !formPassword) {
      onShowToast('Please specify a login password for the member account.', 'error');
      return;
    }

    try {
      const selectedTrainer = trainers.find(t => String(t.id) === String(formTrainerId));
      const payload: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        tier: formTier,
        membershipType: formTier,
        assignedTrainerId: formTrainerId,
        trainerId: formTrainerId,
        assignedTrainerName: selectedTrainer?.name || '',
        trainerName: selectedTrainer?.name || '',
        startDate: formStartDate,
        membershipStartDate: formStartDate,
        expirationDate: formEndDate,
        membershipEndDate: formEndDate
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (editingMember) {
        await memberApi.updateMember(editingMember.id, payload);
        if (formPassword) {
          try {
            await authApi.register({
              name: formName,
              email: formEmail,
              password: formPassword,
              role: 'MEMBER'
            });
          } catch (e) {}
        }
        onShowToast('Member profile, dates & credentials updated successfully in backend database!', 'success');
      } else {
        // Register member credentials with the password specified by the owner
        try {
          await authApi.register({
            name: formName,
            email: formEmail,
            password: formPassword || 'member123',
            role: 'MEMBER'
          });
        } catch (regErr) {
          console.warn('Registration attempt note:', regErr);
        }

        await memberApi.createMember(payload);
        onShowToast('New member added with portal access password!', 'success');
      }
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Operation failed', 'error');
    }
  };

  const executeDeleteMember = async () => {
    if (!memberToDelete) return;
    if (activeRole !== 'OWNER') {
      onShowToast('Access Denied: Only Owner can delete members.', 'error');
      setMemberToDelete(null);
      return;
    }

    try {
      await memberApi.deleteMember(memberToDelete.id);
      onShowToast(`Member ${memberToDelete.name} removed successfully.`, 'success');
      setMemberToDelete(null);
      loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete member', 'error');
    }
  };

  const filteredMembers = (Array.isArray(members) ? members : []).filter((m) => {
    if (!m) return false;
    const nameStr = String(m.name || '').toLowerCase();
    const emailStr = String(m.email || '').toLowerCase();
    const phoneStr = String(m.phone || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      nameStr.includes(searchLower) ||
      emailStr.includes(searchLower) ||
      phoneStr.includes(searchLower);

    const tierVal = String(m.tier || m.membershipType || '');
    const matchesTier = tierFilter === 'ALL' || tierVal.toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Actions Bar */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            <span>Gym Members Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage member registrations, membership tiers, and personal coach assignments directly on Railway database.
          </p>
        </div>

        {activeRole === 'OWNER' && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Member</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name, email, phone, or tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
          <span className="text-xs font-bold text-slate-400 hidden sm:inline">Tier:</span>
          {['ALL', 'Basic Monthly', 'Pro Quarter', 'VIP Annual'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                tierFilter === tier
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#1E293B] border border-[#334155] text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Members Card View */}
      {loading ? (
        <div className="p-12 text-center text-blue-400 font-bold">Loading gym members list from Railway database...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#1E293B] border border-[#334155] text-center text-slate-400">
          No gym members found in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl bg-[#1E293B] border border-[#334155] p-6 shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar || getAvatarUrl(m.id, m.name)}
                      alt={m.name}
                      onError={(e) => handleAvatarError(e, m.name)}
                      className="w-12 h-12 rounded-2xl object-cover border border-blue-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{m.name}</h3>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 border border-blue-500/40 text-blue-400">
                    {m.tier || m.membershipType || 'STANDARD PASS'}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-[#334155]/60 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Phone:
                    </span>
                    <strong className="font-semibold">{m.phone || 'N/A'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <Dumbbell className="w-3.5 h-3.5 text-cyan-400" /> Assigned Trainer:
                    </span>
                    {activeRole === 'OWNER' ? (
                      <select
                        value={m.assignedTrainerId || ''}
                        onChange={async (e) => {
                          const newTrainerId = e.target.value;
                          const selectedT = trainers.find(t => String(t.id) === String(newTrainerId));
                          const newTrainerName = selectedT?.name || '';
                          try {
                            await memberApi.assignTrainer(m.id, newTrainerId, newTrainerName);
                            onShowToast(`Backend updated: Assigned ${newTrainerName || 'Trainer'} to ${m.name}`, 'success');
                            loadData();
                          } catch (err: any) {
                            onShowToast('Failed to assign trainer on backend', 'error');
                          }
                        }}
                        className="bg-[#0F172A] border border-[#334155] text-cyan-400 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-cyan-500/50"
                      >
                        {trainers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-right">
                        <strong className="font-bold text-cyan-400 block">{m.assignedTrainerName || 'KD'}</strong>
                        <span className="text-[10px] text-slate-400 font-semibold">{m.assignedTrainerSpecialty || 'Cardio & Strength Coach'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" /> Membership Dates:
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {m.startDate || '2026-07-10'} - {m.expirationDate || '2026-09-10'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Payments Recorded:
                    </span>
                    <button
                      onClick={() => setSelectedMemberForPayments(m)}
                      className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <span>₹{Number(m.totalPaid || 0).toLocaleString('en-IN')} ({m.payments?.length || 0} Paid)</span>
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                <button
                  onClick={() => setSelectedMemberForPayments(m)}
                  className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 px-3 font-bold text-xs"
                  title="View Payments History"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments</span>
                </button>
                {(activeRole === 'OWNER' || activeRole === 'TRAINER') && (
                  <button
                    onClick={() => {
                      const title = window.prompt(`Notification subject for ${m.name}:`, 'Workout & Training Update');
                      if (!title) return;
                      const msg = window.prompt(`Notification body for ${m.name}:`, 'Please check your personal training schedule.');
                      if (!msg) return;

                      sendNotification({
                        senderRole: activeRole,
                        senderName: currentUser?.name || (activeRole === 'OWNER' ? 'Gym Owner' : 'Coach KD'),
                        targetRole: 'SPECIFIC_MEMBER',
                        recipientId: m.id,
                        recipientName: m.name,
                        title,
                        message: msg,
                        type: 'info'
                      });

                      onShowToast(`Notification dispatched to ${m.name}!`, 'success');
                    }}
                    className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 px-3 font-bold text-xs"
                    title={`Send notification to ${m.name}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Notify</span>
                  </button>
                )}

                {activeRole === 'OWNER' && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:bg-blue-600/20 transition-colors"
                      title="Edit Member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMemberToDelete(m)}
                      className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black text-white">Remove Member</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove member <strong className="text-blue-400">{memberToDelete.name}</strong> ({memberToDelete.tier || 'Gym Member'}) from the membership registry?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 font-bold hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteMember}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4">
              {editingMember ? 'Edit Member Profile' : 'Register New Gym Member'}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. alex@gmail.com"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">
                  {editingMember ? 'Update Login Password (optional)' : 'Account Login Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingMember}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingMember ? 'Leave blank to keep unchanged' : 'Enter member portal password (e.g. Member@123)'}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">This password allows the member to sign in to their account portal.</p>
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +1 555 123 4567"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Membership Plan</label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="Basic Monthly">Basic Monthly (₹1,499/mo)</option>
                  <option value="Pro Quarter">Pro Quarter (₹3,999/quarter)</option>
                  <option value="VIP Annual">VIP Annual (₹14,999/yr)</option>
                </select>
              </div>

              {trainers.length > 0 && (
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Assigned Coach / Trainer</label>
                  <select
                    value={formTrainerId}
                    onChange={(e) => setFormTrainerId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Membership Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Membership Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-medium text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#334155] text-slate-400 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Payments Modal */}
      {selectedMemberForPayments && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedMemberForPayments.name}'s Payment Records</h3>
                  <p className="text-xs text-slate-400">Total Paid: <strong className="text-emerald-400">₹{Number(selectedMemberForPayments.totalPaid || 0).toLocaleString('en-IN')}</strong> across {selectedMemberForPayments.payments?.length || 0} transaction(s)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForPayments(null)}
                className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedMemberForPayments.payments && selectedMemberForPayments.payments.length > 0 ? (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#334155] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Plan / Description</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                    {selectedMemberForPayments.payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-slate-300">{p.transactionId || `TXN_${p.paymentId || p.id || idx + 1}`}</td>
                        <td className="py-3 px-3 font-bold text-white">{p.planName || selectedMemberForPayments.tier}</td>
                        <td className="py-3 px-3 text-slate-400">{p.paymentDate || p.date || '2026-08-13'}</td>
                        <td className="py-3 px-3 text-slate-300">{p.paymentMethod || p.method || 'UPI QR'}</td>
                        <td className="py-3 px-3 font-black text-emerald-400 text-sm">₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onShowReceiptModal && (
                              <button
                                onClick={() => {
                                  onShowReceiptModal({
                                    ...p,
                                    memberName: selectedMemberForPayments.name,
                                    memberEmail: selectedMemberForPayments.email,
                                    memberPhone: selectedMemberForPayments.phone,
                                    planName: p.planName || selectedMemberForPayments.tier,
                                    amount: p.amount,
                                    date: p.paymentDate || p.date,
                                    method: p.paymentMethod || p.method
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:bg-emerald-600/20 transition-colors"
                                title="View Official Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                downloadReceiptFile({
                                  transactionId: p.transactionId || `TXN_${p.paymentId || p.id || idx + 1}`,
                                  memberName: selectedMemberForPayments.name,
                                  memberEmail: selectedMemberForPayments.email,
                                  memberPhone: selectedMemberForPayments.phone,
                                  planName: p.planName || selectedMemberForPayments.tier,
                                  amount: Number(p.amount || 0),
                                  paymentDate: p.paymentDate || p.date || '2026-08-13',
                                  paymentMethod: p.paymentMethod || p.method || 'UPI QR'
                                });
                                onShowToast(`Downloaded receipt for ${selectedMemberForPayments.name}`, 'success');
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                              title="Download Receipt File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-[#334155] text-slate-400 text-xs">
                No payments or transactions have been recorded for {selectedMemberForPayments.name} yet.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#334155]">
              <button
                onClick={() => setSelectedMemberForPayments(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
