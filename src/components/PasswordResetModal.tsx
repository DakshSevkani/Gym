import React, { useState } from 'react';
import { X, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { emailApi } from '../api/emailApi';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onShowToast('Please enter your email', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await emailApi.requestPasswordReset(email);
      onShowToast(res.message || 'Verification code sent to email!', 'success');
      if (res.verificationToken) {
        setToken(res.verificationToken);
      }
      setStep(2);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to request password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      onShowToast('Verification code and new password required.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await emailApi.verifyPasswordReset(token, newPassword);
      onShowToast(res.message || 'Password reset verified!', 'success');
      onClose();
      setStep(1);
    } catch (err: any) {
      onShowToast(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Reset Account Password</h3>
            <p className="text-xs text-slate-400">Email Verification Protocol</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-400 block mb-1">Enter Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="krishnasevkani99@gmail.com"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/80"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Code...' : 'Request Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyReset} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-400 block mb-1">Verification Token Code</label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. RESET-849201"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500/80"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/80"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Set New Password & Confirm'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
