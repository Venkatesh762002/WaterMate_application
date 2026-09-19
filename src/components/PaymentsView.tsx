import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Users,
} from 'lucide-react';
import { OrderPayment, Settlement, RoomMember } from '../types';

interface PaymentsViewProps {
  payments: OrderPayment[];
  settlements: Settlement[];
  members: RoomMember[];
  currency: string;
  loading: boolean;
  onOpenRecordPayment: () => void;
  onOpenSettleDebt: () => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
  onDeleteSettlement: (settlementId: string) => Promise<void>;
  onExportPaymentsCsv: () => void;
  onExportSettlementsCsv: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  settlements,
  members,
  currency,
  loading,
  onOpenRecordPayment,
  onOpenSettleDebt,
  onDeletePayment,
  onDeleteSettlement,
  onExportPaymentsCsv,
  onExportSettlementsCsv,
}) => {
  const [subTab, setSubTab] = useState<'vendor' | 'settlements'>('vendor');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');

  // Vendor Payments filter
  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
    if (memberFilter !== 'all' && p.paidByUserId !== memberFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = p.transactionRef?.toLowerCase().includes(q);
      const matchNote = p.notes?.toLowerCase().includes(q);
      const matchUser = p.paidByUser?.name?.toLowerCase().includes(q);
      const matchOrder = p.orderNumber?.toString().includes(q);
      if (!matchRef && !matchNote && !matchUser && !matchOrder) return false;
    }
    return true;
  });

  // Settlements filter
  const filteredSettlements = settlements.filter((s) => {
    if (methodFilter !== 'all' && s.paymentMethod !== methodFilter) return false;
    if (memberFilter !== 'all' && s.fromUserId !== memberFilter && s.toUserId !== memberFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = s.transactionRef?.toLowerCase().includes(q);
      const matchNote = s.notes?.toLowerCase().includes(q);
      const matchFrom = s.fromUser?.name?.toLowerCase().includes(q);
      const matchTo = s.toUser?.name?.toLowerCase().includes(q);
      if (!matchRef && !matchNote && !matchFrom && !matchTo) return false;
    }
    return true;
  });

  const totalVendorPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" />
            <span>Payments & Settlements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of payments made to water vendors and repayments between roommates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'vendor' ? (
            <>
              <button
                type="button"
                id="export-vendor-payments-btn"
                onClick={onExportPaymentsCsv}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                type="button"
                id="record-vendor-payment-btn"
                onClick={onOpenRecordPayment}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Pay Vendor</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                id="export-settlements-btn"
                onClick={onExportSettlementsCsv}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                type="button"
                id="record-settlement-btn"
                onClick={onOpenSettleDebt}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Settle Debt</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Vendor Payments vs Roommate Settlements */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          type="button"
          id="tab-vendor-payments"
          onClick={() => setSubTab('vendor')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'vendor'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Vendor Delivery Payments ({payments.length})</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono">
            {currency}{totalVendorPaid.toFixed(2)}
          </span>
        </button>
        <button
          type="button"
          id="tab-roommate-settlements"
          onClick={() => setSubTab('settlements')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'settlements'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roommate Settlements ({settlements.length})</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
            {currency}{totalSettled.toFixed(2)}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="payments-search-input"
            type="text"
            placeholder={
              subTab === 'vendor'
                ? 'Search by order #, roommate name, UTR ref...'
                : 'Search by roommate name, note, ref...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              id="filter-payment-method"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Roommate
            </label>
            <select
              id="filter-payment-member"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Roommates</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.userId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading records...</div>
      ) : subTab === 'vendor' ? (
        filteredPayments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No vendor payments found</p>
            <p className="text-xs text-slate-500 mt-1">
              Payments made to delivery boys for water cans will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center shrink-0 border border-sky-100">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {p.paidByUser?.name || 'Roommate'}
                      </span>
                      <span className="text-xs text-slate-500">paid for Order #{p.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{p.paymentDate}</span>
                      {p.transactionRef && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600">Ref: {p.transactionRef}</span>
                        </>
                      )}
                      {p.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">"{p.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="font-extrabold text-base text-slate-900">
                    {currency}
                    {p.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete this payment record of ${currency}${p.amount}?`)) {
                        onDeletePayment(p.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete payment record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredSettlements.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No roommate settlements yet</p>
          <p className="text-xs text-slate-500 mt-1">
            When roommates repay each other, record it here to clear debts.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSettlements.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{s.fromUser?.name}</span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5" /> paid
                    </span>
                    <span className="font-bold text-sm text-slate-900">{s.toUser?.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.paymentMethod}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{s.settledDate}</span>
                    {s.transactionRef && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-600">Ref: {s.transactionRef}</span>
                      </>
                    )}
                    {s.notes && (
                      <>
                        <span>•</span>
                        <span className="italic">"{s.notes}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="font-extrabold text-base text-emerald-600">
                  {currency}
                  {s.amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete this settlement of ${currency}${s.amount}?`)) {
                      onDeleteSettlement(s.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete settlement record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
