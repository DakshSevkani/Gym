import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Save,
  KeyRound,
  Heart,
  Activity,
  Database
} from 'lucide-react';
import { Role, User } from '../types';
import { userApi } from '../api/userApi';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

interface ProfilePageProps {
  currentUser: User | null;
  activeRole: Role;
  onOpenPasswordReset: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUpdateUser?: (updated: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  activeRole,
  onOpenPasswordReset,
  onShowToast,
  onUpdateUser
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [age, setAge] = useState<number>(currentUser?.age || 25);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [fitnessGoal, setFitnessGoal] = useState(currentUser?.fitnessGoal || 'Strength & Muscle Building');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || '');

  useEffect(() => {
    loadProfileFromBackend();
  }, [currentUser?.id, currentUser?.email]);

  const loadProfileFromBackend = async () => {
    const identifier = currentUser?.id || currentUser?.email;
    if (!identifier) return;

    try {
      setLoading(true);
      const profileData = await userApi.getProfile(identifier);
      if (profileData) {
        if (profileData.name) setName(profileData.name);
        if (profileData.email) setEmail(profileData.email);
        if (profileData.phone !== undefined) setPhone(profileData.phone);
        if (profileData.age !== undefined) setAge(Number(profileData.age));
        if (profileData.bio !== undefined) setBio(profileData.bio);
        if (profileData.fitnessGoal) setFitnessGoal(profileData.fitnessGoal);
        if (profileData.address !== undefined) setAddress(profileData.address);
        if (profileData.emergencyContact !== undefined) setEmergencyContact(profileData.emergencyContact);

        if (onUpdateUser) {
          onUpdateUser(profileData);
        }
      }
    } catch (err) {
      console.warn('Failed to load profile from backend database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = currentUser?.id || 'usr_owner_1';
    const updatedUserPayload: Partial<User> = {
      id: userId,
      name,
      email,
      phone,
      role: activeRole,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: currentUser?.status || 'Active',
      age: Number(age),
      bio,
      fitnessGoal,
      address,
      emergencyContact
    };

    try {
      setSaving(true);
      const savedUser = await userApi.updateProfile(userId, updatedUserPayload);

      // Keep local session updated
      try {
        localStorage.setItem('powerhouse_user', JSON.stringify(savedUser));
      } catch (e) {}

      if (onUpdateUser) {
        onUpdateUser(savedUser);
      }

      onShowToast('Profile details updated and saved in backend database!', 'success');
    } catch (err: any) {
      console.error('Save profile error:', err);
      onShowToast('Failed to save profile to backend database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[350px] gap-3 text-blue-400">
        <Activity className="w-8 h-8 animate-spin" />
        <span className="text-sm font-bold text-slate-300">Loading Profile from Backend Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <UserIcon className="w-7 h-7 text-blue-400" />
            <span>Personal Profile & Account Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Profile stored and synchronized directly in backend database.</span>
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-[#0F172A] border border-blue-500/40 text-blue-400 text-xs font-black uppercase tracking-wider">
          Role: <strong className="text-white">{activeRole}</strong>
        </span>
      </div>

      {/* Main Profile Form Card */}
      <div className="p-8 rounded-3xl bg-[#1E293B] border border-[#334155] shadow-2xl">
        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          {/* Avatar and Info Banner */}
          <div className="flex items-center gap-6 pb-6 border-b border-[#334155]">
            <img
              src={currentUser?.avatar || getAvatarUrl(currentUser?.id, name || currentUser?.name)}
              alt="Avatar"
              onError={(e) => handleAvatarError(e, name || currentUser?.name)}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md shrink-0"
            />
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{name || 'Gym User'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                  {age} Yrs
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">{email}</p>
              <p className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" /> Goal: {fitnessGoal}
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="font-bold text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Age (Years)</label>
              <input
                type="number"
                required
                min="12"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Primary Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="Strength & Muscle Building">Strength & Muscle Building</option>
                <option value="Weight Loss & Fat Burning">Weight Loss & Fat Burning</option>
                <option value="Athletic Performance">Athletic Performance</option>
                <option value="General Cardiovascular Health">General Cardiovascular Health</option>
                <option value="Flexibility & Core Mobility">Flexibility & Core Mobility</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Emergency Contact Info</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Contact Name & Phone Number"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-400 block mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name, City, State, Zipcode"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-400 block mb-1">Personal Bio & Notes</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add training background, medical notes, or preferences..."
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-4 text-slate-200 focus:outline-none focus:border-blue-500 font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#334155]">
            <button
              type="button"
              onClick={onOpenPasswordReset}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-blue-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Reset Password</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile to Backend</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
