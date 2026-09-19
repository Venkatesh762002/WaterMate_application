import React, { useState } from 'react';
import { X, DoorOpen, Users, Plus, AlertCircle, Check } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'create' | 'join';
  onCreateRoom: (data: any) => Promise<void>;
  onJoinRoom: (inviteCode: string) => Promise<void>;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'create',
  onCreateRoom,
  onJoinRoom,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>(defaultMode);
  const [name, setName] = useState('');
  const [defaultPricePerCan, setDefaultPricePerCan] = useState<number>(35);
  const [currency, setCurrency] = useState('₹');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [canBrand, setCanBrand] = useState('20L Jar');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'create') {
        if (!name.trim()) {
          setError('Please provide a room name.');
          setLoading(false);
          return;
        }
        await onCreateRoom({
          name: name.trim(),
          defaultPricePerCan: Number(defaultPricePerCan) || 35,
          currency,
          supplier: {
            name: supplierName.trim(),
            phone: supplierPhone.trim(),
            canBrand: canBrand.trim(),
          },
        });
      } else {
        if (!inviteCode.trim()) {
          setError('Please provide the room invite code.');
          setLoading(false);
          return;
        }
        await onJoinRoom(inviteCode.trim().toUpperCase());
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <DoorOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {mode === 'create' ? 'Create Bachelor Room' : 'Join Room with Invite Code'}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            id="room-modal-tab-create"
            onClick={() => {
              setMode('create');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'create'
                ? 'bg-white text-sky-600 border-b-2 border-sky-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>
          <button
            type="button"
            id="room-modal-tab-join"
            onClick={() => {
              setMode('join');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'join'
                ? 'bg-white text-sky-600 border-b-2 border-sky-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Join Room</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'create' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Room Name
                </label>
                <input
                  id="create-room-name"
                  type="text"
                  required
                  placeholder="e.g. Koramangala 5th Block Flat 3B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Can Rate ({currency})
                  </label>
                  <input
                    id="create-room-default-price"
                    type="number"
                    min="1"
                    value={defaultPricePerCan}
                    onChange={(e) => setDefaultPricePerCan(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    id="create-room-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Optional Water Supplier Info
                </span>
                <div className="space-y-2.5">
                  <input
                    id="create-supplier-name"
                    type="text"
                    placeholder="Supplier Name (e.g. Ramesh RO Water)"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="create-supplier-phone"
                      type="tel"
                      placeholder="Phone (+91 98765...)"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      id="create-supplier-brand"
                      type="text"
                      placeholder="Can Brand (e.g. Bisleri 20L)"
                      value={canBrand}
                      onChange={(e) => setCanBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Room Invite Code
                </label>
                <input
                  id="join-invite-code-input"
                  type="text"
                  required
                  placeholder="e.g. WM-304"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 text-base font-mono font-bold tracking-widest text-center uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <p className="text-xs text-slate-500">
                Ask your roommate or admin for the invite code found in the header or Room Info tab.
              </p>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="room-modal-submit"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Please wait...' : mode === 'create' ? 'Create Room' : 'Join Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
