import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertCircle, DollarSign } from 'lucide-react';
import { RoomMember, WaterOrder } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, paymentData: any) => Promise<void>;
  members: RoomMember[];
  currentUserId: string;
  currency: string;
  orders: WaterOrder[];
  preselectedOrderId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  currentUserId,
  currency,
  orders,
  preselectedOrderId,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId || '');
  const [amount, setAmount] = useState<number>(0);
  const [paidByUserId, setPaidByUserId] = useState<string>(currentUserId);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.deliveryStatus === 'delivered');

  useEffect(() => {
    if (preselectedOrderId) {
      setSelectedOrderId(preselectedOrderId);
    } else if (activeOrders.length > 0 && !selectedOrderId) {
      // Pick first unpaid or partially paid order
      const pendingOrder = activeOrders.find((o) => o.paymentStatus !== 'PAID');
      setSelectedOrderId(pendingOrder ? pendingOrder.id : activeOrders[0].id);
    }
  }, [preselectedOrderId, activeOrders]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Set default amount to pending amount when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setAmount(selectedOrder.pendingAmount > 0 ? selectedOrder.pendingAmount : selectedOrder.totalCost);
    }
  }, [selectedOrderId, selectedOrder]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOrderId) {
      setError('Please select an order to attach payment to.');
      return;
    }
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedOrderId, {
        amount,
        paidByUserId,
        paymentMethod,
        transactionRef,
        paymentDate,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Vendor Payment</h2>
              <p className="text-[11px] text-slate-500">Paid to water delivery supplier</p>
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
          {/* Order Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Water Order
            </label>
            <select
              id="payment-order-select"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
            >
              {activeOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.orderNumber} ({o.orderDate}) - {o.cansCount} cans | {currency}
                  {o.totalCost} (Pending: {currency}
                  {o.pendingAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Order Summary Card */}
          {selectedOrder && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-800">Order #{selectedOrder.orderNumber} Status</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    selectedOrder.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrder.paymentStatus === 'PARTIALLY_PAID'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total</span>
                  <span className="font-bold text-slate-900">
                    {currency}
                    {selectedOrder.totalCost.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Paid So Far</span>
                  <span className="font-bold text-emerald-600">
                    {currency}
                    {selectedOrder.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Pending Due</span>
                  <span className="font-bold text-rose-600">
                    {currency}
                    {selectedOrder.pendingAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Amount and Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount Paid ({currency})
              </label>
              <div className="relative">
                <input
                  id="payment-amount-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                {selectedOrder && selectedOrder.pendingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedOrder.pendingAmount)}
                    className="absolute right-2 top-1.5 px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-700 rounded-md hover:bg-sky-200"
                  >
                    Exact Due
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Paid by Roommate
              </label>
              <select
                id="payment-paid-by-select"
                value={paidByUserId}
                onChange={(e) => setPaidByUserId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.userId} {m.userId === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash to Delivery Boy</option>
                <option value="Card">Card / POS</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input
                id="payment-date-input"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Transaction Ref / UTR / Note (Optional)
            </label>
            <input
              id="payment-ref-input"
              type="text"
              placeholder="e.g. UPI/625341789/Ganga"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
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
              id="submit-payment-button"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
