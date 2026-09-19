import React, { useState, useEffect } from 'react';
import { X, Droplet, Users, DollarSign, Check, AlertCircle } from 'lucide-react';
import { RoomMember, WaterOrder } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => Promise<void>;
  members: RoomMember[];
  currentUserId: string;
  defaultPrice: number;
  currency: string;
  supplierName?: string;
  initialOrder?: WaterOrder | null;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  currentUserId,
  defaultPrice,
  currency,
  supplierName,
  initialOrder,
}) => {
  const [cansCount, setCansCount] = useState<number>(initialOrder?.cansCount || 2);
  const [pricePerCan, setPricePerCan] = useState<number>(initialOrder?.pricePerCan || defaultPrice);
  const [orderDate, setOrderDate] = useState<string>(
    initialOrder?.orderDate || new Date().toISOString().split('T')[0]
  );
  const [deliveryStatus, setDeliveryStatus] = useState<'ordered' | 'delivered' | 'cancelled'>(
    initialOrder?.deliveryStatus || 'delivered'
  );
  const [orderedByUserId, setOrderedByUserId] = useState<string>(
    initialOrder?.orderedByUserId || currentUserId
  );
  const [splitType, setSplitType] = useState<'equal' | 'custom'>(
    initialOrder?.splitType || 'equal'
  );
  const [notes, setNotes] = useState<string>(initialOrder?.notes || '');
  const [supplier, setSupplier] = useState<string>(
    initialOrder?.supplierName || supplierName || ''
  );

  // Upfront Payment state (only for new orders)
  const [hasUpfrontPayment, setHasUpfrontPayment] = useState<boolean>(!initialOrder);
  const [paidByUserId, setPaidByUserId] = useState<string>(currentUserId);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Custom split values per member
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeMembers = members.filter((m) => m.status === 'active');
  const totalCost = cansCount * pricePerCan;

  // Initialize payment amount when total cost changes
  useEffect(() => {
    if (!initialOrder && hasUpfrontPayment) {
      setPaymentAmount(totalCost);
    }
  }, [totalCost, initialOrder, hasUpfrontPayment]);

  // Initialize or re-equalize custom splits
  useEffect(() => {
    if (splitType === 'custom') {
      const share = Math.floor((totalCost / (activeMembers.length || 1)) * 100) / 100;
      const initSplits: Record<string, number> = {};
      activeMembers.forEach((m) => {
        initSplits[m.userId] = share;
      });
      setCustomSplits(initSplits);
    }
  }, [splitType, totalCost]);

  if (!isOpen) return null;

  const handleCustomSplitChange = (userId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomSplits((prev) => ({ ...prev, [userId]: num }));
  };

  const customTotal = Object.values(customSplits).reduce((sum, v) => sum + (v || 0), 0);
  const splitDiff = Math.round((totalCost - customTotal) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cansCount <= 0) {
      setError('Please enter at least 1 water can.');
      return;
    }
    if (pricePerCan <= 0) {
      setError('Price per can must be positive.');
      return;
    }

    let splitsData: Array<{ userId: string; amount: number }> = [];

    if (splitType === 'custom') {
      if (Math.abs(splitDiff) > 0.05) {
        setError(
          `Custom split total (${currency}${customTotal.toFixed(2)}) must match order cost (${currency}${totalCost.toFixed(2)}). Difference: ${currency}${splitDiff.toFixed(2)}`
        );
        return;
      }
      splitsData = Object.entries(customSplits).map(([userId, amount]) => ({
        userId,
        amount: Math.round(amount * 100) / 100,
      }));
    } else {
      const count = activeMembers.length || 1;
      const baseShare = Math.floor((totalCost / count) * 100) / 100;
      const rem = Math.round((totalCost - baseShare * count) * 100) / 100;
      splitsData = activeMembers.map((m, idx) => ({
        userId: m.userId,
        amount: idx === 0 ? Math.round((baseShare + rem) * 100) / 100 : baseShare,
      }));
    }

    setLoading(true);
    try {
      const payload: any = {
        cansCount,
        pricePerCan,
        orderDate,
        deliveryStatus,
        orderedByUserId,
        splitType,
        splits: splitsData,
        notes,
        supplierName: supplier,
      };

      if (!initialOrder && hasUpfrontPayment && paymentAmount > 0) {
        payload.upfrontPayment = {
          amount: paymentAmount,
          paidByUserId,
          paymentMethod,
          transactionRef: paymentRef,
          paymentDate: orderDate,
        };
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {initialOrder ? `Edit Order #${initialOrder.orderNumber}` : 'Record New Water Can Order'}
            </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Cans & Price Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-100 font-semibold block">
                Total Order Cost
              </span>
              <span className="text-2xl font-black tracking-tight">
                {currency}
                {totalCost.toFixed(2)}
              </span>
              <span className="text-xs text-sky-100 block mt-0.5">
                ({cansCount} {cansCount === 1 ? 'can' : 'cans'} × {currency}
                {pricePerCan})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-sky-100 font-medium block">Per Roommate Share</span>
              <span className="text-lg font-bold">
                {currency}
                {(totalCost / (activeMembers.length || 1)).toFixed(2)}
              </span>
              <span className="text-[10px] text-sky-100 block">({activeMembers.length} active)</span>
            </div>
          </div>

          {/* Quick Cans Counter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Number of Cans
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCansCount(num)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                    cansCount === num
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
              <input
                id="custom-cans-count"
                type="number"
                min="1"
                max="50"
                value={cansCount}
                onChange={(e) => setCansCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-2 text-center text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                title="Custom can quantity"
              />
            </div>
          </div>

          {/* Price & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Price per Can ({currency})
              </label>
              <input
                id="order-price-per-can"
                type="number"
                min="1"
                step="1"
                value={pricePerCan}
                onChange={(e) => setPricePerCan(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Order Date
              </label>
              <input
                id="order-date-picker"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Ordered By & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ordered / Received By
              </label>
              <select
                id="order-ordered-by"
                value={orderedByUserId}
                onChange={(e) => setOrderedByUserId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.userId} {m.userId === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Delivery Status
              </label>
              <select
                id="order-delivery-status"
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
              >
                <option value="delivered">Delivered & Stored</option>
                <option value="ordered">Ordered / On The Way</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cost Splitting Strategy */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Cost Splitting
              </label>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  id="split-equal-tab"
                  onClick={() => setSplitType('equal')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    splitType === 'equal' ? 'bg-white shadow-xs text-sky-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  id="split-custom-tab"
                  onClick={() => setSplitType('custom')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    splitType === 'custom' ? 'bg-white shadow-xs text-sky-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  Custom Split
                </button>
              </div>
            </div>

            {splitType === 'equal' ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Equally shared among {activeMembers.length} active roommates:</span>
                  <span className="font-bold text-slate-900">
                    {currency}
                    {(totalCost / (activeMembers.length || 1)).toFixed(2)} each
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeMembers.map((m) => (
                    <span
                      key={m.userId}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]"
                    >
                      {m.user?.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Assign individual shares:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      Math.abs(splitDiff) < 0.05
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {Math.abs(splitDiff) < 0.05 ? 'Balanced ✓' : `Diff: ${currency}${splitDiff.toFixed(2)}`}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activeMembers.map((m) => (
                    <div key={m.userId} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-700 truncate">{m.user?.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">{currency}</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={customSplits[m.userId] ?? ''}
                          onChange={(e) => handleCustomSplitChange(m.userId, e.target.value)}
                          className="w-20 px-2 py-1 text-xs text-right font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upfront Payment to Vendor (Only for new orders) */}
          {!initialOrder && (
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  id="order-has-upfront-payment"
                  checked={hasUpfrontPayment}
                  onChange={(e) => setHasUpfrontPayment(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Payment was made to water delivery vendor right now
                </span>
              </label>

              {hasUpfrontPayment && (
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Who Paid Vendor?
                      </label>
                      <select
                        id="order-upfront-paid-by"
                        value={paidByUserId}
                        onChange={(e) => setPaidByUserId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.user?.name || m.userId} {m.userId === currentUserId ? '(You)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Payment Method
                      </label>
                      <select
                        id="order-upfront-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                        <option value="Cash">Cash on Delivery</option>
                        <option value="Card">Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Amount Paid ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        UPI Ref / UTR / Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paid to Ganga RO via GPay"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Notes & Supplier */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Water Supplier Name
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Ganga Water Supplier"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra jar for weekend guest"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-order-button"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Order...' : initialOrder ? 'Save Changes' : 'Confirm Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
