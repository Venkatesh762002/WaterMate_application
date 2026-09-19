export interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  upiId?: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  currentRoom: RoomDetails | null;
  userRooms: RoomSummary[];
}

export interface SupplierInfo {
  name: string;
  phone: string;
  canBrand: string;
  upiId?: string;
  notes?: string;
}

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  defaultPricePerCan: number;
  currency: string;
  supplier: SupplierInfo;
  createdBy: string;
  createdAt: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  joinedAt: string;
  user: UserProfile;
}

export interface RoomSummary {
  id: string;
  name: string;
  inviteCode: string;
  role: 'admin' | 'member';
  membersCount: number;
}

export interface OrderCostSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface WaterOrder {
  id: string;
  roomId: string;
  orderNumber: number;
  cansCount: number;
  pricePerCan: number;
  totalCost: number;
  orderDate: string; // YYYY-MM-DD
  deliveryStatus: 'ordered' | 'delivered' | 'cancelled';
  orderedByUserId: string;
  splitType: 'equal' | 'custom';
  splits: OrderCostSplit[];
  notes?: string;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
  // Calculated fields:
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERPAID';
  payments: OrderPayment[];
  orderedByUser?: UserProfile;
}

export interface OrderPayment {
  id: string;
  roomId: string;
  orderId: string;
  paidByUserId: string;
  amount: number;
  paymentMethod: 'UPI' | 'Cash' | 'Card' | 'Net Banking' | 'Other';
  transactionRef?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  paidByUser?: UserProfile;
  orderNumber?: number;
}

export interface Settlement {
  id: string;
  roomId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  paymentMethod: 'UPI' | 'Cash' | 'Other';
  transactionRef?: string;
  settledDate: string;
  notes?: string;
  createdAt: string;
  fromUser?: UserProfile;
  toUser?: UserProfile;
}

export interface AuditLog {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface MemberBalanceReport {
  userId: string;
  user: UserProfile;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  cansOrdered: number;
  vendorPaymentsMade: number;
  costShareIncurred: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number; // Positive = gets back, Negative = owes
}

export interface DebtTransfer {
  fromUserId: string;
  fromUser: UserProfile;
  toUserId: string;
  toUser: UserProfile;
  amount: number;
}

export interface DashboardSummary {
  todayCans: number;
  todaySpend: number;
  weekCans: number;
  weekSpend: number;
  monthCans: number;
  monthSpend: number;
  totalOrdersCount: number;
  totalCansDelivered: number;
  totalOrderSpend: number;
  totalVendorPaid: number;
  totalVendorPending: number;
  userNetBalance: number;
  unpaidOrdersCount: number;
  roomCurrency: string;
  defaultPricePerCan: number;
  activeMembersCount: number;
  recentOrders: WaterOrder[];
  pendingVendorOrders: WaterOrder[];
  debts: DebtTransfer[];
  memberReports: MemberBalanceReport[];
  monthlyChart: {
    monthName: string;
    cans: number;
    spend: number;
  }[];
}

export interface RoomDetails {
  room: Room;
  members: RoomMember[];
  myRole: 'admin' | 'member';
}
