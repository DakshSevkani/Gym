import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColor =
    toast.type === 'error'
      ? 'bg-red-950/90 border-red-500/50 text-red-200'
      : toast.type === 'success'
      ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
      : 'bg-zinc-900/90 border-zinc-700 text-zinc-200';

  const icon =
    toast.type === 'error' ? (
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
    ) : toast.type === 'success' ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    ) : (
      <Info className="w-5 h-5 text-yellow-400 shrink-0" />
    );

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgColor}`}>
      {icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{toast.text}</div>
      <button onClick={() => onClose(toast.id)} className="text-zinc-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastContainer;
