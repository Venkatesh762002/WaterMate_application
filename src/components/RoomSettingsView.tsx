import React, { useState } from 'react';
import {
  Settings,
  DoorOpen,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Truck,
  Users,
  Shield,
  Download,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Save,
  UserX,
} from 'lucide-react';
import { RoomDetails, AuditLog } from '../types';

interface RoomSettingsViewProps {
  roomDetails: RoomDetails;
  auditLogs: AuditLog[];
  currentUserId: string;
  currency: string;
  loading: boolean;
  onUpdateRoom: (data: any) => Promise<void>;
  onRegenerateInvite: () => Promise<void>;
  onUpdateMember: (userId: string, data: { role?: 'admin' | 'member'; status?: 'active' | 'inactive' }) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onExportCsv: (type: 'orders' | 'payments' | 'settlements') => void;
}

export const RoomSettingsView: React.FC<RoomSettingsViewProps> = ({
  roomDetails,
  auditLogs,
  currentUserId,
  currency,
  loading,
  onUpdateRoom,
  onRegenerateInvite,
  onUpdateMember,
  onRemoveMember,
  onExportCsv,
}) => {
  const { room, members, myRole } = roomDetails;
  const isAdmin = myRole === 'admin';

  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomName, setRoomName] = useState(room.name);
  const [defaultPrice, setDefaultPrice] = useState(room.defaultPricePerCan);
  const [currencyVal, setCurrencyVal] = useState(room.currency);

  // Supplier state
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierName, setSupplierName] = useState(room.supplier?.name || '');
  const [supplierPhone, setSupplierPhone] = useState(room.supplier?.phone || '');
  const [canBrand, setCanBrand] = useState(room.supplier?.canBrand || '');
  const [supplierNotes, setSupplierNotes] = useState(room.supplier?.notes || '');

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading(true);
    try {
      await onUpdateRoom({
        name: roomName,
        defaultPricePerCan: defaultPrice,
        currency: currencyVal,
      });
      setIsEditingRoom(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update room');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading(true);
    try {
      await onUpdateRoom({
        supplier: {
          name: supplierName,
          phone: supplierPhone,
          canBrand,
          notes: supplierNotes,
        },
      });
      setIsEditingSupplier(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update supplier');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>Room Settings & Supplier Info</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage invite codes, water supplier contact, roommate roles, and audit trail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Your Role: {myRole === 'admin' ? 'Administrator' : 'Roommate'}</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Room Details & Invite Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room Info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-sky-600" />
              <span>Room Information</span>
            </h3>
            {isAdmin && !isEditingRoom && (
              <button
                type="button"
                id="edit-room-info-btn"
                onClick={() => setIsEditingRoom(true)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingRoom ? (
            <form onSubmit={handleSaveRoom} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Default Rate / Can
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <select
                    value={currencyVal}
                    onChange={(e) => setCurrencyVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingRoom(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs text-white bg-sky-600 rounded-lg hover:bg-sky-700 font-semibold shadow-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Room Name:</span>
                <span className="font-bold text-slate-900">{room.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Default Water Can Rate:</span>
                <span className="font-bold text-slate-900">
                  {currency}
                  {room.defaultPricePerCan} / can
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Roommates:</span>
                <span className="font-bold text-slate-900">
                  {members.filter((m) => m.status === 'active').length} members
                </span>
              </div>
            </div>
          )}

          {/* Invite Code Box */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                Roommate Invite Code
              </span>
              {isAdmin && (
                <button
                  type="button"
                  id="regen-invite-btn"
                  onClick={() => {
                    if (confirm('Regenerate invite code? The previous code will become invalid.')) {
                      onRegenerateInvite();
                    }
                  }}
                  className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xl font-black text-sky-900 tracking-wider">
                {room.inviteCode}
              </span>
              <button
                type="button"
                id="copy-invite-code-btn"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-white border border-sky-300 hover:bg-sky-100 text-sky-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <p className="text-[11px] text-sky-700 mt-2">
              Share this code with your roommates so they can join and split water costs.
            </p>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Water Supplier Information</span>
            </h3>
            {isAdmin && !isEditingSupplier && (
              <button
                type="button"
                id="edit-supplier-btn"
                onClick={() => setIsEditingSupplier(true)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingSupplier ? (
            <form onSubmit={handleSaveSupplier} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Ganga Water Services"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="+91 99887 76655"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Can Brand
                  </label>
                  <input
                    type="text"
                    value={canBrand}
                    onChange={(e) => setCanBrand(e.target.value)}
                    placeholder="e.g. 20L Bisleri Sealed Jar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Delivery Notes / Timings
                </label>
                <input
                  type="text"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  placeholder="e.g. Delivers mornings 8 AM - 11 AM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSupplier(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs text-white bg-sky-600 rounded-lg hover:bg-sky-700 font-semibold shadow-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900">
                    {room.supplier?.name || 'No Supplier Name Added'}
                  </span>
                  {room.supplier?.phone && (
                    <a
                      href={`tel:${room.supplier.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1 border border-emerald-200 hover:bg-emerald-100"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Supplier</span>
                    </a>
                  )}
                </div>

                {room.supplier?.phone && (
                  <p className="text-slate-600 font-mono text-[11px]">
                    Phone: {room.supplier.phone}
                  </p>
                )}
                {room.supplier?.canBrand && (
                  <p className="text-slate-600 text-[11px]">
                    Brand / Type: <strong>{room.supplier.canBrand}</strong>
                  </p>
                )}
                {room.supplier?.notes && (
                  <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-200">
                    "{room.supplier.notes}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CSV Downloads */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              Export Financial Records (CSV)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="export-csv-orders"
                onClick={() => onExportCsv('orders')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 text-center"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Orders CSV</span>
              </button>
              <button
                type="button"
                id="export-csv-payments"
                onClick={() => onExportCsv('payments')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 text-center"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Payments CSV</span>
              </button>
              <button
                type="button"
                id="export-csv-settlements"
                onClick={() => onExportCsv('settlements')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 text-center"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Settlements CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Member Management */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Roommate Permissions & Roster</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Control admin access, active cost sharing status, or remove members
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            return (
              <div
                key={m.userId}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: m.user?.avatarColor || '#0284c7' }}
                  >
                    {m.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{m.user?.name}</span>
                      {isSelf && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>@{m.user?.username}</span>
                      {m.user?.upiId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-sky-600">{m.user.upiId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role Selector (Admin only or display) */}
                  {isAdmin && !isSelf ? (
                    <select
                      value={m.role}
                      onChange={(e) => onUpdateMember(m.userId, { role: e.target.value as any })}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                    >
                      <option value="member">Roommate</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 capitalize">
                      {m.role}
                    </span>
                  )}

                  {/* Active status toggle (Admin only or display) */}
                  {isAdmin && !isSelf ? (
                    <select
                      value={m.status}
                      onChange={(e) => onUpdateMember(m.userId, { status: e.target.value as any })}
                      className={`px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold ${
                        m.status === 'active' ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      <option value="active">Active Splitter</option>
                      <option value="inactive">Inactive / Away</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-lg font-semibold ${
                        m.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.status === 'active' ? 'Active' : 'Away'}
                    </span>
                  )}

                  {/* Leave or Remove Button */}
                  {(isAdmin || isSelf) && (
                    <button
                      type="button"
                      onClick={() => {
                        const msg = isSelf
                          ? 'Leave this room? You will lose access to its orders.'
                          : `Remove ${m.user?.name} from this room?`;
                        if (confirm(msg)) {
                          onRemoveMember(m.userId);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={isSelf ? 'Leave Room' : 'Remove Member'}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Audit Trail & Activity History</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          Complete transparent record of order placements, vendor payments, settlements, and permission changes
        </p>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No activity logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {auditLogs.map((l) => (
              <div key={l.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{l.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    By <strong className="text-slate-600">{l.userName}</strong> • Action:{' '}
                    <span className="font-mono">{l.action}</span>
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
