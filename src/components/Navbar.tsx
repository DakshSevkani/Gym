import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';
import { Role, User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeRole: Role;
  onRoleChange?: (role: Role) => void;
  onOpenNotifications: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onOpenNotifications,
  searchQuery,
  onSearchChange,
}) => {
  const getDashboardTitle = () => {
    switch (activeRole) {
      case 'OWNER':
        return 'Owner Dashboard';
      case 'TRAINER':
        return 'Trainer Dashboard';
      case 'MEMBER':
        return 'Member Dashboard';
      default:
        return 'Gym Dashboard';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'KS';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1E293B] border-b border-[#334155] px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Dashboard Title & Subtitle */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {getDashboardTitle()}
        </h1>
        <p className="text-xs text-slate-400 font-medium">PowerHouse Gym Management Suite</p>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search members, payments, trainers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all"
          />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {/* Static Role Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F172A] border border-blue-500/40 text-blue-400 text-xs font-bold shadow-sm">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Role: <strong className="text-white">{activeRole}</strong></span>
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:bg-[#334155] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        </button>

        {/* User Initials Avatar */}
        <div
          className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:border-blue-400 transition-colors"
          title={currentUser?.email || 'User Account'}
        >
          {getInitials(currentUser?.name || currentUser?.email)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
