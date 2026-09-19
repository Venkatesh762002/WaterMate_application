import {
  UserProfile,
  Room,
  RoomMember,
  RoomSummary,
  WaterOrder,
  OrderPayment,
  Settlement,
  AuditLog,
  DashboardSummary,
  RoomDetails,
} from '../types';

const TOKEN_KEY = 'watermate_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async signup(data: { username: string; email: string; name: string; password: string; phone?: string; upiId?: string }) {
    const res = await request<{ user: UserProfile; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: { identifier: string; password: string }) {
    const res = await request<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ user: UserProfile; userRooms: RoomSummary[] }>('/api/auth/me');
  },

  async updateProfile(data: { name?: string; phone?: string; upiId?: string; avatarColor?: string }) {
    return request<{ user: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Rooms
  async getRooms() {
    return request<{ rooms: Array<RoomSummary & { defaultPricePerCan: number; currency: string }> }>('/api/rooms');
  },

  async getMyRooms() {
    return this.getRooms();
  },

  async getRoomDetails(roomId: string) {
    return request<RoomDetails>(`/api/rooms/${roomId}`);
  },

  async getRoom(roomId: string) {
    return this.getRoomDetails(roomId);
  },

  async createRoom(data: { name: string; defaultPricePerCan: number; currency: string; supplier?: any }) {
    return request<{ room: Room }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinRoom(inviteCode: string) {
    return request<{ room: Room; message: string }>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },

  async updateRoom(roomId: string, data: Partial<Room>) {
    return request<{ room: Room }>(`/api/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async regenerateInviteCode(roomId: string) {
    return request<{ inviteCode: string }>(`/api/rooms/${roomId}/regenerate-invite`, {
      method: 'POST',
    });
  },

  async updateMember(roomId: string, userId: string, data: { role?: 'admin' | 'member'; status?: 'active' | 'inactive' }) {
    return request<{ member: RoomMember }>(`/api/rooms/${roomId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async removeMember(roomId: string, userId: string) {
    return request<{ message: string }>(`/api/rooms/${roomId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(roomId: string, params?: { search?: string; status?: string; paymentStatus?: string; startDate?: string; endDate?: string; orderedBy?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) searchParams.append(k, v);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ orders: WaterOrder[] }>(`/api/rooms/${roomId}/orders${query}`);
  },

  async createOrder(roomId: string, data: any) {
    return request<{ order: WaterOrder }>(`/api/rooms/${roomId}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrder(roomId: string, orderId: string, data: any) {
    return request<{ order: WaterOrder }>(`/api/rooms/${roomId}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteOrder(roomId: string, orderId: string) {
    return request<{ message: string }>(`/api/rooms/${roomId}/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Payments
  async getPayments(roomId: string, params?: { method?: string; paidBy?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) searchParams.append(k, v);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ payments: OrderPayment[] }>(`/api/rooms/${roomId}/payments${query}`);
  },

  async recordOrderPayment(roomId: string, orderId: string, data: { amount: number; paidByUserId?: string; paymentMethod: string; transactionRef?: string; paymentDate?: string; notes?: string }) {
    return request<{ payment: OrderPayment; order: WaterOrder }>(`/api/rooms/${roomId}/orders/${orderId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async recordPayment(roomId: string, data: { orderId: string; amount: number; paidByUserId?: string; paymentMethod: string; transactionRef?: string; paymentDate?: string; notes?: string }) {
    return this.recordOrderPayment(roomId, data.orderId, data);
  },

  async deletePayment(roomId: string, paymentId: string) {
    return request<{ message: string }>(`/api/rooms/${roomId}/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },

  // Settlements
  async getSettlements(roomId: string) {
    return request<{ settlements: Settlement[] }>(`/api/rooms/${roomId}/settlements`);
  },

  async recordSettlement(roomId: string, data: { fromUserId: string; toUserId: string; amount: number; paymentMethod: string; transactionRef?: string; settledDate?: string; notes?: string }) {
    return request<{ settlement: Settlement }>(`/api/rooms/${roomId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteSettlement(roomId: string, settlementId: string) {
    return request<{ message: string }>(`/api/rooms/${roomId}/settlements/${settlementId}`, {
      method: 'DELETE',
    });
  },

  // Dashboard & Reports
  async getDashboard(roomId: string) {
    return request<DashboardSummary>(`/api/rooms/${roomId}/dashboard`);
  },

  async getBalances(roomId: string) {
    const res = await request<{ memberReports: any[]; debts: any[] }>(`/api/rooms/${roomId}/reports/members`);
    return { reports: res.memberReports, debts: res.debts };
  },

  async getAuditLogs(roomId: string) {
    return request<{ logs: AuditLog[] }>(`/api/rooms/${roomId}/audit-logs`);
  },

  // CSV Export URL helper
  getExportUrl(roomId: string, type: 'orders' | 'payments' | 'settlements') {
    const token = getStoredToken();
    return `/api/rooms/${roomId}/export/csv?type=${type}&token=${token || ''}`;
  },

  getCsvDownloadUrl(roomId: string, type: 'orders' | 'payments' | 'settlements') {
    return this.getExportUrl(roomId, type);
  },
};
