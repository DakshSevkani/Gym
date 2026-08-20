import React, { useEffect, useState } from 'react';
import {
  Dumbbell,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Users,
  ShieldCheck,
  CreditCard,
  Star,
  Activity,
  Phone,
  Mail
} from 'lucide-react';
import { emailApi } from '../api/emailApi';
import { trainerApi } from '../api/trainerApi';
import { dashboardApi } from '../api/dashboardApi';
import { Trainer } from '../types';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';
import { Footer } from './Footer';

interface LandingPageProps {
  onOpenSignIn: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSignIn,
  onShowToast,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalTrainers: 0,
    activeMemberships: 0
  });

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      const [tRes, dRes] = await Promise.allSettled([
        trainerApi.getTrainers(),
        dashboardApi.getDashboardData()
      ]);

      if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) {
        setTrainers(tRes.value);
      }
      if (dRes.status === 'fulfilled' && dRes.value?.stats) {
        setStats({
          totalMembers: dRes.value.stats.totalMembers || 0,
          totalTrainers: dRes.value.stats.totalTrainers || 0,
          activeMemberships: dRes.value.stats.activeMemberships || 0
        });
      }
    } catch (e) {
      console.warn('Failed to load landing public data', e);
    }
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      onShowToast('Please provide your email and message.', 'error');
      return;
    }

    try {
      setSendingContact(true);
      const res = await emailApi.sendContactMessage({
        name: contactName,
        email: contactEmail,
        subject: contactSubject || 'Gym Inquiry',
        message: contactMessage,
      });
      onShowToast(res.message || 'Message sent successfully!', 'success');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSendingContact(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#334155] px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white block leading-none">
              POWER<span className="text-blue-400">HOUSE</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mt-0.5">
              GYM MANAGEMENT
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
          <button onClick={() => scrollToSection('memberships')} className="hover:text-blue-400 transition-colors">Membership Plans</button>
          <button onClick={() => scrollToSection('trainers')} className="hover:text-blue-400 transition-colors">Expert Trainers</button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSignIn}
            className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Text */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Gym & Fitness Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase">
            TRANSFORM YOUR <br />
            <span className="text-blue-400">FITNESS JOURNEY</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            PowerHouse Gym simplifies membership management, personal trainer assignments, automated billing, and workout tracking in one seamless platform.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenSignIn}
              className="px-7 py-3.5 rounded-full bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2"
            >
              <span>Sign In To Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#334155] w-full max-w-lg">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-blue-400">
                {stats.totalMembers > 0 ? `${stats.totalMembers}+` : '1,200+'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Active Members</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-blue-400">
                {stats.totalTrainers > 0 ? `${stats.totalTrainers}+` : '25+'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Certified Coaches</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-blue-400">24/7</h3>
              <p className="text-xs text-slate-400 font-medium">Facility Access</p>
            </div>
          </div>
        </div>

        {/* Right Frame Hero Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden border border-[#334155] bg-[#1E293B] p-3 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"
              alt="PowerHouse Gym Dumbbell rack"
              className="w-full h-80 sm:h-96 object-cover rounded-2xl"
            />
            {/* Overlay Badge Card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0F172A]/90 border border-[#334155] backdrop-blur-md flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Top-Rated Fitness Center</h4>
                <p className="text-xs text-slate-400">Voted #1 Gym Management & Coaching Suite</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0F172A] border-t border-b border-[#334155] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">POWERFUL CORE MODULES</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Everything You Need To Run A World-Class Gym</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Member Profiles & Expirations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track active subscriptions, renewal dates, days remaining, and assigned personal trainers seamlessly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Certified Personal Coaches</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign expert trainers to members, monitor client counts, ratings, and active workout programs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Automated Billing & Receipts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log payments, view digital official receipts with transaction IDs, and track monthly gross revenue.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Role-Based Access Portals</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailored UI environments for Gym Owners, Personal Trainers, and Individual Gym Members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="memberships" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">TRANSPARENT PRICING</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">Choose Your Gym Membership Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="p-8 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-slate-500 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Basic Monthly</span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">₹1,499</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Full Gym Floor & Cardio Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Locker Room & Shower Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Member App Portal Access</li>
              </ul>
            </div>
            <button
              onClick={onOpenSignIn}
              className="w-full py-3 rounded-2xl bg-slate-700 text-white font-bold text-sm hover:bg-slate-600 transition-colors"
            >
              Sign In To Select
            </button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-3xl bg-[#1E293B] border-2 border-blue-500 relative flex flex-col justify-between shadow-2xl shadow-blue-500/10">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">Pro Quarter</span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">₹3,999</span>
                <span className="text-xs text-slate-400">/ 3 months</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Everything in Basic</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Assigned Personal Trainer Consultation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Free Body Composition Scans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> 24/7 Facility Access</li>
              </ul>
            </div>
            <button
              onClick={onOpenSignIn}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
            >
              Sign In To Select
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between hover:border-slate-500 transition-all">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">VIP Annual</span>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">₹14,999</span>
                <span className="text-xs text-slate-400">/ year</span>
              </div>
              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Unlimited All-Access VIP Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Dedicated Personal Trainer Assigned</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Guest Passes (2 per month)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Complimentary Sauna & Hydro-Massage</li>
              </ul>
            </div>
            <button
              onClick={onOpenSignIn}
              className="w-full py-3 rounded-2xl bg-slate-700 text-white font-bold text-sm hover:bg-slate-600 transition-colors"
            >
              Sign In To Select
            </button>
          </div>
        </div>
      </section>

      {/* Expert Trainers Section */}
      <section id="trainers" className="py-20 bg-[#0F172A] border-t border-b border-[#334155] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">WORLD-CLASS COACHING STAFF</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">Meet Our Certified Personal Trainers</h3>
            <p className="text-xs text-slate-400 mt-2">Elite certified coaches dedicated to your progressive fitness goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {trainers.length > 0 ? (
              trainers.map((t, idx) => (
                <div key={t.id || idx} className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col sm:flex-row items-center gap-5 hover:border-blue-500/40 transition-all">
                  <img
                    src={t.avatar || getAvatarUrl(t.id, t.name)}
                    onError={(e) => handleAvatarError(e, t.name)}
                    alt={t.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between gap-2 mb-1">
                      <h4 className="text-base font-black text-white truncate">{t.name}</h4>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" /> {t.rating ? Number(t.rating).toFixed(1) : '5.0'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-blue-400 mb-1.5">{t.specialty || 'Cardio & Strength'}</p>
                    <p className="text-xs text-slate-400 mb-3">{t.experienceYears || 5}+ years specialized experience coaching personal transformations.</p>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      {t.email && (
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </div>
                      )}
                      {t.phone && (
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{t.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Active trainers list synchronized with system database.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default LandingPage;
