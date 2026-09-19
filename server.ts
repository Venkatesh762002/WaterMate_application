import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'watermate-db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// In-Memory Database Schema with persistence
interface DBData {
  users: Array<{
    id: string;
    username: string;
    email: string;
    name: string;
    phone?: string;
    upiId?: string;
    avatarColor: string;
    passwordHash: string;
    createdAt: string;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    inviteCode: string;
    defaultPricePerCan: number;
    currency: string;
    supplier: {
      name: string;
      phone: string;
      canBrand: string;
      upiId?: string;
      notes?: string;
    };
    createdBy: string;
    createdAt: string;
  }>;
  roomMembers: Array<{
    id: string;
    roomId: string;
    userId: string;
    role: 'admin' | 'member';
    status: 'active' | 'inactive';
    joinedAt: string;
  }>;
  orders: Array<{
    id: string;
    roomId: string;
    orderNumber: number;
    cansCount: number;
    pricePerCan: number;
    totalCost: number;
    orderDate: string;
    deliveryStatus: 'ordered' | 'delivered' | 'cancelled';
    orderedByUserId: string;
    splitType: 'equal' | 'custom';
    splits: Array<{ userId: string; amount: number; percentage?: number }>;
    notes?: string;
    supplierName?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  payments: Array<{
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
  }>;
  settlements: Array<{
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
  }>;
  auditLogs: Array<{
    id: string;
    roomId: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    createdAt: string;
  }>;
  tokens: Record<string, string>; // token -> userId
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'watermate_salt').digest('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'WM-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initial DB state with realistic bachelor room demo data
function getInitialData(): DBData {
  const user1Id = 'u_rahul';
  const user2Id = 'u_alex';
  const user3Id = 'u_sameer';

  const defaultPasswordHash = hashPassword('password123');

  const users = [
    {
      id: user1Id,
      username: 'rahul',
      email: 'rahul@watermate.internal',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      upiId: 'rahul.water@upi',
      avatarColor: '#0284c7', // Sky Blue
      passwordHash: defaultPasswordHash,
      createdAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: user2Id,
      username: 'alex',
      email: 'alex@watermate.internal',
      name: 'Alex D\'Souza',
      phone: '+91 98111 22334',
      upiId: 'alex.dsouza@okaxis',
      avatarColor: '#0d9488', // Teal
      passwordHash: defaultPasswordHash,
      createdAt: '2026-08-01T10:15:00.000Z',
    },
    {
      id: user3Id,
      username: 'sameer',
      email: 'sameer@watermate.internal',
      name: 'Sameer Khan',
      phone: '+91 97222 33445',
      upiId: 'sameer.k@paytm',
      avatarColor: '#6366f1', // Indigo
      passwordHash: defaultPasswordHash,
      createdAt: '2026-08-01T10:30:00.000Z',
    },
  ];

  const roomId = 'room_green_valley';
  const rooms = [
    {
      id: roomId,
      name: 'Green Valley 304 (Bachelor Flat)',
      inviteCode: 'WM-304',
      defaultPricePerCan: 35,
      currency: '₹',
      supplier: {
        name: 'Ganga RO Water Services',
        phone: '+91 99887 76655',
        canBrand: '20L Bisleri Sealed Jar',
        upiId: 'gangawater@icici',
        notes: 'Delivers between 8 AM - 11 AM. Ring bell twice.',
      },
      createdBy: user1Id,
      createdAt: '2026-08-01T11:00:00.000Z',
    },
  ];

  const roomMembers = [
    { id: generateId(), roomId, userId: user1Id, role: 'admin' as const, status: 'active' as const, joinedAt: '2026-08-01T11:00:00.000Z' },
    { id: generateId(), roomId, userId: user2Id, role: 'member' as const, status: 'active' as const, joinedAt: '2026-08-01T11:05:00.000Z' },
    { id: generateId(), roomId, userId: user3Id, role: 'member' as const, status: 'active' as const, joinedAt: '2026-08-01T11:10:00.000Z' },
  ];

  const order1Id = 'ord_1';
  const order2Id = 'ord_2';
  const order3Id = 'ord_3';

  const orders = [
    {
      id: order1Id,
      roomId,
      orderNumber: 101,
      cansCount: 2,
      pricePerCan: 35,
      totalCost: 70,
      orderDate: '2026-09-10',
      deliveryStatus: 'delivered' as const,
      orderedByUserId: user1Id,
      splitType: 'equal' as const,
      splits: [
        { userId: user1Id, amount: 23.33 },
        { userId: user2Id, amount: 23.33 },
        { userId: user3Id, amount: 23.34 },
      ],
      notes: 'Morning delivery before leaving for office',
      supplierName: 'Ganga RO Water Services',
      createdAt: '2026-09-10T08:30:00.000Z',
      updatedAt: '2026-09-10T08:30:00.000Z',
    },
    {
      id: order2Id,
      roomId,
      orderNumber: 102,
      cansCount: 3,
      pricePerCan: 35,
      totalCost: 105,
      orderDate: '2026-09-14',
      deliveryStatus: 'delivered' as const,
      orderedByUserId: user2Id,
      splitType: 'equal' as const,
      splits: [
        { userId: user1Id, amount: 35 },
        { userId: user2Id, amount: 35 },
        { userId: user3Id, amount: 35 },
      ],
      notes: 'Weekend refill',
      supplierName: 'Ganga RO Water Services',
      createdAt: '2026-09-14T10:15:00.000Z',
      updatedAt: '2026-09-14T10:15:00.000Z',
    },
    {
      id: order3Id,
      roomId,
      orderNumber: 103,
      cansCount: 2,
      pricePerCan: 35,
      totalCost: 70,
      orderDate: '2026-09-18',
      deliveryStatus: 'delivered' as const,
      orderedByUserId: user3Id,
      splitType: 'equal' as const,
      splits: [
        { userId: user1Id, amount: 23.33 },
        { userId: user2Id, amount: 23.33 },
        { userId: user3Id, amount: 23.34 },
      ],
      notes: 'Latest order',
      supplierName: 'Ganga RO Water Services',
      createdAt: '2026-09-18T09:00:00.000Z',
      updatedAt: '2026-09-18T09:00:00.000Z',
    },
  ];

  const payments = [
    {
      id: generateId(),
      roomId,
      orderId: order1Id,
      paidByUserId: user1Id,
      amount: 70,
      paymentMethod: 'UPI' as const,
      transactionRef: 'UPI/625341789/Ganga',
      paymentDate: '2026-09-10',
      notes: 'Paid via GPay to delivery boy',
      createdAt: '2026-09-10T08:35:00.000Z',
    },
    {
      id: generateId(),
      roomId,
      orderId: order2Id,
      paidByUserId: user2Id,
      amount: 105,
      paymentMethod: 'Cash' as const,
      transactionRef: 'Cash on Delivery',
      paymentDate: '2026-09-14',
      notes: 'Gave cash from room petty stash',
      createdAt: '2026-09-14T10:20:00.000Z',
    },
    {
      id: generateId(),
      roomId,
      orderId: order3Id,
      paidByUserId: user3Id,
      amount: 35,
      paymentMethod: 'UPI' as const,
      transactionRef: 'UPI/771829001/Ganga',
      paymentDate: '2026-09-18',
      notes: 'Partially paid ₹35, pending ₹35 to vendor',
      createdAt: '2026-09-18T09:10:00.000Z',
    },
  ];

  const settlements: DBData['settlements'] = [];

  const auditLogs = [
    {
      id: generateId(),
      roomId,
      userId: user1Id,
      userName: 'Rahul Sharma',
      action: 'ROOM_CREATED',
      details: 'Created room Green Valley 304 with default price ₹35/can',
      createdAt: '2026-08-01T11:00:00.000Z',
    },
    {
      id: generateId(),
      roomId,
      userId: user2Id,
      userName: 'Alex D\'Souza',
      action: 'MEMBER_JOINED',
      details: 'Joined room via invite code WM-304',
      createdAt: '2026-08-01T11:05:00.000Z',
    },
    {
      id: generateId(),
      roomId,
      userId: user3Id,
      userName: 'Sameer Khan',
      action: 'MEMBER_JOINED',
      details: 'Joined room via invite code WM-304',
      createdAt: '2026-08-01T11:10:00.000Z',
    },
    {
      id: generateId(),
      roomId,
      userId: user1Id,
      userName: 'Rahul Sharma',
      action: 'ORDER_CREATED',
      details: 'Ordered 2 cans (#101) for ₹70',
      createdAt: '2026-09-10T08:30:00.000Z',
    },
  ];

  return {
    users,
    rooms,
    roomMembers,
    orders,
    payments,
    settlements,
    auditLogs,
    tokens: {},
  };
}

let db: DBData;

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading DB file, reinitializing with defaults:', err);
  }
  const initial = getInitialData();
  saveDB(initial);
  return initial;
}

function saveDB(data: DBData) {
  try {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

db = loadDB();

// Helper functions
function getUserSafe(userId: string) {
  const u = db.users.find(x => x.id === userId);
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

function verifyToken(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const userId = db.tokens[token];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

function logAudit(roomId: string, userId: string, userName: string, action: string, details: string) {
  const log = {
    id: generateId(),
    roomId,
    userId,
    userName,
    action,
    details,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(log);
  // Keep last 500 logs per room
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
}

// Financial Math Engine
function computeOrderDetails(order: DBData['orders'][0], roomId: string) {
  const orderPayments = db.payments.filter(p => p.orderId === order.id);
  const paidAmount = orderPayments.reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = Math.max(0, order.totalCost - paidAmount);
  
  let paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERPAID' = 'UNPAID';
  if (paidAmount >= order.totalCost && order.totalCost > 0) {
    paymentStatus = paidAmount > order.totalCost ? 'OVERPAID' : 'PAID';
  } else if (paidAmount > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  const enrichedPayments = orderPayments.map(p => ({
    ...p,
    paidByUser: getUserSafe(p.paidByUserId),
    orderNumber: order.orderNumber,
  }));

  return {
    ...order,
    paidAmount,
    pendingAmount,
    paymentStatus,
    payments: enrichedPayments,
    orderedByUser: getUserSafe(order.orderedByUserId),
  };
}

function calculateBalancesAndDebts(roomId: string) {
  const members = db.roomMembers.filter(m => m.roomId === roomId);
  const roomOrders = db.orders.filter(o => o.roomId === roomId && o.deliveryStatus === 'delivered');
  const roomPayments = db.payments.filter(p => p.roomId === roomId);
  const roomSettlements = db.settlements.filter(s => s.roomId === roomId);

  // Initialize report map
  const reports: Record<string, {
    userId: string;
    user: any;
    role: 'admin' | 'member';
    status: 'active' | 'inactive';
    cansOrdered: number;
    vendorPaymentsMade: number;
    costShareIncurred: number;
    settlementsPaid: number;
    settlementsReceived: number;
    netBalance: number;
  }> = {};

  for (const m of members) {
    reports[m.userId] = {
      userId: m.userId,
      user: getUserSafe(m.userId),
      role: m.role,
      status: m.status,
      cansOrdered: 0,
      vendorPaymentsMade: 0,
      costShareIncurred: 0,
      settlementsPaid: 0,
      settlementsReceived: 0,
      netBalance: 0,
    };
  }

  // 1. Cans ordered & cost share
  for (const o of roomOrders) {
    if (reports[o.orderedByUserId]) {
      reports[o.orderedByUserId].cansOrdered += o.cansCount;
    }
    for (const split of o.splits) {
      if (reports[split.userId]) {
        reports[split.userId].costShareIncurred += split.amount;
      }
    }
  }

  // 2. Vendor payments made (who paid the water vendor)
  for (const p of roomPayments) {
    if (reports[p.paidByUserId]) {
      reports[p.paidByUserId].vendorPaymentsMade += p.amount;
    }
  }

  // 3. Peer-to-peer settlements
  for (const s of roomSettlements) {
    if (reports[s.fromUserId]) {
      reports[s.fromUserId].settlementsPaid += s.amount;
    }
    if (reports[s.toUserId]) {
      reports[s.toUserId].settlementsReceived += s.amount;
    }
  }

  // 4. Calculate Net Balance:
  // Net Balance = (vendorPaymentsMade - costShareIncurred) + (settlementsPaid - settlementsReceived)
  // Positive: user is owed money (creditor)
  // Negative: user owes money (debtor)
  for (const r of Object.values(reports)) {
    const rawNet = (r.vendorPaymentsMade - r.costShareIncurred) + (r.settlementsPaid - r.settlementsReceived);
    r.netBalance = Math.round(rawNet * 100) / 100;
  }

  // 5. Debt Simplification Algorithm (Minimizing transactions)
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  for (const r of Object.values(reports)) {
    if (r.netBalance < -0.01) {
      debtors.push({ userId: r.userId, amount: Math.abs(r.netBalance) });
    } else if (r.netBalance > 0.01) {
      creditors.push({ userId: r.userId, amount: r.netBalance });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts: Array<{
    fromUserId: string;
    fromUser: any;
    toUserId: string;
    toUser: any;
    amount: number;
  }> = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0.01) {
      debts.push({
        fromUserId: debtor.userId,
        fromUser: getUserSafe(debtor.userId),
        toUserId: creditor.userId,
        toUser: getUserSafe(creditor.userId),
        amount: Math.round(settlementAmount * 100) / 100,
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return {
    memberReports: Object.values(reports),
    debts,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Request logger in dev
  app.use((req, res, next) => {
    next();
  });

  // Authentication Middleware helper
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = verifyToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized. Please login again.' });
      return;
    }
    (req as any).user = user;
    next();
  };

  // Check Room Membership Middleware
  const requireRoomMember = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;
    const membership = db.roomMembers.find(m => m.roomId === roomId && m.userId === user.id);
    if (!membership) {
      res.status(403).json({ error: 'Access denied: You are not a member of this room.' });
      return;
    }
    (req as any).roomMembership = membership;
    next();
  };

  // Check Room Admin Middleware
  const requireRoomAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const membership = (req as any).roomMembership;
    if (membership.role !== 'admin') {
      res.status(403).json({ error: 'Admin permission required for this action.' });
      return;
    }
    next();
  };

  // ===================== AUTH ROUTES =====================
  app.post('/api/auth/signup', (req, res) => {
    const { username, email, name, password, phone, upiId } = req.body;
    if (!username || !email || !password || !name) {
      res.status(400).json({ error: 'Username, email, name, and password are required.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      res.status(400).json({ error: 'Username is already taken.' });
      return;
    }
    if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      res.status(400).json({ error: 'Email is already registered.' });
      return;
    }

    const colors = ['#0284c7', '#0d9488', '#6366f1', '#e11d48', '#d97706', '#8b5cf6', '#059669'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
      id: generateId(),
      username: cleanUsername,
      email: cleanEmail,
      name: name.trim(),
      phone: phone?.trim() || '',
      upiId: upiId?.trim() || '',
      avatarColor,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    const token = crypto.randomBytes(32).toString('hex');
    db.tokens[token] = newUser.id;
    saveDB(db);

    const { passwordHash, ...safeUser } = newUser;
    res.json({ user: safeUser, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Please provide email/username and password.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid username/email or password.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    db.tokens[token] = user.id;
    saveDB(db);

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { passwordHash, ...safeUser } = user;

    // Get rooms the user is part of
    const memberships = db.roomMembers.filter(m => m.userId === user.id);
    const userRooms = memberships.map(m => {
      const room = db.rooms.find(r => r.id === m.roomId);
      const membersCount = db.roomMembers.filter(rm => rm.roomId === m.roomId && rm.status === 'active').length;
      return {
        id: m.roomId,
        name: room?.name || 'Unknown Room',
        inviteCode: room?.inviteCode || '',
        role: m.role,
        membersCount,
      };
    });

    res.json({ user: safeUser, userRooms });
  });

  app.put('/api/auth/profile', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { name, phone, upiId, avatarColor } = req.body;

    const targetUser = db.users.find(u => u.id === user.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) targetUser.name = name.trim();
    if (phone !== undefined) targetUser.phone = phone.trim();
    if (upiId !== undefined) targetUser.upiId = upiId.trim();
    if (avatarColor) targetUser.avatarColor = avatarColor;

    saveDB(db);
    const { passwordHash, ...safeUser } = targetUser;
    res.json({ user: safeUser });
  });

  // ===================== ROOM ROUTES =====================
  app.get('/api/rooms', requireAuth, (req, res) => {
    const user = (req as any).user;
    const memberships = db.roomMembers.filter(m => m.userId === user.id);
    const rooms = memberships.map(m => {
      const room = db.rooms.find(r => r.id === m.roomId);
      const membersCount = db.roomMembers.filter(rm => rm.roomId === m.roomId && rm.status === 'active').length;
      return {
        id: m.roomId,
        name: room?.name || 'Room',
        inviteCode: room?.inviteCode || '',
        role: m.role,
        membersCount,
        defaultPricePerCan: room?.defaultPricePerCan || 35,
        currency: room?.currency || '₹',
      };
    });
    res.json({ rooms });
  });

  app.post('/api/rooms', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { name, defaultPricePerCan, currency, supplier } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }

    const newRoom = {
      id: generateId(),
      name: name.trim(),
      inviteCode: generateInviteCode(),
      defaultPricePerCan: Number(defaultPricePerCan) || 35,
      currency: currency || '₹',
      supplier: {
        name: supplier?.name?.trim() || '',
        phone: supplier?.phone?.trim() || '',
        canBrand: supplier?.canBrand?.trim() || '20L Jar',
        upiId: supplier?.upiId?.trim() || '',
        notes: supplier?.notes?.trim() || '',
      },
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    db.rooms.push(newRoom);

    // Add creator as Admin
    db.roomMembers.push({
      id: generateId(),
      roomId: newRoom.id,
      userId: user.id,
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString(),
    });

    logAudit(newRoom.id, user.id, user.name, 'ROOM_CREATED', `Created room "${newRoom.name}" with default price ${newRoom.currency}${newRoom.defaultPricePerCan}/can`);
    saveDB(db);

    res.json({ room: newRoom });
  });

  app.post('/api/rooms/join', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { inviteCode } = req.body;
    if (!inviteCode) {
      res.status(400).json({ error: 'Please provide an invite code.' });
      return;
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const room = db.rooms.find(r => r.inviteCode.toUpperCase() === cleanCode);
    if (!room) {
      res.status(404).json({ error: 'Invalid invite code. Room not found.' });
      return;
    }

    // Check if already a member
    const existing = db.roomMembers.find(m => m.roomId === room.id && m.userId === user.id);
    if (existing) {
      if (existing.status === 'inactive') {
        existing.status = 'active';
        logAudit(room.id, user.id, user.name, 'MEMBER_REJOINED', `${user.name} reactivated membership in the room`);
        saveDB(db);
        res.json({ room, message: 'Welcome back! Your membership is active.' });
        return;
      }
      res.status(400).json({ error: 'You are already a member of this room.' });
      return;
    }

    // Add new member
    db.roomMembers.push({
      id: generateId(),
      roomId: room.id,
      userId: user.id,
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString(),
    });

    logAudit(room.id, user.id, user.name, 'MEMBER_JOINED', `${user.name} joined the room via invite code ${cleanCode}`);
    saveDB(db);

    res.json({ room, message: `Successfully joined ${room.name}!` });
  });

  app.get('/api/rooms/:roomId', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const membership = (req as any).roomMembership;
    const roomId = req.params.roomId;

    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const members = db.roomMembers
      .filter(m => m.roomId === roomId)
      .map(m => ({
        ...m,
        user: getUserSafe(m.userId),
      }));

    res.json({
      room,
      members,
      myRole: membership.role,
    });
  });

  app.put('/api/rooms/:roomId', requireAuth, requireRoomMember, requireRoomAdmin, (req, res) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;
    const { name, defaultPricePerCan, currency, supplier } = req.body;

    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (name) room.name = name.trim();
    if (defaultPricePerCan !== undefined) room.defaultPricePerCan = Number(defaultPricePerCan) || 35;
    if (currency) room.currency = currency.trim();
    if (supplier) {
      room.supplier = {
        name: supplier.name?.trim() || '',
        phone: supplier.phone?.trim() || '',
        canBrand: supplier.canBrand?.trim() || '',
        upiId: supplier.upiId?.trim() || '',
        notes: supplier.notes?.trim() || '',
      };
    }

    logAudit(roomId, user.id, user.name, 'ROOM_UPDATED', `Updated room details / water supplier info`);
    saveDB(db);

    res.json({ room });
  });

  app.post('/api/rooms/:roomId/regenerate-invite', requireAuth, requireRoomMember, requireRoomAdmin, (req, res) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;

    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    room.inviteCode = generateInviteCode();
    logAudit(roomId, user.id, user.name, 'INVITE_CODE_RESET', `Regenerated invite code to ${room.inviteCode}`);
    saveDB(db);

    res.json({ inviteCode: room.inviteCode });
  });

  app.put('/api/rooms/:roomId/members/:userId', requireAuth, requireRoomMember, requireRoomAdmin, (req, res) => {
    const user = (req as any).user;
    const { roomId, userId } = req.params;
    const { role, status } = req.body;

    const member = db.roomMembers.find(m => m.roomId === roomId && m.userId === userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found in room' });
      return;
    }

    // Safety: don't demote the only admin
    if (role === 'member' && member.role === 'admin') {
      const adminCount = db.roomMembers.filter(m => m.roomId === roomId && m.role === 'admin').length;
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot demote the only room administrator. Promote someone else first.' });
        return;
      }
    }

    const targetUser = getUserSafe(userId);
    if (role && (role === 'admin' || role === 'member')) {
      member.role = role;
    }
    if (status && (status === 'active' || status === 'inactive')) {
      member.status = status;
    }

    logAudit(roomId, user.id, user.name, 'MEMBER_PERMISSIONS_UPDATED', `Updated ${targetUser?.name || 'user'}: Role=${member.role}, Status=${member.status}`);
    saveDB(db);

    res.json({ member });
  });

  app.delete('/api/rooms/:roomId/members/:userId', requireAuth, requireRoomMember, (req, res) => {
    const currentUser = (req as any).user;
    const membership = (req as any).roomMembership;
    const { roomId, userId } = req.params;

    // A user can leave, or an admin can remove another user
    const isSelf = currentUser.id === userId;
    if (!isSelf && membership.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can remove other members.' });
      return;
    }

    // Don't leave if only admin and other members exist
    if (isSelf && membership.role === 'admin') {
      const otherMembers = db.roomMembers.filter(m => m.roomId === roomId && m.userId !== userId);
      const otherAdmins = otherMembers.filter(m => m.role === 'admin');
      if (otherMembers.length > 0 && otherAdmins.length === 0) {
        res.status(400).json({ error: 'Please promote another member to admin before leaving the room.' });
        return;
      }
    }

    const memberIdx = db.roomMembers.findIndex(m => m.roomId === roomId && m.userId === userId);
    if (memberIdx === -1) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    const removedUser = getUserSafe(userId);
    db.roomMembers.splice(memberIdx, 1);

    logAudit(roomId, currentUser.id, currentUser.name, isSelf ? 'MEMBER_LEFT' : 'MEMBER_REMOVED', `${removedUser?.name || 'Member'} ${isSelf ? 'left the room' : 'was removed by ' + currentUser.name}`);
    saveDB(db);

    res.json({ message: 'Member successfully removed' });
  });

  // ===================== WATER ORDER ROUTES =====================
  app.get('/api/rooms/:roomId/orders', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const { search, status, paymentStatus, startDate, endDate, orderedBy } = req.query;

    let orders = db.orders.filter(o => o.roomId === roomId);

    // Calculate details for each order
    let enriched = orders.map(o => computeOrderDetails(o, roomId));

    // Filters
    if (status && status !== 'all') {
      enriched = enriched.filter(o => o.deliveryStatus === status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      enriched = enriched.filter(o => o.paymentStatus === paymentStatus);
    }
    if (orderedBy && orderedBy !== 'all') {
      enriched = enriched.filter(o => o.orderedByUserId === orderedBy);
    }
    if (startDate) {
      enriched = enriched.filter(o => o.orderDate >= (startDate as string));
    }
    if (endDate) {
      enriched = enriched.filter(o => o.orderDate <= (endDate as string));
    }
    if (search) {
      const q = (search as string).toLowerCase();
      enriched = enriched.filter(o => 
        o.orderNumber.toString().includes(q) ||
        (o.notes && o.notes.toLowerCase().includes(q)) ||
        (o.orderedByUser && o.orderedByUser.name.toLowerCase().includes(q)) ||
        (o.supplierName && o.supplierName.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    enriched.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime() || b.orderNumber - a.orderNumber);

    res.json({ orders: enriched });
  });

  app.post('/api/rooms/:roomId/orders', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;
    const { cansCount, pricePerCan, orderDate, deliveryStatus, orderedByUserId, splitType, splits, notes, supplierName, upfrontPayment } = req.body;

    const cans = Number(cansCount);
    if (!cans || cans <= 0) {
      res.status(400).json({ error: 'Cans count must be greater than 0.' });
      return;
    }

    const room = db.rooms.find(r => r.id === roomId);
    const price = Number(pricePerCan) || room?.defaultPricePerCan || 35;
    const totalCost = cans * price;
    const finalOrderedBy = orderedByUserId || user.id;

    // Get active room members for cost splitting
    const activeMembers = db.roomMembers.filter(m => m.roomId === roomId && m.status === 'active');
    if (activeMembers.length === 0) {
      res.status(400).json({ error: 'No active members in this room to split costs.' });
      return;
    }

    let calculatedSplits: Array<{ userId: string; amount: number; percentage?: number }> = [];

    if (splitType === 'custom' && Array.isArray(splits) && splits.length > 0) {
      // Validate custom splits
      const splitSum = splits.reduce((acc: number, s: any) => acc + (Number(s.amount) || 0), 0);
      if (Math.abs(splitSum - totalCost) > 0.05) {
        res.status(400).json({ error: `Custom split sum (${room?.currency}${splitSum.toFixed(2)}) must equal total order cost (${room?.currency}${totalCost.toFixed(2)}).` });
        return;
      }
      calculatedSplits = splits.map((s: any) => ({
        userId: s.userId,
        amount: Math.round((Number(s.amount) || 0) * 100) / 100,
        percentage: s.percentage,
      }));
    } else {
      // Equal split among active members
      const count = activeMembers.length;
      const baseShare = Math.floor((totalCost / count) * 100) / 100;
      let remainder = Math.round((totalCost - baseShare * count) * 100) / 100;

      calculatedSplits = activeMembers.map((m, idx) => {
        let share = baseShare;
        if (idx === 0 && remainder > 0) {
          share = Math.round((share + remainder) * 100) / 100;
        }
        return {
          userId: m.userId,
          amount: share,
        };
      });
    }

    // Auto-increment order number for the room
    const existingRoomOrders = db.orders.filter(o => o.roomId === roomId);
    const maxNumber = existingRoomOrders.reduce((max, o) => Math.max(max, o.orderNumber || 100), 100);
    const nextOrderNumber = maxNumber + 1;

    const newOrder = {
      id: generateId(),
      roomId,
      orderNumber: nextOrderNumber,
      cansCount: cans,
      pricePerCan: price,
      totalCost,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      deliveryStatus: (deliveryStatus || 'delivered') as 'ordered' | 'delivered' | 'cancelled',
      orderedByUserId: finalOrderedBy,
      splitType: (splitType || 'equal') as 'equal' | 'custom',
      splits: calculatedSplits,
      notes: notes?.trim() || '',
      supplierName: supplierName?.trim() || room?.supplier.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.push(newOrder);

    // If upfront payment was made during order entry (e.g. "I paid the vendor ₹70 via UPI right now")
    if (upfrontPayment && Number(upfrontPayment.amount) > 0) {
      const pAmount = Number(upfrontPayment.amount);
      const newPayment = {
        id: generateId(),
        roomId,
        orderId: newOrder.id,
        paidByUserId: upfrontPayment.paidByUserId || user.id,
        amount: pAmount,
        paymentMethod: upfrontPayment.paymentMethod || 'UPI',
        transactionRef: upfrontPayment.transactionRef?.trim() || '',
        paymentDate: upfrontPayment.paymentDate || newOrder.orderDate,
        notes: upfrontPayment.notes?.trim() || 'Paid upon delivery',
        createdAt: new Date().toISOString(),
      };
      db.payments.push(newPayment);
    }

    logAudit(roomId, user.id, user.name, 'ORDER_CREATED', `Added order #${newOrder.orderNumber}: ${cans} cans @ ${room?.currency}${price}/can (Total: ${room?.currency}${totalCost})`);
    saveDB(db);

    const fullOrder = computeOrderDetails(newOrder, roomId);
    res.json({ order: fullOrder });
  });

  app.put('/api/rooms/:roomId/orders/:orderId', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const { roomId, orderId } = req.params;
    const { cansCount, pricePerCan, orderDate, deliveryStatus, orderedByUserId, splitType, splits, notes, supplierName } = req.body;

    const order = db.orders.find(o => o.roomId === roomId && o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const room = db.rooms.find(r => r.id === roomId);

    if (cansCount !== undefined) order.cansCount = Number(cansCount);
    if (pricePerCan !== undefined) order.pricePerCan = Number(pricePerCan);
    order.totalCost = order.cansCount * order.pricePerCan;

    if (orderDate) order.orderDate = orderDate;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (orderedByUserId) order.orderedByUserId = orderedByUserId;
    if (notes !== undefined) order.notes = notes.trim();
    if (supplierName !== undefined) order.supplierName = supplierName.trim();
    order.updatedAt = new Date().toISOString();

    // Recalculate splits if specified or if price/cans changed
    if (splitType === 'custom' && Array.isArray(splits) && splits.length > 0) {
      order.splitType = 'custom';
      order.splits = splits.map((s: any) => ({
        userId: s.userId,
        amount: Math.round(Number(s.amount) * 100) / 100,
        percentage: s.percentage,
      }));
    } else {
      order.splitType = 'equal';
      const activeMembers = db.roomMembers.filter(m => m.roomId === roomId && m.status === 'active');
      const count = activeMembers.length || 1;
      const baseShare = Math.floor((order.totalCost / count) * 100) / 100;
      const remainder = Math.round((order.totalCost - baseShare * count) * 100) / 100;
      order.splits = activeMembers.map((m, idx) => ({
        userId: m.userId,
        amount: idx === 0 ? Math.round((baseShare + remainder) * 100) / 100 : baseShare,
      }));
    }

    logAudit(roomId, user.id, user.name, 'ORDER_UPDATED', `Updated order #${order.orderNumber} (${order.cansCount} cans, Total: ${room?.currency}${order.totalCost})`);
    saveDB(db);

    const fullOrder = computeOrderDetails(order, roomId);
    res.json({ order: fullOrder });
  });

  app.delete('/api/rooms/:roomId/orders/:orderId', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const { roomId, orderId } = req.params;

    const orderIdx = db.orders.findIndex(o => o.roomId === roomId && o.id === orderId);
    if (orderIdx === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = db.orders[orderIdx];
    // Remove linked payments
    db.payments = db.payments.filter(p => p.orderId !== orderId);
    db.orders.splice(orderIdx, 1);

    logAudit(roomId, user.id, user.name, 'ORDER_DELETED', `Deleted order #${order.orderNumber}`);
    saveDB(db);

    res.json({ message: 'Order and associated vendor payments deleted' });
  });

  // ===================== PAYMENT ROUTES (Vendor Payments for Orders) =====================
  app.get('/api/rooms/:roomId/payments', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const { method, paidBy, search } = req.query;

    let payments = db.payments.filter(p => p.roomId === roomId);

    if (method && method !== 'all') {
      payments = payments.filter(p => p.paymentMethod === method);
    }
    if (paidBy && paidBy !== 'all') {
      payments = payments.filter(p => p.paidByUserId === paidBy);
    }

    let enriched = payments.map(p => {
      const order = db.orders.find(o => o.id === p.orderId);
      return {
        ...p,
        paidByUser: getUserSafe(p.paidByUserId),
        orderNumber: order?.orderNumber || 0,
      };
    });

    if (search) {
      const q = (search as string).toLowerCase();
      enriched = enriched.filter(p => 
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.paidByUser && p.paidByUser.name.toLowerCase().includes(q)) ||
        p.orderNumber.toString().includes(q)
      );
    }

    enriched.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    res.json({ payments: enriched });
  });

  app.post('/api/rooms/:roomId/orders/:orderId/payments', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const { roomId, orderId } = req.params;
    const { amount, paidByUserId, paymentMethod, transactionRef, paymentDate, notes } = req.body;

    const order = db.orders.find(o => o.roomId === roomId && o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      res.status(400).json({ error: 'Payment amount must be greater than zero.' });
      return;
    }

    const room = db.rooms.find(r => r.id === roomId);
    const finalPaidBy = paidByUserId || user.id;

    const newPayment = {
      id: generateId(),
      roomId,
      orderId,
      paidByUserId: finalPaidBy,
      amount: Math.round(payAmount * 100) / 100,
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: transactionRef?.trim() || '',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      notes: notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    db.payments.push(newPayment);

    const paidUser = getUserSafe(finalPaidBy);
    logAudit(roomId, user.id, user.name, 'PAYMENT_RECORDED', `${paidUser?.name || 'User'} paid ${room?.currency}${newPayment.amount} for Order #${order.orderNumber} via ${newPayment.paymentMethod}`);
    saveDB(db);

    const updatedOrder = computeOrderDetails(order, roomId);
    res.json({ payment: newPayment, order: updatedOrder });
  });

  app.delete('/api/rooms/:roomId/payments/:paymentId', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const { roomId, paymentId } = req.params;

    const pIdx = db.payments.findIndex(p => p.roomId === roomId && p.id === paymentId);
    if (pIdx === -1) {
      res.status(404).json({ error: 'Payment record not found' });
      return;
    }

    const payment = db.payments[pIdx];
    const order = db.orders.find(o => o.id === payment.orderId);
    db.payments.splice(pIdx, 1);

    logAudit(roomId, user.id, user.name, 'PAYMENT_DELETED', `Deleted payment of ${payment.amount} for Order #${order?.orderNumber || '?'}`);
    saveDB(db);

    res.json({ message: 'Payment record deleted' });
  });

  // ===================== SETTLEMENT ROUTES (Roommate to Roommate) =====================
  app.get('/api/rooms/:roomId/settlements', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const settlements = db.settlements.filter(s => s.roomId === roomId);

    const enriched = settlements.map(s => ({
      ...s,
      fromUser: getUserSafe(s.fromUserId),
      toUser: getUserSafe(s.toUserId),
    }));

    enriched.sort((a, b) => new Date(b.settledDate).getTime() - new Date(a.settledDate).getTime());
    res.json({ settlements: enriched });
  });

  app.post('/api/rooms/:roomId/settlements', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;
    const { fromUserId, toUserId, amount, paymentMethod, transactionRef, settledDate, notes } = req.body;

    if (!fromUserId || !toUserId) {
      res.status(400).json({ error: 'From and To roommates are required for settlement.' });
      return;
    }
    if (fromUserId === toUserId) {
      res.status(400).json({ error: 'Cannot record settlement to oneself.' });
      return;
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      res.status(400).json({ error: 'Settlement amount must be greater than zero.' });
      return;
    }

    const room = db.rooms.find(r => r.id === roomId);
    const newSettlement = {
      id: generateId(),
      roomId,
      fromUserId,
      toUserId,
      amount: Math.round(payAmount * 100) / 100,
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: transactionRef?.trim() || '',
      settledDate: settledDate || new Date().toISOString().split('T')[0],
      notes: notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    db.settlements.push(newSettlement);

    const fromUser = getUserSafe(fromUserId);
    const toUser = getUserSafe(toUserId);
    logAudit(roomId, user.id, user.name, 'SETTLEMENT_RECORDED', `${fromUser?.name} paid ${room?.currency}${newSettlement.amount} to ${toUser?.name} via ${newSettlement.paymentMethod}`);
    saveDB(db);

    res.json({
      settlement: {
        ...newSettlement,
        fromUser,
        toUser,
      },
    });
  });

  app.delete('/api/rooms/:roomId/settlements/:settlementId', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const { roomId, settlementId } = req.params;

    const sIdx = db.settlements.findIndex(s => s.roomId === roomId && s.id === settlementId);
    if (sIdx === -1) {
      res.status(404).json({ error: 'Settlement record not found' });
      return;
    }

    const settlement = db.settlements[sIdx];
    db.settlements.splice(sIdx, 1);

    logAudit(roomId, user.id, user.name, 'SETTLEMENT_DELETED', `Deleted settlement of ${settlement.amount}`);
    saveDB(db);

    res.json({ message: 'Settlement record deleted' });
  });

  // ===================== DASHBOARD & REPORTS =====================
  app.get('/api/rooms/:roomId/dashboard', requireAuth, requireRoomMember, (req, res) => {
    const user = (req as any).user;
    const roomId = req.params.roomId;

    const room = db.rooms.find(r => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const roomOrders = db.orders.filter(o => o.roomId === roomId);
    const enrichedOrders = roomOrders.map(o => computeOrderDetails(o, roomId));

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    let todayCans = 0;
    let todaySpend = 0;
    let weekCans = 0;
    let weekSpend = 0;
    let monthCans = 0;
    let monthSpend = 0;
    let totalCansDelivered = 0;
    let totalOrderSpend = 0;
    let totalVendorPaid = 0;

    for (const o of enrichedOrders) {
      if (o.deliveryStatus === 'delivered') {
        totalCansDelivered += o.cansCount;
        totalOrderSpend += o.totalCost;
        totalVendorPaid += o.paidAmount;

        if (o.orderDate === todayStr) {
          todayCans += o.cansCount;
          todaySpend += o.totalCost;
        }
        if (o.orderDate >= startOfWeekStr) {
          weekCans += o.cansCount;
          weekSpend += o.totalCost;
        }
        if (o.orderDate >= startOfMonthStr) {
          monthCans += o.cansCount;
          monthSpend += o.totalCost;
        }
      }
    }

    const totalVendorPending = Math.max(0, totalOrderSpend - totalVendorPaid);
    const unpaidOrders = enrichedOrders.filter(o => o.deliveryStatus === 'delivered' && o.paymentStatus !== 'PAID');

    // Balances and debts
    const { memberReports, debts } = calculateBalancesAndDebts(roomId);
    const userReport = memberReports.find(m => m.userId === user.id);
    const userNetBalance = userReport ? userReport.netBalance : 0;

    // Monthly chart data (past 6 months)
    const monthlyMap: Record<string, { cans: number; spend: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { cans: 0, spend: 0 };
    }

    for (const o of enrichedOrders) {
      if (o.deliveryStatus === 'delivered') {
        const key = o.orderDate.substring(0, 7);
        if (monthlyMap[key]) {
          monthlyMap[key].cans += o.cansCount;
          monthlyMap[key].spend += o.totalCost;
        }
      }
    }

    const monthlyChart = Object.entries(monthlyMap).map(([key, val]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        monthName: `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`,
        cans: val.cans,
        spend: val.spend,
      };
    });

    const activeMembersCount = db.roomMembers.filter(m => m.roomId === roomId && m.status === 'active').length;

    // Recent orders sorted desc
    const sortedOrders = [...enrichedOrders].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime() || b.orderNumber - a.orderNumber
    );

    res.json({
      todayCans,
      todaySpend,
      weekCans,
      weekSpend,
      monthCans,
      monthSpend,
      totalOrdersCount: roomOrders.length,
      totalCansDelivered,
      totalOrderSpend,
      totalVendorPaid,
      totalVendorPending,
      userNetBalance,
      unpaidOrdersCount: unpaidOrders.length,
      roomCurrency: room.currency,
      defaultPricePerCan: room.defaultPricePerCan,
      activeMembersCount,
      recentOrders: sortedOrders.slice(0, 5),
      pendingVendorOrders: unpaidOrders.slice(0, 5),
      debts,
      memberReports,
      monthlyChart,
    });
  });

  app.get('/api/rooms/:roomId/reports/members', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const { memberReports, debts } = calculateBalancesAndDebts(roomId);
    res.json({ memberReports, debts });
  });

  app.get('/api/rooms/:roomId/audit-logs', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const logs = db.auditLogs.filter(l => l.roomId === roomId).slice(0, 100);
    res.json({ logs });
  });

  // ===================== CSV EXPORT =====================
  app.get('/api/rooms/:roomId/export/csv', requireAuth, requireRoomMember, (req, res) => {
    const roomId = req.params.roomId;
    const type = (req.query.type as string) || 'orders';
    const room = db.rooms.find(r => r.id === roomId);

    if (type === 'orders') {
      const orders = db.orders.filter(o => o.roomId === roomId).map(o => computeOrderDetails(o, roomId));
      const headers = ['Order Number', 'Date', 'Cans Count', 'Price Per Can', 'Total Cost', 'Delivery Status', 'Payment Status', 'Paid Amount', 'Pending Amount', 'Ordered By', 'Notes'];
      const rows = orders.map(o => [
        o.orderNumber,
        o.orderDate,
        o.cansCount,
        o.pricePerCan,
        o.totalCost,
        o.deliveryStatus,
        o.paymentStatus,
        o.paidAmount,
        o.pendingAmount,
        `"${(o.orderedByUser?.name || '').replace(/"/g, '""')}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="watermate_orders_${room?.name.replace(/[^a-z0-9]/gi, '_')}.csv"`);
      res.send(csvContent);
      return;
    }

    if (type === 'payments') {
      const payments = db.payments.filter(p => p.roomId === roomId).map(p => {
        const order = db.orders.find(o => o.id === p.orderId);
        return {
          ...p,
          orderNumber: order?.orderNumber || 0,
          paidByUser: getUserSafe(p.paidByUserId),
        };
      });

      const headers = ['Payment ID', 'Payment Date', 'Order Number', 'Amount', 'Payment Method', 'Paid By', 'Transaction Ref', 'Notes'];
      const rows = payments.map(p => [
        p.id,
        p.paymentDate,
        p.orderNumber,
        p.amount,
        p.paymentMethod,
        `"${(p.paidByUser?.name || '').replace(/"/g, '""')}"`,
        `"${(p.transactionRef || '').replace(/"/g, '""')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="watermate_payments_${room?.name.replace(/[^a-z0-9]/gi, '_')}.csv"`);
      res.send(csvContent);
      return;
    }

    if (type === 'settlements') {
      const settlements = db.settlements.filter(s => s.roomId === roomId).map(s => ({
        ...s,
        fromUser: getUserSafe(s.fromUserId),
        toUser: getUserSafe(s.toUserId),
      }));

      const headers = ['Settlement ID', 'Date', 'From Roommate', 'To Roommate', 'Amount', 'Payment Method', 'Ref', 'Notes'];
      const rows = settlements.map(s => [
        s.id,
        s.settledDate,
        `"${(s.fromUser?.name || '').replace(/"/g, '""')}"`,
        `"${(s.toUser?.name || '').replace(/"/g, '""')}"`,
        s.amount,
        s.paymentMethod,
        `"${(s.transactionRef || '').replace(/"/g, '""')}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="watermate_settlements_${room?.name.replace(/[^a-z0-9]/gi, '_')}.csv"`);
      res.send(csvContent);
      return;
    }

    res.status(400).json({ error: 'Invalid export type. Must be orders, payments, or settlements.' });
  });

  // ===================== VITE MIDDLEWARE / STATIC FILES =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WaterMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
