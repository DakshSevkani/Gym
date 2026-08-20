import React, { useState } from 'react';
import { X, Dumbbell, CheckCircle2, Download, Printer, FileText, Check } from 'lucide-react';
import { downloadReceiptFile, printReceiptDirectly, ReceiptPaymentData } from '../utils/receiptGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, payment, onShowToast }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !payment) return null;

  const paymentData: ReceiptPaymentData = {
    id: payment.id,
    paymentId: payment.paymentId,
    transactionId: payment.transactionId || (payment.paymentId ? `TXN_${payment.paymentId}` : `TXN_${payment.id}`),
    memberName: payment.memberName,
    memberEmail: payment.memberEmail,
    memberPhone: payment.memberPhone,
    planName: payment.planName || payment.membershipPlan,
    amount: payment.amount,
    date: payment.date || payment.paymentDate,
    paymentDate: payment.paymentDate || payment.date,
    method: payment.method || payment.paymentMethod,
    paymentMethod: payment.paymentMethod || payment.method,
    status: payment.status || 'Completed'
  };

  const handlePrint = () => {
    try {
      printReceiptDirectly(paymentData);
      onShowToast('Opening printable invoice window (Choose "Save as PDF" to save).', 'info');
    } catch (err: any) {
      window.print();
    }
  };

  const handleDownload = () => {
    try {
      downloadReceiptFile(paymentData);
      setDownloaded(true);
      onShowToast(`Downloaded receipt for Transaction #${paymentData.transactionId}`, 'success');
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err: any) {
      onShowToast('Failed to generate receipt download file', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1E293B] border border-[#334155] rounded-3xl p-8 shadow-2xl relative text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#0F172A] text-slate-400 hover:text-white border border-[#334155] transition-colors"
          title="Close Receipt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">POWERHOUSE GYM</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">OFFICIAL PAYMENT RECEIPT</p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PAID</span>
          </span>
        </div>

        {/* Transaction Content */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#334155] space-y-3 text-xs mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Transaction ID:</span>
            <strong className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {paymentData.transactionId}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Member Name:</span>
            <strong className="text-white">{paymentData.memberName}</strong>
          </div>
          {paymentData.memberEmail && (
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Member Email:</span>
              <span className="text-slate-300">{paymentData.memberEmail}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Membership Plan:</span>
            <strong className="text-slate-200">{paymentData.planName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Payment Method:</span>
            <span className="text-slate-300">{paymentData.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">Payment Date:</span>
            <span className="text-slate-300">{paymentData.date}</span>
          </div>
          <div className="pt-3 border-t border-[#334155] flex justify-between items-baseline">
            <span className="text-sm font-black text-white">TOTAL AMOUNT PAID:</span>
            <strong className="text-2xl font-black text-emerald-400">
              ₹{Number(paymentData.amount || 0).toLocaleString('en-IN')} INR
            </strong>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            Receipt is verified and ready for download.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-300 hover:text-white hover:border-slate-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownload}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                downloaded
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
              }`}
              title="Download Receipt File"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
