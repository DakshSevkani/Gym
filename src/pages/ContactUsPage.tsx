import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { emailApi } from '../api/emailApi';

interface ContactUsPageProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onShowToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      onShowToast('Please provide your email and message', 'error');
      return;
    }

    try {
      setSending(true);
      const res = await emailApi.sendContactMessage({ name, email, subject, message });
      onShowToast(res.message || 'Contact message sent successfully!', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Mail className="w-7 h-7 text-amber-400" />
          <span>Contact Support & Management</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Send a direct inquiry to PowerHouse Gym management.</p>
      </div>

      <div className="p-8 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Krishna Sevkani"
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="krishnasevkani99@gmail.com"
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Membership inquiry, trainer request, billing..."
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1">Message</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can our management team assist you?"
              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-4 text-zinc-200 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;
