import React from 'react';
import {
  Droplet,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DashboardSummary, DebtTransfer, WaterOrder } from '../types';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  currency: string;
  currentUserId: string;
  onOpenNewOrder: () => void;
  onQuickOrder: (cans: number) => void;
  onOpenRecordPayment: (orderId?: string) => void;
  onOpenSettleDebt: (debt?: DebtTransfer) => void;
  onViewAllOrders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  currency,
  currentUserId,
  onOpenNewOrder,
  onQuickOrder,
  onOpenRecordPayment,
  onOpenSettleDebt,
  onViewAllOrders,
}) => {
  if (loading || !summary) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading room dashboard...</p>
      </div>
    );
  }

  const userReport = summary.memberReports.find((m) => m.userId === currentUserId);
  const netBalance = summary.userNetBalance;

  // Max spend in monthly chart for relative height
  const maxSpend = Math.max(...summary.monthlyChart.map((m) => m.spend), 50);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: User Balance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Personal Balance Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Your Net Balance</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {summary.activeMembersCount} Roommates
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold tracking-tight ${
                  netBalance > 0
                    ? 'text-emerald-600'
                    : netBalance < 0
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {netBalance > 0 ? '+' : ''}
                {currency}
                {Math.abs(netBalance).toFixed(2)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  netBalance > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : netBalance < 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'All settled'}
              </span>
            </div>

            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Vendor payments made by you:</span>
                <span className="font-semibold text-slate-800">
                  {currency}
                  {(userReport?.vendorPaymentsMade || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Your consumed share of water:</span>
                <span className="font-semibold text-slate-800">
                  {currency}
                  {(userReport?.costShareIncurred || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              id="dashboard-settle-up-btn"
              type="button"
              onClick={() => onOpenSettleDebt()}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settle Up</span>
            </button>
            <button
              id="dashboard-record-payment-btn"
              type="button"
              onClick={() => onOpenRecordPayment()}
              className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Vendor</span>
            </button>
          </div>
        </div>

        {/* Quick Can Ordering & Actions */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 text-white shadow-md shadow-sky-700/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                  <Droplet className="w-4 h-4 fill-white" />
                </div>
                <h3 className="font-bold text-base">Quick Water Delivery</h3>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-medium backdrop-blur-md">
                Standard Rate: {currency}
                {summary.defaultPricePerCan}/can
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-2">
              Did the delivery boy just deliver water cans? Tap a quick button or enter detailed order:
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              id="quick-order-1-can"
              type="button"
              onClick={() => onQuickOrder(1)}
              className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-center font-bold text-sm transition-all hover:scale-102 flex flex-col items-center gap-0.5"
            >
              <span>+ 1 Can</span>
              <span className="text-[10px] font-normal text-sky-200">
                {currency}
                {summary.defaultPricePerCan}
              </span>
            </button>
            <button
              id="quick-order-2-cans"
              type="button"
              onClick={() => onQuickOrder(2)}
              className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-center font-bold text-sm transition-all hover:scale-102 flex flex-col items-center gap-0.5"
            >
              <span>+ 2 Cans</span>
              <span className="text-[10px] font-normal text-sky-200">
                {currency}
                {summary.defaultPricePerCan * 2}
              </span>
            </button>
            <button
              id="quick-order-3-cans"
              type="button"
              onClick={() => onQuickOrder(3)}
              className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-center font-bold text-sm transition-all hover:scale-102 flex flex-col items-center gap-0.5"
            >
              <span>+ 3 Cans</span>
              <span className="text-[10px] font-normal text-sky-200">
                {currency}
                {summary.defaultPricePerCan * 3}
              </span>
            </button>
            <button
              id="detailed-new-order-btn"
              type="button"
              onClick={onOpenNewOrder}
              className="py-2.5 px-3 rounded-xl bg-white text-sky-800 hover:bg-sky-50 text-center font-bold text-sm shadow-sm transition-all hover:scale-102 flex flex-col items-center justify-center gap-0.5"
            >
              <span className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Custom
              </span>
              <span className="text-[10px] font-medium text-sky-600">Splits & Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summaries: Daily, Weekly, Monthly, Pending Vendor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today's Water</span>
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {summary.todayCans} <span className="text-xs font-normal text-slate-500">cans</span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {currency}
              {summary.todaySpend.toFixed(0)}
            </span>
          </div>
        </div>

        {/* This Week */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Past 7 Days</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {summary.weekCans} <span className="text-xs font-normal text-slate-500">cans</span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {currency}
              {summary.weekSpend.toFixed(0)}
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>This Month</span>
            <Droplet className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {summary.monthCans} <span className="text-xs font-normal text-slate-500">cans</span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {currency}
              {summary.monthSpend.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Vendor Dues Pending */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Vendor Unpaid Dues</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl font-bold ${
                summary.totalVendorPending > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {currency}
              {summary.totalVendorPending.toFixed(0)}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {summary.unpaidOrdersCount} {summary.unpaidOrdersCount === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>
      </div>

      {/* Debts Simplification Section ("Who Owes Whom") */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Room Debts & Settlements</h3>
              <p className="text-[11px] text-slate-500">
                Optimal repayments calculated to settle all roommate balances
              </p>
            </div>
          </div>
          <button
            type="button"
            id="dashboard-new-settle-btn"
            onClick={() => onOpenSettleDebt()}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Record Settlement</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {summary.debts.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800">Everyone is all settled up!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No outstanding roommate debts. All water costs are fully balanced.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.debts.map((d, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: d.fromUser?.avatarColor || '#64748b' }}
                  >
                    {d.fromUser?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {d.fromUser?.name}{' '}
                      <span className="font-normal text-slate-500">owes</span> {d.toUser?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {currency}
                      {d.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id={`settle-debt-${idx}`}
                  onClick={() => onOpenSettleDebt(d)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  Settle Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Consumption & Spend Trend Chart */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Monthly Water Consumption & Spend</h3>
            <p className="text-[11px] text-slate-500">6-month trend for budgeting and forecasting</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" /> Cans
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Spend ({currency})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40 pt-4 border-b border-slate-100">
          {summary.monthlyChart.map((item, idx) => {
            const heightPercent = maxSpend > 0 ? Math.min(100, (item.spend / maxSpend) * 100) : 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-700">
                  {item.cans > 0 ? `${item.cans}c` : '-'}
                </span>
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 relative">
                  <div
                    className="w-full bg-gradient-to-t from-sky-600 to-sky-400 transition-all rounded-t-lg"
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${item.cans} cans (${currency}${item.spend})`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center">
                  {item.monthName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Pending Vendor Deliveries & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Vendor Dues */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Pending Orders to Pay Vendor</span>
            </h3>
            {summary.pendingVendorOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                {summary.pendingVendorOrders.length} Dues
              </span>
            )}
          </div>

          {summary.pendingVendorOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              All delivered water orders have been paid to the vendor.
            </p>
          ) : (
            <div className="space-y-2.5">
              {summary.pendingVendorOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      Order #{o.orderNumber} ({o.cansCount} {o.cansCount === 1 ? 'can' : 'cans'})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Date: {o.orderDate} • Ordered by {o.orderedByUser?.name || 'Roommate'}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-rose-600 block">
                        Due {currency}
                        {o.pendingAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">of {currency}{o.totalCost}</span>
                    </div>
                    <button
                      type="button"
                      id={`pay-vendor-order-${o.orderNumber}`}
                      onClick={() => onOpenRecordPayment(o.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Water Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900">Recent Orders</h3>
            <button
              type="button"
              id="view-all-orders-link"
              onClick={onViewAllOrders}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {summary.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {o.cansCount}c
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>Order #{o.orderNumber}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {o.orderDate} • {o.orderedByUser?.name || 'Roommate'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-semibold text-slate-900">
                    {currency}
                    {o.totalCost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
