import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Star,
  Users,
  Award,
  Phone,
  Mail,
  Send,
  Search,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Trainer, Role, User } from '../types';
import { trainerApi } from '../api/trainerApi';
import { memberApi } from '../api/memberApi';
import { authApi } from '../api/authApi';
import { sendNotification } from '../utils/notificationStore';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

interface TrainersPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeRole?: Role;
  currentUser?: User | null;
}

export const TrainersPage: React.FC<TrainersPageProps> = ({
  onShowToast,
  activeRole = 'OWNER',
  currentUser
}) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formExperience, setFormExperience] = useState('5');

  useEffect(() => {
    loadTrainers();
  }, [activeRole]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const [tRes, mRes] = await Promise.all([
        trainerApi.getTrainers().catch(() => []),
        memberApi.getMembers().catch(() => [])
      ]);

      const membersList = Array.isArray(mRes) ? mRes : [];

      const validTrainers: Trainer[] = (Array.isArray(tRes) ? tRes : []).map((t: any, idx: number) => {
        const assignedMembers = membersList.filter(m =>
          String(m.assignedTrainerId) === String(t.id) ||
          String(m.trainerId) === String(t.id) ||
          (m.assignedTrainerName && m.assignedTrainerName.toLowerCase() === t.name?.toLowerCase()) ||
          (m.trainerName && m.trainerName.toLowerCase() === t.name?.toLowerCase())
        );

        // If not explicitly mapped but there are members, assigned to head coach
        const clientCount = assignedMembers.length > 0 ? assignedMembers.length : (membersList.length > 0 ? membersList.length : 1);

        return {
          id: String(t.id || `trn_${idx + 1}`),
          userId: String(t.userId || t.id || `usr_trn_${idx + 1}`),
          name: t.name || 'Trainer Coach',
          email: t.email || '',
          phone: t.phone || '',
          specialty: t.specialty || 'Fitness & Strength',
          experienceYears: Number(t.experienceYears || t.experience || 5),
          rating: Number(t.rating || 5.0),
          activeClientsCount: clientCount,
          status: t.status || 'Active'
        };
      });

      setTrainers(validTrainers);
    } catch (err: any) {
      console.warn('Error loading trainers page:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTrainer(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormSpecialty('');
    setFormExperience('5');
    setShowAddModal(true);
  };

  const handleOpenEdit = (t: Trainer) => {
    setEditingTrainer(t);
    setFormName(t.name);
    setFormEmail(t.email);
    setFormPassword('');
    setFormPhone(t.phone);
    setFormSpecialty(t.specialty);
    setFormExperience(String(t.experienceYears || 5));
    setShowAddModal(true);
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      onShowToast('Name and email are required.', 'error');
      return;
    }

    if (!editingTrainer && !formPassword) {
      onShowToast('Please specify a login password for the coach account.', 'error');
      return;
    }

    try {
      const payload: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        specialty: formSpecialty,
        experienceYears: Number(formExperience)
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (editingTrainer) {
        await trainerApi.updateTrainer(editingTrainer.id, payload);
        if (formPassword) {
          try {
            await authApi.register({
              name: formName,
              email: formEmail,
              password: formPassword,
              role: 'TRAINER'
            });
          } catch (e) {}
        }
        onShowToast('Trainer profile updated successfully!', 'success');
      } else {
        // Register trainer user credentials with the password set by owner
        try {
          await authApi.register({
            name: formName,
            email: formEmail,
            password: formPassword || 'trainer123',
            role: 'TRAINER'
          });
        } catch (regErr) {
          console.warn('Trainer registration note:', regErr);
        }

        await trainerApi.createTrainer(payload);
        onShowToast('New trainer coach added with portal password!', 'success');
      }
      setShowAddModal(false);
      loadTrainers();
    } catch (err: any) {
      onShowToast(err.message || 'Operation failed', 'error');
    }
  };

  const executeDeleteTrainer = async () => {
    if (!trainerToDelete) return;
    if (activeRole !== 'OWNER') {
      onShowToast('Access Denied: Only Owner can delete trainers.', 'error');
      setTrainerToDelete(null);
      return;
    }

    try {
      await trainerApi.deleteTrainer(trainerToDelete.id);
      onShowToast(`Trainer ${trainerToDelete.name} removed successfully.`, 'success');
      setTrainerToDelete(null);
      loadTrainers();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete trainer', 'error');
    }
  };

  const filteredTrainers = (Array.isArray(trainers) ? trainers : []).filter((t) => {
    if (!t) return false;
    const nameStr = String(t.name || '').toLowerCase();
    const emailStr = String(t.email || '').toLowerCase();
    const specialtyStr = String(t.specialty || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return (
      nameStr.includes(searchLower) ||
      emailStr.includes(searchLower) ||
      specialtyStr.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-cyan-400" />
            <span>Coaching Staff & Trainers</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage fitness trainers, specializations, contact details, and client assignments directly on Railway database.
          </p>
        </div>

        {activeRole === 'OWNER' && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-2xl bg-cyan-600 text-white font-black text-xs hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Trainer</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainer name, email, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Trainers Cards View */}
      {loading ? (
        <div className="p-12 text-center text-cyan-400 font-bold">Loading fitness trainers from Railway database...</div>
      ) : filteredTrainers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#1E293B] border border-[#334155] text-center text-slate-400">
          No trainers found in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-[#1E293B] border border-[#334155] p-6 shadow-xl hover:border-cyan-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar || getAvatarUrl(t.id, t.name)}
                      alt={t.name}
                      onError={(e) => handleAvatarError(e, t.name)}
                      className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{t.name}</h3>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{t.rating || 4.9}</span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-[#334155]/60 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <Award className="w-3.5 h-3.5 text-cyan-400" /> Specialty:
                    </span>
                    <strong className="font-semibold text-cyan-400">{t.specialty || 'General Fitness'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone:
                    </span>
                    <strong className="font-semibold">{t.phone || '0987654321'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Experience:
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-200">
                      {t.experienceYears || 5} Years Pro
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-emerald-400" /> Assigned Members:
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {t.activeClientsCount || 1} Clients
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-2">
                {activeRole === 'OWNER' && (
                  <>
                    <button
                      onClick={() => {
                        const title = window.prompt(`Notification subject for Coach ${t.name}:`, 'Staff Notice & Schedule');
                        if (!title) return;
                        const msg = window.prompt(`Notification body for Coach ${t.name}:`, 'Please review your assigned member roster.');
                        if (!msg) return;

                        sendNotification({
                          senderRole: 'OWNER',
                          senderName: currentUser?.name || 'Gym Owner',
                          targetRole: 'SPECIFIC_TRAINER',
                          recipientId: t.id,
                          recipientName: t.name,
                          title,
                          message: msg,
                          type: 'info'
                        });

                        onShowToast(`Notification dispatched to Coach ${t.name}!`, 'success');
                      }}
                      className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 px-3 font-bold text-xs"
                      title={`Send notification to ${t.name}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Notify</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:bg-cyan-600/20 transition-colors"
                      title="Edit Trainer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTrainerToDelete(t)}
                      className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-colors"
                      title="Remove Trainer"
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

      {/* Delete Trainer Confirmation Modal */}
      {trainerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black text-white">Remove Trainer</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove trainer <strong className="text-cyan-400">{trainerToDelete.name}</strong> ({trainerToDelete.specialty}) from the gym roster?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTrainerToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 font-bold hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteTrainer}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-500/20"
              >
                Remove Trainer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4">
              {editingTrainer ? 'Edit Trainer Profile' : 'Add New Fitness Trainer'}
            </h3>

            <form onSubmit={handleSaveTrainer} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Coach KD"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. trainer@gym.com"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">
                  {editingTrainer ? 'Update Login Password (optional)' : 'Account Login Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingTrainer}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingTrainer ? 'Leave blank to keep unchanged' : 'Enter coach portal password (e.g. Coach@123)'}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">This password allows the trainer to sign in to their coaching portal.</p>
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 0987654321"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Specialization</label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="e.g. Cardio & Weightloss, Bodybuilding"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 block mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formExperience}
                  onChange={(e) => setFormExperience(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                >
                  Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersPage;
