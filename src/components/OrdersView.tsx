import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Download,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
} from 'lucide-react';
import { WaterOrder, RoomMember } from '../types';

interface OrdersViewProps {
  orders: WaterOrder[];
  members: RoomMember[];
  currency: string;
  currentUserId: string;
  loading: boolean;
  onOpenNewOrder: () => void;
  onEditOrder: (order: WaterOrder) => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onRecordPayment: (orderId: string) => void;
  onExportCsv: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  members,
  currency,
  currentUserId,
  loading,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onRecordPayment,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Client-side filtering
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.deliveryStatus !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (memberFilter !== 'all' && o.orderedByUserId !== memberFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toString().includes(q);
      const matchNotes = o.notes?.toLowerCase().includes(q);
      const matchUser = o.orderedByUser?.name?.toLowerCase().includes(q);
      const matchSupplier = o.supplierName?.toLowerCase().includes(q);
      if (!matchNum && !matchNotes && !matchUser && !matchSupplier) return false;
    }
    return true;
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header with Title, New Order & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-600" />
            <span>Water Can Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily room water deliveries, split shares & vendor payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="orders-export-csv"
            onClick={onExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
            title="Download CSV report of all orders"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button"
            id="orders-new-order-btn"
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Search by order #, roommate name, notes, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Delivery Status
            </label>
            <select
              id="filter-delivery-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="ordered">Ordered / En Route</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Status
            </label>
            <select
              id="filter-payment-status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Payment Statuses</option>
              <option value="PAID">Fully Paid to Vendor</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="UNPAID">Unpaid Vendor Due</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ordered By
            </label>
            <select
              id="filter-ordered-by"
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

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No orders match your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters or record a new water order.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const isExpanded = expandedOrderId === o.id;
            const percentPaid = Math.min(100, Math.round((o.paidAmount / (o.totalCost || 1)) * 100));

            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Order Card Row */}
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(o.id)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Can Quantity Pill */}
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-base leading-none">{o.cansCount}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold">
                        {o.cansCount === 1 ? 'CAN' : 'CANS'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          Order #{o.orderNumber}
                        </span>

                        {/* Payment Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>

                        {/* Delivery Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            o.deliveryStatus === 'delivered'
                              ? 'bg-slate-100 text-slate-700'
                              : o.deliveryStatus === 'ordered'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-slate-200 text-slate-500 line-through'
                          }`}
                        >
                          {o.deliveryStatus}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{o.orderDate}</span>
                        <span>•</span>
                        <span>
                          Ordered by <strong className="text-slate-700">{o.orderedByUser?.name || 'Roommate'}</strong>
                        </span>
                        {o.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 truncate max-w-[180px]">"{o.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Expand Indicator */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900">
                        {currency}
                        {o.totalCost.toFixed(2)}
                      </div>
                      <div className="text-[11px]">
                        {o.pendingAmount > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            Due: {currency}{o.pendingAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Fully Paid</span>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Vendor Payment */}
                <div className="w-full bg-slate-100 h-1">
                  <div
                    className={`h-1 transition-all ${
                      percentPaid >= 100
                        ? 'bg-emerald-500'
                        : percentPaid > 0
                        ? 'bg-amber-500'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs space-y-4">
                    {/* Cost Splitting Breakdown */}
                    <div>
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                        Roommate Cost Shares ({o.splitType === 'equal' ? 'Equal Split' : 'Custom Split'})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {o.splits.map((s) => {
                          const mUser = members.find((m) => m.userId === s.userId)?.user;
                          return (
                            <div
                              key={s.userId}
                              className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-700 truncate pr-1">
                                {mUser?.name || 'Roommate'}
                              </span>
                              <span className="font-bold text-slate-900 shrink-0">
                                {currency}
                                {s.amount.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payments Made to Vendor */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Vendor Payment Records ({o.payments.length})
                        </h4>
                        {o.pendingAmount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordPayment(o.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Record Payment</span>
                          </button>
                        )}
                      </div>

                      {o.payments.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-200">
                          No payments recorded yet. Vendor is waiting for {currency}{o.pendingAmount.toFixed(2)}.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {o.payments.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between flex-wrap gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">
                                  {p.paidByUser?.name || 'Roommate'}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 font-semibold">
                                  {p.paymentMethod}
                                </span>
                                {p.transactionRef && (
                                  <span className="text-slate-400 font-mono text-[10px]">
                                    ({p.transactionRef})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-[11px]">{p.paymentDate}</span>
                                <span className="font-bold text-emerald-600">
                                  {currency}
                                  {p.amount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        id={`edit-order-${o.orderNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOrder(o);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Order</span>
                      </button>
                      <button
                        type="button"
                        id={`delete-order-${o.orderNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete Order #${o.orderNumber}? Linked vendor payment records will also be removed.`)) {
                            onDeleteOrder(o.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
