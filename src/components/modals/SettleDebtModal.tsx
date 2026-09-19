import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { RoomMember, DebtTransfer } from '../../types';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  members: RoomMember[];
  currentUserId: string;
  currency: string;
  initialDebt?: DebtTransfer | null;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  currentUserId,
  currency,
  initialDebt,
}) => {
  const [fromUserId, setFromUserId] = useState<string>(initialDebt?.fromUserId || currentUserId);
  const [toUserId, setToUserId] = useState<string>(
    initialDebt?.toUserId || members.find((m) => m.userId !== currentUserId)?.userId || ''
  );
  const [amount, setAmount] = useState<number>(initialDebt?.amount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [settledDate, setSettledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDebt) {
      setFromUserId(initialDebt.fromUserId);
      setToUserId(initialDebt.toUserId);
      setAmount(initialDebt.amount);
    }
  }, [initialDebt]);

  if (!isOpen) return null;

  const toUserMember = members.find((m) => m.userId === toUserId);
  const toUserUpi = toUserMember?.user?.upiId;

  const handleCopyUpi = () => {
    if (toUserUpi) {
      navigator.clipboard.writeText(toUserUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromUserId || !toUserId) {
      setError('Please select both payer and receiver roommates.');
      return;
    }
    if (fromUserId === toUserId) {
      setError('Payer and receiver cannot be the same person.');
      return;
    }
    if (amount <= 0) {
      setError('Settlement amount must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        fromUserId,
        toUserId,
        amount,
        paymentMethod,
        transactionRef,
        settledDate,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Settle Roommate Debt</h2>
              <p className="text-[11px] text-slate-500">Record reimbursement between roommates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transfer Visualizer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex-1 text-center">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                Payer (Debtor)
              </span>
              <select
                id="settle-from-user"
                value={fromUserId}
                onChange={(e) => setFromUserId(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.userId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center justify-center pt-3 text-slate-400">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 mt-0.5">PAYS</span>
            </div>

            <div className="flex-1 text-center">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                Recipient (Creditor)
              </span>
              <select
                id="settle-to-user"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-200 bg-white"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.userId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient UPI ID Banner */}
          {toUserUpi ? (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-700 block">
                  {toUserMember?.user?.name}'s UPI ID
                </span>
                <span className="font-mono font-semibold text-slate-800">{toUserUpi}</span>
              </div>
              <button
                type="button"
                id="copy-recipient-upi"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-sky-300 text-sky-700 rounded-lg hover:bg-sky-100 transition-all"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              Note: {toUserMember?.user?.name} hasn't added a UPI ID yet. Settle via Cash or request their UPI.
            </div>
          )}

          {/* Amount and Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount ({currency})
              </label>
              <input
                id="settle-amount-input"
                type="number"
                step="0.5"
                min="0.5"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                id="settle-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash In Hand</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Settled Date
              </label>
              <input
                id="settle-date-input"
                type="date"
                value={settledDate}
                onChange={(e) => setSettledDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Transaction Ref / Note
              </label>
              <input
                id="settle-ref-input"
                type="text"
                placeholder="e.g. Cleared August water bill"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-settlement-button"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Recording...' : 'Confirm Settlement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
