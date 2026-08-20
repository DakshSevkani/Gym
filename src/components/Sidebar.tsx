import React, { useState } from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  UserCog,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  CalendarCheck,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronRight,
} from 'lucide-react';
import { Role, User } from '../types';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

interface SidebarProps {
  activeRole: Role;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRole,
  activeTab,
  onSelectTab,
  currentUser,
  onSignOut,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('powerhouse_sidebar_open');
    return saved === 'true';
  });

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('powerhouse_sidebar_open', String(next));
      return next;
    });
  };

  const getNavItems = () => {
    switch (activeRole) {
      case 'OWNER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'trainers', label: 'Trainers', icon: Dumbbell },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'users', label: 'Users', icon: UserCog },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'TRAINER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: UserIcon },
          { id: 'members', label: 'My Members', icon: Users },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
      case 'MEMBER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'members', label: 'My Membership', icon: CalendarCheck },
          { id: 'payments', label: 'My Payments', icon: CreditCard },
          { id: 'trainers', label: 'My Trainer', icon: Dumbbell },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none transition-all duration-300 z-30`}
    >
      <div className={`p-4 flex flex-col gap-4 ${!isExpanded ? 'items-center' : ''}`}>
        {/* Top Bar: Brand Logo & Toggle Button */}
        {isExpanded ? (
          <div className="flex items-center justify-between w-full pb-1 border-b border-[#334155]/60">
            <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 shrink-0">
                <Dumbbell className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="overflow-hidden">
                <span className="text-base font-black tracking-wider text-white block leading-tight truncate">
                  POWER<span className="text-blue-400">HOUSE</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block truncate">
                  GYM MANAGEMENT
                </span>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:border-blue-500/60 hover:bg-blue-600/20 transition-all shrink-0"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4.5 h-4.5 text-blue-400" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full pb-2 border-b border-[#334155]/60">
            <div
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 shrink-0"
              title="PowerHouse Gym Management"
            >
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>

            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl bg-[#0F172A] border border-[#334155] text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all flex items-center justify-center shadow-md cursor-pointer"
              title="Expand Sidebar (Show menu names)"
            >
              <PanelLeftOpen className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        )}

        {/* Active Role Badge */}
        {isExpanded ? (
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-2.5 flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400 font-semibold">Active Role:</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-extrabold uppercase tracking-wide">
              {activeRole}
            </span>
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-center text-blue-400 relative"
            title={`Active Role: ${activeRole}`}
          >
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#1E293B]" />
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex flex-col gap-2 mt-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center ${
                  isExpanded ? 'gap-3 px-3.5 py-3 rounded-xl justify-start' : 'p-3 rounded-xl justify-center'
                } font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {isExpanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className={`p-3 border-t border-[#334155] bg-[#1E293B] flex flex-col gap-2.5 ${!isExpanded ? 'items-center' : ''}`}>
        {isExpanded ? (
          <>
            <div className="flex items-center gap-3 px-1.5 py-1">
              <img
                src={currentUser?.avatar || getAvatarUrl(currentUser?.id, currentUser?.name)}
                alt="User avatar"
                onError={(e) => handleAvatarError(e, currentUser?.name)}
                className="w-9 h-9 rounded-xl object-cover border border-blue-500/30 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentUser?.name || 'Krishna Sevkani'}</h4>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'krishnasevkani99@gmail.com'}</p>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:border-red-500/60 font-bold text-xs transition-all"
            >
              <LogOut className="w-4 h-4 text-red-400 shrink-0" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <img
              src={currentUser?.avatar || getAvatarUrl(currentUser?.id, currentUser?.name)}
              alt="User avatar"
              onError={(e) => handleAvatarError(e, currentUser?.name)}
              className="w-10 h-10 rounded-xl object-cover border border-blue-500/30 shrink-0"
              title={`${currentUser?.name || 'User'} (${currentUser?.email || ''})`}
            />
            <button
              onClick={onSignOut}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

