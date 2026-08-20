import React from 'react';
import {
  Dumbbell,
  MapPin,
  Clock,
  Mail,
  Phone,
  Shield,
  Activity,
  Heart,
  Globe
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-[#1E293B] border-t border-[#334155] text-slate-400 mt-12 py-10 px-6 md:px-12 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#334155]">
        {/* Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-base font-black tracking-wider text-white">
              POWER<span className="text-blue-400">HOUSE</span> GYM
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Comprehensive enterprise gym & fitness center management platform. Empowering gym owners, trainers, and fitness members with seamless telemetry and scheduling.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cloud System Operational</span>
          </div>
        </div>

        {/* Location & Operating Hours */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Gym Location & Hours</span>
          </h4>
          <p className="text-slate-300 leading-snug">
            <strong>PowerHouse Main Facility:</strong><br />
            742 Evergreen Terrace, Gym District,<br />
            Metro Fitness City, FC 90210
          </p>
          <div className="pt-1 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mon – Sat: <strong>5:00 AM – 11:00 PM</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Sun & Holidays: <strong>7:00 AM – 8:00 PM</strong></span>
            </div>
          </div>
        </div>

        {/* Contact & Support Hotline */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <span>Helpdesk & Emergency Contact</span>
          </h4>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <a href="mailto:support@powerhousegym.com" className="hover:text-white transition-colors">
                support@powerhousegym.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>General Helpline: <strong>+1 (800) 555-GYM1</strong></span>
            </div>
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency Staff Hotline: +1 (555) 018-9922</span>
            </div>
          </div>
        </div>

        {/* Quick Portal Navigation */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Portal Navigation</span>
          </h4>
          <ul className="space-y-1.5 text-slate-300 font-medium">
            {onNavigateTab && (
              <>
                <li>
                  <button onClick={() => onNavigateTab('dashboard')} className="hover:text-blue-400 transition-colors">
                    • Overview Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('members')} className="hover:text-blue-400 transition-colors">
                    • Member Directory
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('trainers')} className="hover:text-blue-400 transition-colors">
                    • Certified Trainers
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('payments')} className="hover:text-blue-400 transition-colors">
                    • Payments & Invoices
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('notifications')} className="hover:text-blue-400 transition-colors">
                    • Notification Center
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 PowerHouse Gym Management. Frontend - Daksh Sevkani & Backend - Sachin Gupta.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Gym Rules & Safety Guidelines</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
