import React, { useEffect, useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  UserCheck,
  Dumbbell,
  Shield,
  Plus
} from 'lucide-react';
import { Role, User, Member, Trainer, AppNotification } from '../types';
import {
  getStoredNotifications,
  saveNotifications,
  sendNotification,
  filterNotificationsForUser
} from '../utils/notificationStore';
import { memberApi } from '../api/memberApi';
import { trainerApi } from '../api/trainerApi';

interface NotificationsPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeRole?: Role;
  currentUser?: User | null;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onShowToast,
  activeRole = 'OWNER',
  currentUser
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Send Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [targetType, setTargetType] = useState<
    'ALL' | 'TRAINERS' | 'MEMBERS' | 'SPECIFIC_TRAINER' | 'SPECIFIC_MEMBER'
  >('MEMBERS');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<'info' | 'alert' | 'success'>('info');

  useEffect(() => {
    loadData();
  }, [activeRole, currentUser]);

  const loadData = async () => {
    const roleVal: Role = (activeRole as Role) || 'OWNER';
    const allStored = getStoredNotifications();
    const filtered = filterNotificationsForUser(allStored, roleVal, currentUser);
    setNotifications(filtered);

    try {
      const [tRes, mRes] = await Promise.all([trainerApi.getTrainers(), memberApi.getMembers()]);
      const validT = Array.isArray(tRes) ? tRes : [];
      const validM = Array.isArray(mRes) ? mRes : [];
      setTrainers(validT);
      setMembers(validM);

      if (validT.length > 0 && targetType === 'SPECIFIC_TRAINER') {
        setSelectedRecipientId(validT[0].id);
      } else if (validM.length > 0 && targetType === 'SPECIFIC_MEMBER') {
        setSelectedRecipientId(validM[0].id);
      }
    } catch (err) {
      console.warn('Failed loading recipients:', err);
    }
  };

  const handleMarkAllRead = () => {
    const roleVal: Role = (activeRole as Role) || 'OWNER';
    const all = getStoredNotifications().map((n) => ({ ...n, read: true }));
    saveNotifications(all);
    setNotifications(filterNotificationsForUser(all, roleVal, currentUser));
    onShowToast('All notifications marked as read.', 'success');
  };

  const handleClear = () => {
    saveNotifications([]);
    setNotifications([]);
    onShowToast('Notification inbox cleared.', 'info');
  };

  const handleSendNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      onShowToast('Please provide both a title and a message body.', 'error');
      return;
    }

    let recipientName = undefined;
    if (targetType === 'SPECIFIC_TRAINER') {
      const foundT = trainers.find((t) => String(t.id) === String(selectedRecipientId));
      recipientName = foundT?.name;
    } else if (targetType === 'SPECIFIC_MEMBER') {
      const foundM = members.find((m) => String(m.id) === String(selectedRecipientId));
      recipientName = foundM?.name;
    }

    const roleVal: Role = (activeRole as Role) || 'OWNER';

    sendNotification({
      senderRole: roleVal,
      senderName: currentUser?.name || (activeRole === 'OWNER' ? 'Gym Owner' : 'Coach KD'),
      targetRole: targetType,
      recipientId: selectedRecipientId || undefined,
      recipientName: recipientName,
      title: notifTitle,
      message: notifMessage,
      type: notifCategory,
    });

    onShowToast(`Notification sent successfully!`, 'success');
    setShowSendModal(false);
    setNotifTitle('');
    setNotifMessage('');
    loadData();
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Dispatch Bar */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            <span>Notification & Message Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeRole === 'OWNER' && 'Send direct notifications to gym trainers, members, or broadcast announcements.'}
            {activeRole === 'TRAINER' && 'Send workouts, diet alerts, and fitness instructions to your assigned gym members.'}
            {activeRole === 'MEMBER' && 'Receive official gym updates, trainer guidance, and payment reminders.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {(activeRole === 'OWNER' || activeRole === 'TRAINER') && (
            <button
              onClick={() => {
                setTargetType(activeRole === 'OWNER' ? 'MEMBERS' : 'MEMBERS');
                setShowSendModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {activeRole === 'OWNER' ? 'Send Notification' : 'Notify Assigned Members'}
              </span>
            </button>
          )}

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-3 rounded-2xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white font-bold text-xs transition-colors"
          >
            Mark All Read
          </button>

          <button
            onClick={handleClear}
            className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
            title="Clear Inbox"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1E293B] border border-[#334155] text-slate-400">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-6 rounded-3xl border transition-all flex items-start gap-4 ${
                !n.read
                  ? 'bg-[#1E293B] border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-[#1E293B]/60 border-[#334155] opacity-80'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl shrink-0 ${
                  n.type === 'alert'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : n.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">{formatTimeAgo(n.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{n.message}</p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#0F172A] border border-[#334155] text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    Sender: <strong className="text-slate-200">{n.senderName} ({n.senderRole})</strong>
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-[#0F172A] border border-[#334155] text-slate-400">
                    Audience: <strong className="text-blue-400">{n.recipientName ? `Direct to ${n.recipientName}` : n.targetRole}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#334155] pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>
                  {activeRole === 'OWNER' ? 'Compose Gym Notification' : 'Message Assigned Members'}
                </span>
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotificationSubmit} className="space-y-4 text-xs">
              {/* Recipient Target Selector */}
              <div>
                <label className="font-bold text-slate-400 block mb-1">Target Audience</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                >
                  {activeRole === 'OWNER' && (
                    <>
                      <option value="ALL">All Gym Users (Trainers + Members)</option>
                      <option value="TRAINERS">All Coaching Staff / Trainers</option>
                      <option value="MEMBERS">All Registered Gym Members</option>
                      <option value="SPECIFIC_TRAINER">Specific Individual Trainer</option>
                      <option value="SPECIFIC_MEMBER">Specific Individual Member</option>
                    </>
                  )}

                  {activeRole === 'TRAINER' && (
                    <>
                      <option value="MEMBERS">All Assigned Members</option>
                      <option value="SPECIFIC_MEMBER">Specific Member</option>
                    </>
                  )}
                </select>
              </div>

              {/* Individual Selector if specific recipient */}
              {targetType === 'SPECIFIC_TRAINER' && trainers.length > 0 && (
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Select Specific Trainer</label>
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'SPECIFIC_MEMBER' && members.length > 0 && (
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Select Specific Member</label>
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.tier || m.membershipType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority Category */}
              <div>
                <label className="font-bold text-slate-400 block mb-1">Notification Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info', label: 'Info Update', color: 'border-blue-500 text-blue-400' },
                    { id: 'alert', label: 'Important Alert', color: 'border-red-500 text-red-400' },
                    { id: 'success', label: 'Achievement', color: 'border-emerald-500 text-emerald-400' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNotifCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        notifCategory === cat.id
                          ? `${cat.color} bg-[#0F172A] shadow-md`
                          : 'border-[#334155] text-slate-400 bg-[#0F172A]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="font-bold text-slate-400 block mb-1">Subject / Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Schedule Change or Diet Checklist"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Message Text */}
              <div>
                <label className="font-bold text-slate-400 block mb-1">Notification Content</label>
                <textarea
                  rows={4}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-4 text-slate-200 focus:outline-none focus:border-amber-500 font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#334155] text-slate-400 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
