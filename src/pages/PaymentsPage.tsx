import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Trash2,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download
} from 'lucide-react';
import { Payment, Member, Role, User } from '../types';
import { paymentApi } from '../api/paymentApi';
import { memberApi } from '../api/memberApi';
import { downloadReceiptFile } from '../utils/receiptGenerator';

interface PaymentsPageProps {
  onShowReceiptModal: (payment: Payment) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeRole?: Role;
  currentUser?: User | null;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onShowReceiptModal,
  onShowToast,
  activeRole = 'OWNER',
  currentUser
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [manualMemberName, setManualMemberName] = useState('');
  const [manualMemberEmail, setManualMemberEmail] = useState('');
  const [formAmount, setFormAmount] = useState('2000');
  const [formPlanName, setFormPlanName] = useState('STANDARD PASS');
  const [formMethod, setFormMethod] = useState<'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Cash' | 'UPI QR'>('UPI QR');

  useEffect(() => {
    loadData();
  }, [activeRole, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);

      const pRes = await paymentApi.getPayments();
      const mRes = await memberApi.getMembers();

      const validMembers: Member[] = (Array.isArray(mRes) ? mRes : []).map((m: any, idx: number) => ({
        id: String(m.id || `mem_${idx + 1}`),
        userId: String(m.userId || m.id || `usr_${idx + 1}`),
        name: m.name || m.username || 'Gym Member',
        email: m.email || '',
        phone: m.phone || '',
        tier: (m.membershipType || m.tier || 'Standard Pass') as any,
        startDate: m.membershipStartDate || m.startDate || 'N/A',
        expirationDate: m.membershipEndDate || m.expirationDate || 'N/A',
        daysRemaining: 0,
        status: m.status || 'Active'
      }));

      const validPayments: Payment[] = (Array.isArray(pRes) ? pRes : []).map((p: any, idx: number) => {
        const member = validMembers.find(m => String(m.id) === String(p.memberId));
        return {
          id: String(p.paymentId || p.id || `pay_${idx + 1}`),
          transactionId: String(p.transactionId || `TXN_${p.paymentId || p.id || idx + 1}`),
          paymentId: Number(p.paymentId || p.id || idx + 1),
          memberId: String(p.memberId || member?.id || ''),
          memberName: p.memberName || member?.name || 'Member',
          memberEmail: p.memberEmail || member?.email || '',
          planName: p.planName || member?.tier || 'Gym Membership',
          amount: Number(p.amount || 0),
          date: p.paymentDate || p.date || 'Today',
          paymentDate: p.paymentDate || p.date || 'Today',
          method: (p.paymentMethod || p.method || 'UPI QR') as any,
          paymentMethod: (p.paymentMethod || p.method || 'UPI QR') as any,
          status: p.status || 'Completed',
          invoiceUrl: '#'
        };
      });

      // Role filtering for MEMBER
      let displayPayments = validPayments;
      if (activeRole === 'MEMBER') {
        const userEmail = (currentUser?.email || '').trim().toLowerCase();
        const userName = (currentUser?.name || '').trim().toLowerCase();
        const userId = currentUser?.id ? String(currentUser.id) : null;

        const myMemberRecord = validMembers.find(m =>
          (userEmail && m.email && m.email.toLowerCase() === userEmail) ||
          (userName && m.name && (m.name.toLowerCase() === userName || m.name.toLowerCase().includes(userName) || userName.includes(m.name.toLowerCase()))) ||
          (userId && (String(m.id) === userId || String(m.userId) === userId))
        );

        displayPayments = validPayments.filter(p => {
          const pEmail = (p.memberEmail || '').trim().toLowerCase();
          const pName = (p.memberName || '').trim().toLowerCase();
          const pMemId = String(p.memberId || '');

          if (userEmail && pEmail && pEmail === userEmail) return true;
          if (userName && pName && (pName === userName || pName.includes(userName) || userName.includes(pName))) return true;
          if (userId && pMemId === userId) return true;
          if (myMemberRecord) {
            if (pMemId === String(myMemberRecord.id) || pMemId === String(myMemberRecord.userId)) return true;
            if (pMemId.replace(/\D/g, '') && pMemId.replace(/\D/g, '') === String(myMemberRecord.id).replace(/\D/g, '')) return true;
            if (myMemberRecord.email && pEmail && pEmail === myMemberRecord.email.toLowerCase()) return true;
            if (myMemberRecord.name && pName && (pName === myMemberRecord.name.toLowerCase() || pName.includes(myMemberRecord.name.toLowerCase()) || myMemberRecord.name.toLowerCase().includes(pName))) return true;
          }
          return false;
        });
      }

      setMembers(validMembers);
      setPayments(displayPayments);
      if (validMembers.length > 0 && !selectedMemberId) {
        setSelectedMemberId(validMembers[0].id);
        if (validMembers[0].tier) setFormPlanName(validMembers[0].tier);
      }
    } catch (err: any) {
      console.warn('Load payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (defaultMemberId?: string) => {
    let targetMem: Member | undefined;
    if (defaultMemberId && typeof defaultMemberId === 'string') {
      targetMem = members.find(m => String(m.id) === String(defaultMemberId));
    }
    if (!targetMem && activeRole === 'MEMBER') {
      const userEmail = (currentUser?.email || '').trim().toLowerCase();
      const userName = (currentUser?.name || '').trim().toLowerCase();
      const userId = currentUser?.id ? String(currentUser.id) : null;
      targetMem = members.find(m =>
        (userEmail && m.email && m.email.toLowerCase() === userEmail) ||
        (userName && m.name && (m.name.toLowerCase() === userName || m.name.toLowerCase().includes(userName) || userName.includes(m.name.toLowerCase()))) ||
        (userId && (String(m.id) === userId || String(m.userId) === userId))
      );
    }
    if (!targetMem && members.length > 0) {
      targetMem = members[0];
    }

    if (targetMem) {
      setSelectedMemberId(targetMem.id);
      setFormPlanName(targetMem.tier || 'STANDARD PASS');
      setManualMemberName(targetMem.name);
      setManualMemberEmail(targetMem.email);
    } else {
      setSelectedMemberId('');
      setFormPlanName('STANDARD PASS');
      setManualMemberName('');
      setManualMemberEmail('');
    }
    setFormAmount('2000');
    setShowAddModal(true);
  };

  const handleMemberSelectChange = (memId: string) => {
    setSelectedMemberId(memId);
    if (memId === 'NEW_MANUAL') {
      setManualMemberName('');
      setManualMemberEmail('');
      setFormPlanName('STANDARD PASS');
    } else {
      const chosen = members.find(m => String(m.id) === String(memId));
      if (chosen) {
        if (chosen.tier) setFormPlanName(chosen.tier);
        setManualMemberName(chosen.name);
        setManualMemberEmail(chosen.email);
      }
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      onShowToast('Please enter a valid payment amount.', 'error');
      return;
    }

    try {
      let memberName = '';
      let memberEmail = '';
      let memberId = '';
      let planName = formPlanName || 'STANDARD PASS';

      if (selectedMemberId && selectedMemberId !== 'NEW_MANUAL') {
        const selectedMember = members.find(m => String(m.id) === String(selectedMemberId));
        if (selectedMember) {
          memberId = String(selectedMember.id);
          memberName = selectedMember.name;
          memberEmail = selectedMember.email;
          planName = formPlanName || selectedMember.tier || 'STANDARD PASS';
        }
      }

      if (!memberName) {
        memberName = manualMemberName.trim() || 'Gym Member';
        memberEmail = manualMemberEmail.trim() || '';
        memberId = selectedMemberId && selectedMemberId !== 'NEW_MANUAL' ? selectedMemberId : `mem_${Date.now()}`;
      }

      await paymentApi.createPayment({
        memberId,
        memberName,
        memberEmail,
        amount: Number(formAmount),
        paymentMethod: formMethod,
        planName,
        paymentDate: new Date().toISOString().split('T')[0]
      });

      onShowToast(`Payment of ₹${Number(formAmount).toLocaleString('en-IN')} for ${memberName} recorded successfully!`, 'success');
      setShowAddModal(false);
      setManualMemberName('');
      setManualMemberEmail('');
      loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const executeDeletePayment = async () => {
    if (!paymentToDelete) return;
    if (activeRole !== 'OWNER') {
      onShowToast('Access Denied: Only Owner can remove payment records.', 'error');
      setPaymentToDelete(null);
      return;
    }

    try {
      await paymentApi.deletePayment(paymentToDelete.id);
      onShowToast(`Payment record #${paymentToDelete.paymentId || paymentToDelete.id} removed.`, 'success');
      setPaymentToDelete(null);
      loadData();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete payment', 'error');
    }
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter((p) => {
    if (!p) return false;
    const memberNameStr = String(p.memberName || '').toLowerCase();
    const planNameStr = String(p.planName || '').toLowerCase();
    const methodStr = String(p.paymentMethod || '').toLowerCase();
    const statusStr = String(p.status || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return (
      memberNameStr.includes(searchLower) ||
      planNameStr.includes(searchLower) ||
      methodStr.includes(searchLower) ||
      statusStr.includes(searchLower)
    );
  });

  const totalRevenue = filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            <span>{activeRole === 'MEMBER' ? 'My Payments & Subscription' : 'Payments & Billing Transactions'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeRole === 'MEMBER'
              ? 'View your personal membership plan, payment transaction receipts, and fee payment history.'
              : 'Track member fee payments, invoice receipts, subscription revenue, and online transaction history on Railway database.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeRole === 'MEMBER' && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Pay Membership Fee</span>
            </button>
          )}
          {activeRole === 'OWNER' && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Revenue Metric Summary Banner */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-xs text-slate-400 font-bold block">
            {activeRole === 'MEMBER' ? 'My Total Paid Amount' : 'Total Billing Revenue'}
          </span>
          <strong className="text-2xl font-black text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</strong>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-bold block">
            {activeRole === 'MEMBER' ? 'My Recorded Payments' : 'Total Recorded Transactions'}
          </span>
          <strong className="text-2xl font-black text-white">{filteredPayments.length} Payments</strong>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-bold block">
            {activeRole === 'MEMBER' ? 'Account Payment Status' : 'Payment Status'}
          </span>
          <strong className="text-2xl font-black text-blue-400">
            {activeRole === 'MEMBER' ? (filteredPayments.length > 0 ? 'Active & Up to Date' : 'Pending / No History') : '100% Verified'}
          </strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by member name, method, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="p-12 text-center text-emerald-400 font-bold">Loading payment records from Railway database...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#1E293B] border border-[#334155] text-center text-slate-400">
          No payment transactions found in database. Click "Record Payment" above to add one.
        </div>
      ) : (
        <div className="rounded-3xl bg-[#1E293B] border border-[#334155] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-extrabold uppercase border-b border-[#334155]">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Member</th>
                <th className="p-4">Plan Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#0F172A]/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-400">
                    #{p.paymentId || p.transactionId || p.id}
                  </td>
                  <td className="p-4">
                    <strong className="text-white font-bold block">{p.memberName || 'Gym Member'}</strong>
                    {p.memberEmail && <span className="text-[11px] text-slate-400">{p.memberEmail}</span>}
                  </td>
                  <td className="p-4 text-slate-300 font-semibold">{p.planName || p.membershipPlan || 'Gym Membership'}</td>
                  <td className="p-4 text-emerald-400 font-black text-sm">₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {p.paymentMethod || 'Online'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-medium">{p.paymentDate || p.createdAt?.slice(0, 10) || '2026-08-14'}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => onShowReceiptModal(p)}
                      className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:bg-emerald-600/20 transition-colors flex items-center gap-1"
                      title="View Official Receipt"
                    >
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline font-bold">Receipt</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadReceiptFile({
                          transactionId: p.transactionId || `TXN_${p.paymentId || p.id}`,
                          paymentId: p.paymentId,
                          memberName: p.memberName,
                          memberEmail: p.memberEmail,
                          planName: p.planName,
                          amount: Number(p.amount || 0),
                          paymentDate: p.paymentDate || p.date,
                          paymentMethod: p.paymentMethod || p.method
                        });
                        onShowToast(`Downloaded receipt for ${p.memberName || 'Payment'}`, 'success');
                      }}
                      className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                      title="Download Receipt File"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline font-bold">Download</span>
                    </button>
                    {activeRole === 'OWNER' && (
                      <button
                        onClick={() => setPaymentToDelete(p)}
                        className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black text-white">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete payment record <strong className="text-white">#{paymentToDelete.paymentId || paymentToDelete.id}</strong> (₹{Number(paymentToDelete.amount || 0).toLocaleString('en-IN')}) for <strong className="text-emerald-400">{paymentToDelete.memberName || 'Member'}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 font-bold hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeletePayment}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4">Record New Member Payment</h3>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              {members.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Select Member Account</label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => handleMemberSelectChange(e.target.value)}
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.tier || m.membershipType || 'Active Member'}) {m.email ? `• ${m.email}` : ''}
                        </option>
                      ))}
                      {activeRole === 'OWNER' && (
                        <option value="NEW_MANUAL">+ Enter Other / New Member Details...</option>
                      )}
                    </select>
                  </div>

                  {selectedMemberId === 'NEW_MANUAL' && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-[#0F172A] border border-[#334155]">
                      <div>
                        <label className="font-bold text-slate-400 block mb-1">Member Full Name</label>
                        <input
                          type="text"
                          required
                          value={manualMemberName}
                          onChange={(e) => setManualMemberName(e.target.value)}
                          placeholder="e.g. sachin"
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-400 block mb-1">Member Email (Optional)</label>
                        <input
                          type="email"
                          value={manualMemberEmail}
                          onChange={(e) => setManualMemberEmail(e.target.value)}
                          placeholder="e.g. sachin@gmail.com"
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Member Name</label>
                    <input
                      type="text"
                      required
                      value={manualMemberName}
                      onChange={(e) => setManualMemberName(e.target.value)}
                      placeholder="e.g. sachin"
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Member Email</label>
                    <input
                      type="email"
                      value={manualMemberEmail}
                      onChange={(e) => setManualMemberEmail(e.target.value)}
                      placeholder="e.g. member@gmail.com"
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-400 block mb-1">Plan / Fee Description</label>
                <input
                  type="text"
                  required
                  value={formPlanName}
                  onChange={(e) => setFormPlanName(e.target.value)}
                  placeholder="e.g. STANDARD PASS"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="UPI QR">UPI QR / Online</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
