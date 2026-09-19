import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Droplet,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { MemberBalanceReport, DebtTransfer } from '../types';

interface BalancesViewProps {
  reports: MemberBalanceReport[];
  debts: DebtTransfer[];
  currency: string;
  currentUserId: string;
  loading: boolean;
  onOpenSettleDebt: (debt?: DebtTransfer) => void;
}

export const BalancesView: React.FC<BalancesViewProps> = ({
  reports,
  debts,
  currency,
  currentUserId,
  loading,
  onOpenSettleDebt,
}) => {
  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-500">Loading balance reports...</div>;
  }

  const totalSpent = reports.reduce((acc, r) => acc + r.costShareIncurred, 0);
  const totalPaid = reports.reduce((acc, r) => acc + r.vendorPaymentsMade, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>Roommate Balances & Cost Sharing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual contributions, fair share splits, and net balance settlements
          </p>
        </div>

        <button
          type="button"
          id="balances-settle-btn"
          onClick={() => onOpenSettleDebt()}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Settle Up Roommate</span>
        </button>
      </div>

      {/* Suggested Settlements (Optimal Debt Transfers) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Optimal Settlements</h3>
            <p className="text-[11px] text-slate-500">
              Minimizes transactions so everyone clears dues with the fewest payments
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
            {debts.length} {debts.length === 1 ? 'Transfer' : 'Transfers'} Needed
          </span>
        </div>

        {debts.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800">No outstanding debts</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All roommates have paid their exact fair share.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {debts.map((d, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 hover:bg-slate-100/70 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: d.fromUser?.avatarColor || '#64748b' }}
                    >
                      {d.fromUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {d.fromUser?.name} {d.fromUserId === currentUserId ? '(You)' : ''}
                      </p>
                      <p className="text-[10px] text-slate-500">Debtor</p>
                    </div>
                  </div>

                  <div className="text-center px-1 text-slate-400">
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-right min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {d.toUser?.name} {d.toUserId === currentUserId ? '(You)' : ''}
                      </p>
                      <p className="text-[10px] text-slate-500">Creditor</p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: d.toUser?.avatarColor || '#64748b' }}
                    >
                      {d.toUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Amount</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {currency}
                      {d.amount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSettleDebt(d)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Settle Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roommate Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 px-1">
          Detailed Roommate Spending & Balances
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => {
            const isSelf = r.userId === currentUserId;
            return (
              <div
                key={r.userId}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  isSelf ? 'border-sky-300 ring-2 ring-sky-500/10 shadow-sm' : 'border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: r.user?.avatarColor || '#0284c7' }}
                    >
                      {r.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{r.user?.name}</span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{r.role}</span>
                        <span>•</span>
                        <span className={r.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Balance Badge */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md inline-block ${
                        r.netBalance > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.netBalance < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.netBalance > 0 ? '+' : ''}
                      {currency}
                      {Math.abs(r.netBalance).toFixed(2)}
                    </span>
                    <span className="text-[10px] block text-slate-500 mt-0.5">
                      {r.netBalance > 0 ? 'Gets back' : r.netBalance < 0 ? 'Owes room' : 'Settled'}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Cans Ordered by {r.user?.name?.split(' ')[0]}:</span>
                    <span className="font-semibold text-slate-900">{r.cansOrdered} cans</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Vendor Payments Made:</span>
                    <span className="font-semibold text-emerald-600">
                      {currency}
                      {r.vendorPaymentsMade.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fair Cost Share Incurred:</span>
                    <span className="font-semibold text-slate-900">
                      {currency}
                      {r.costShareIncurred.toFixed(2)}
                    </span>
                  </div>
                  {(r.settlementsPaid > 0 || r.settlementsReceived > 0) && (
                    <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-dashed border-slate-200">
                      <span>Peer Settlements:</span>
                      <span>
                        Paid {currency}{r.settlementsPaid} / Rcvd {currency}{r.settlementsReceived}
                      </span>
                    </div>
                  )}
                  {r.user?.upiId && (
                    <div className="text-[11px] text-sky-700 font-mono pt-1">
                      UPI: {r.user.upiId}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logic Guide Note */}
      <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-800 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold">How cost sharing & vendor payments work in WaterMate:</strong>
          <span>
            When a roommate pays the water vendor, that counts toward vendor dues. The cost of that order is then
            divided among all roommates according to the split rule (equal or custom). Roommates who paid less than
            their consumed share owe the roommate who paid the vendor.
          </span>
        </div>
      </div>
    </div>
  );
};
