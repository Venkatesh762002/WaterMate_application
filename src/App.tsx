import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  UserProfile,
  Room,
  RoomSummary,
  RoomDetails,
  DashboardSummary,
  WaterOrder,
  OrderPayment,
  Settlement,
  MemberBalanceReport,
  DebtTransfer,
  AuditLog,
} from './types';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { PaymentsView } from './components/PaymentsView';
import { BalancesView } from './components/BalancesView';
import { RoomSettingsView } from './components/RoomSettingsView';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { SettleDebtModal } from './components/modals/SettleDebtModal';
import { RoomModal } from './components/modals/RoomModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { DoorOpen, Plus, Users, Droplet, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Room state
  const [userRooms, setUserRooms] = useState<RoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    return localStorage.getItem('watermate_active_room') || null;
  });
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'payments' | 'balances' | 'settings'
  >('dashboard');

  // Room Data
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<WaterOrder[]>([]);
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balanceReports, setBalanceReports] = useState<MemberBalanceReport[]>([]);
  const [debts, setDebts] = useState<DebtTransfer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Toast / notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal controls
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WaterOrder | null>(null);

  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentTargetOrderId, setPaymentTargetOrderId] = useState<string | undefined>(undefined);

  const [isSettleDebtModalOpen, setIsSettleDebtModalOpen] = useState(false);
  const [initialSettlementDebt, setInitialSettlementDebt] = useState<DebtTransfer | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalDefaultMode, setRoomModalDefaultMode] = useState<'create' | 'join'>('create');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('watermate_token');
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const { user } = await api.getMe();
        setCurrentUser(user);
        await loadUserRooms(user.id);
      } catch (err) {
        localStorage.removeItem('watermate_token');
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  // Fetch list of rooms the user belongs to
  const loadUserRooms = async (userId: string) => {
    try {
      const { rooms } = await api.getMyRooms();
      setUserRooms(rooms as any);
      if (rooms.length > 0) {
        // If current active room isn't in user's rooms, default to first room
        const savedRoomId = localStorage.getItem('watermate_active_room');
        const match = rooms.find((r: any) => r.id === savedRoomId);
        const selectedId = match ? match.id : rooms[0].id;
        setActiveRoomId(selectedId);
        localStorage.setItem('watermate_active_room', selectedId);
      } else {
        setActiveRoomId(null);
      }
    } catch (err) {
      console.error('Failed to load user rooms', err);
    }
  };

  // Load all active room data
  const fetchRoomData = useCallback(async () => {
    if (!activeRoomId) return;
    setDataLoading(true);
    try {
      const [
        detailsRes,
        dashboardRes,
        ordersRes,
        paymentsRes,
        settlementsRes,
        balancesRes,
        auditRes,
      ] = await Promise.all([
        api.getRoom(activeRoomId),
        api.getDashboard(activeRoomId),
        api.getOrders(activeRoomId),
        api.getPayments(activeRoomId),
        api.getSettlements(activeRoomId),
        api.getBalances(activeRoomId),
        api.getAuditLogs(activeRoomId),
      ]);

      setRoomDetails(detailsRes);
      setDashboardSummary(dashboardRes);
      setOrders(ordersRes.orders);
      setPayments(paymentsRes.payments);
      setSettlements(settlementsRes.settlements);
      setBalanceReports(balancesRes.reports);
      setDebts(balancesRes.debts);
      setAuditLogs(auditRes.logs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load room details', 'error');
    } finally {
      setDataLoading(false);
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (activeRoomId) {
      fetchRoomData();
    }
  }, [activeRoomId, fetchRoomData]);

  // Auth Handlers
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    await loadUserRooms(user.id);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setUserRooms([]);
    setActiveRoomId(null);
    setRoomDetails(null);
    showToast('Logged out successfully');
  };

  // Room Select Handler
  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('watermate_active_room', roomId);
  };

  // Quick Order 1, 2, or 3 cans
  const handleQuickOrder = async (cansCount: number) => {
    if (!activeRoomId || !roomDetails) return;
    try {
      await api.createOrder(activeRoomId, {
        cansCount,
        pricePerCan: roomDetails.room.defaultPricePerCan,
        orderDate: new Date().toISOString().split('T')[0],
        splitType: 'equal',
        deliveryStatus: 'delivered',
        notes: `Quick order of ${cansCount} ${cansCount === 1 ? 'can' : 'cans'}`,
      });
      showToast(`Quick order of ${cansCount} ${cansCount === 1 ? 'can' : 'cans'} added!`);
      await fetchRoomData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add quick order', 'error');
    }
  };

  // Create or Edit Order submit
  const handleSaveOrder = async (orderData: any) => {
    if (!activeRoomId) return;
    if (editingOrder) {
      await api.updateOrder(activeRoomId, editingOrder.id, orderData);
      showToast(`Order #${editingOrder.orderNumber} updated successfully!`);
    } else {
      await api.createOrder(activeRoomId, orderData);
      showToast('New water order created successfully!');
    }
    setEditingOrder(null);
    setIsNewOrderModalOpen(false);
    await fetchRoomData();
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!activeRoomId) return;
    try {
      await api.deleteOrder(activeRoomId, orderId);
      showToast('Order and related payment records deleted.');
      await fetchRoomData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete order', 'error');
    }
  };

  // Record Vendor Payment
  const handleRecordPayment = async (data: any) => {
    if (!activeRoomId) return;
    await api.recordPayment(activeRoomId, data);
    showToast('Vendor payment recorded successfully!');
    setIsRecordPaymentModalOpen(false);
    await fetchRoomData();
  };

  // Delete Payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!activeRoomId) return;
    try {
      await api.deletePayment(activeRoomId, paymentId);
      showToast('Payment record removed.');
      await fetchRoomData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete payment', 'error');
    }
  };

  // Record Settlement
  const handleRecordSettlement = async (data: any) => {
    if (!activeRoomId) return;
    await api.recordSettlement(activeRoomId, data);
    showToast('Roommate settlement recorded!');
    setIsSettleDebtModalOpen(false);
    await fetchRoomData();
  };

  // Delete Settlement
  const handleDeleteSettlement = async (settlementId: string) => {
    if (!activeRoomId) return;
    try {
      await api.deleteSettlement(activeRoomId, settlementId);
      showToast('Settlement record removed.');
      await fetchRoomData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete settlement', 'error');
    }
  };

  // Create Room
  const handleCreateRoom = async (data: any) => {
    const { room } = await api.createRoom(data);
    showToast(`Room "${room.name}" created!`);
    if (currentUser) {
      await loadUserRooms(currentUser.id);
    }
    setActiveRoomId(room.id);
    localStorage.setItem('watermate_active_room', room.id);
  };

  // Join Room
  const handleJoinRoom = async (inviteCode: string) => {
    const { room } = await api.joinRoom(inviteCode);
    showToast(`Joined room "${room.name}"!`);
    if (currentUser) {
      await loadUserRooms(currentUser.id);
    }
    setActiveRoomId(room.id);
    localStorage.setItem('watermate_active_room', room.id);
  };

  // Update Room Info
  const handleUpdateRoom = async (data: any) => {
    if (!activeRoomId) return;
    await api.updateRoom(activeRoomId, data);
    showToast('Room settings saved.');
    await fetchRoomData();
  };

  // Regenerate Invite Code
  const handleRegenerateInvite = async () => {
    if (!activeRoomId) return;
    const { inviteCode } = await api.regenerateInviteCode(activeRoomId);
    showToast(`New invite code generated: ${inviteCode}`);
    await fetchRoomData();
  };

  // Update Member Role or Status
  const handleUpdateMember = async (
    userId: string,
    data: { role?: 'admin' | 'member'; status?: 'active' | 'inactive' }
  ) => {
    if (!activeRoomId) return;
    await api.updateMember(activeRoomId, userId, data);
    showToast('Member permissions updated.');
    await fetchRoomData();
  };

  // Remove Member
  const handleRemoveMember = async (userId: string) => {
    if (!activeRoomId) return;
    await api.removeMember(activeRoomId, userId);
    showToast('Member removed from room.');
    if (userId === currentUser?.id) {
      if (currentUser) await loadUserRooms(currentUser.id);
    } else {
      await fetchRoomData();
    }
  };

  // Update User Profile
  const handleUpdateProfile = async (data: any) => {
    const { user } = await api.updateProfile(data);
    setCurrentUser(user);
    showToast('Profile updated successfully!');
    if (activeRoomId) await fetchRoomData();
  };

  // Download CSV
  const handleExportCsv = (type: 'orders' | 'payments' | 'settlements') => {
    if (!activeRoomId) return;
    const url = api.getCsvDownloadUrl(activeRoomId, type);
    window.location.href = url;
  };

  // Show Loading Spinner while initial auth check is ongoing
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading WaterMate...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Auth View
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleLoginSuccess} />;
  }

  const currentCurrency = roomDetails?.room.currency || '₹';

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-50 border-emerald-800'
              : 'bg-rose-900 text-rose-50 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        currentRoom={roomDetails}
        userRooms={userRooms}
        activeTab={activeTab}
        onSelectRoom={handleSelectRoom}
        onTabChange={setActiveTab}
        onOpenCreateRoom={() => {
          setRoomModalDefaultMode('create');
          setIsRoomModalOpen(true);
        }}
        onOpenJoinRoom={() => {
          setRoomModalDefaultMode('join');
          setIsRoomModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {userRooms.length === 0 ? (
          /* Empty State: No Rooms */
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center">
              <Droplet className="w-8 h-8 fill-sky-600 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Welcome to WaterMate, {currentUser.name}!</h2>
              <p className="text-xs text-slate-500 mt-1">
                You're not currently part of any bachelor room. Create a new room for your flat or join your roommates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="empty-state-create-room-btn"
                onClick={() => {
                  setRoomModalDefaultMode('create');
                  setIsRoomModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex flex-col items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>

              <button
                type="button"
                id="empty-state-join-room-btn"
                onClick={() => {
                  setRoomModalDefaultMode('join');
                  setIsRoomModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <Users className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>
          </div>
        ) : !roomDetails ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Connecting to your room...</p>
          </div>
        ) : (
          <>
            {/* View Tab Routing */}
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={dashboardSummary}
                loading={dataLoading}
                currency={currentCurrency}
                currentUserId={currentUser.id}
                onOpenNewOrder={() => {
                  setEditingOrder(null);
                  setIsNewOrderModalOpen(true);
                }}
                onQuickOrder={handleQuickOrder}
                onOpenRecordPayment={(orderId) => {
                  setPaymentTargetOrderId(orderId);
                  setIsRecordPaymentModalOpen(true);
                }}
                onOpenSettleDebt={(debt) => {
                  setInitialSettlementDebt(debt || null);
                  setIsSettleDebtModalOpen(true);
                }}
                onViewAllOrders={() => setActiveTab('orders')}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersView
                orders={orders}
                members={roomDetails.members}
                currency={currentCurrency}
                currentUserId={currentUser.id}
                loading={dataLoading}
                onOpenNewOrder={() => {
                  setEditingOrder(null);
                  setIsNewOrderModalOpen(true);
                }}
                onEditOrder={(order) => {
                  setEditingOrder(order);
                  setIsNewOrderModalOpen(true);
                }}
                onDeleteOrder={handleDeleteOrder}
                onRecordPayment={(orderId) => {
                  setPaymentTargetOrderId(orderId);
                  setIsRecordPaymentModalOpen(true);
                }}
                onExportCsv={() => handleExportCsv('orders')}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsView
                payments={payments}
                settlements={settlements}
                members={roomDetails.members}
                currency={currentCurrency}
                loading={dataLoading}
                onOpenRecordPayment={() => {
                  setPaymentTargetOrderId(undefined);
                  setIsRecordPaymentModalOpen(true);
                }}
                onOpenSettleDebt={() => {
                  setInitialSettlementDebt(null);
                  setIsSettleDebtModalOpen(true);
                }}
                onDeletePayment={handleDeletePayment}
                onDeleteSettlement={handleDeleteSettlement}
                onExportPaymentsCsv={() => handleExportCsv('payments')}
                onExportSettlementsCsv={() => handleExportCsv('settlements')}
              />
            )}

            {activeTab === 'balances' && (
              <BalancesView
                reports={balanceReports}
                debts={debts}
                currency={currentCurrency}
                currentUserId={currentUser.id}
                loading={dataLoading}
                onOpenSettleDebt={(debt) => {
                  setInitialSettlementDebt(debt || null);
                  setIsSettleDebtModalOpen(true);
                }}
              />
            )}

            {activeTab === 'settings' && (
              <RoomSettingsView
                roomDetails={roomDetails}
                auditLogs={auditLogs}
                currentUserId={currentUser.id}
                currency={currentCurrency}
                loading={dataLoading}
                onUpdateRoom={handleUpdateRoom}
                onRegenerateInvite={handleRegenerateInvite}
                onUpdateMember={handleUpdateMember}
                onRemoveMember={handleRemoveMember}
                onExportCsv={handleExportCsv}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {isNewOrderModalOpen && roomDetails && (
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={() => {
            setIsNewOrderModalOpen(false);
            setEditingOrder(null);
          }}
          onSubmit={handleSaveOrder}
          members={roomDetails.members}
          currentUserId={currentUser.id}
          defaultPrice={roomDetails.room.defaultPricePerCan}
          currency={currentCurrency}
          initialOrder={editingOrder}
        />
      )}

      {isRecordPaymentModalOpen && roomDetails && (
        <RecordPaymentModal
          isOpen={isRecordPaymentModalOpen}
          onClose={() => {
            setIsRecordPaymentModalOpen(false);
            setPaymentTargetOrderId(undefined);
          }}
          onSubmit={async (orderId, paymentData) => {
            await handleRecordPayment({ ...paymentData, orderId });
          }}
          orders={orders}
          members={roomDetails.members}
          currentUserId={currentUser.id}
          currency={currentCurrency}
          preselectedOrderId={paymentTargetOrderId}
        />
      )}

      {isSettleDebtModalOpen && roomDetails && (
        <SettleDebtModal
          isOpen={isSettleDebtModalOpen}
          onClose={() => {
            setIsSettleDebtModalOpen(false);
            setInitialSettlementDebt(null);
          }}
          onSubmit={handleRecordSettlement}
          members={roomDetails.members}
          currentUserId={currentUser.id}
          currency={currentCurrency}
          initialDebt={initialSettlementDebt}
        />
      )}

      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          defaultMode={roomModalDefaultMode}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}

export default App;
