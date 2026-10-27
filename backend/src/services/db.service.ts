import { config } from '../config/index.js';

// In-memory data structures for high-performance demo/development store
export interface MemoryStore {
  users: Map<string, any>;
  profiles: Map<string, any>;
  wallets: Map<string, any>;
  transactions: any[];
  beneficiaries: any[];
  stocks: any[];
  indices: any[];
  orders: any[];
  supportCases: any[];
  notifications: any[];
  auditLogs: any[];
}

export const memoryStore: MemoryStore = {
  users: new Map(),
  profiles: new Map(),
  wallets: new Map(),
  transactions: [],
  beneficiaries: [],
  stocks: [],
  indices: [],
  orders: [],
  supportCases: [],
  notifications: [],
  auditLogs: [],
};

// Seed default demonstration records
export function seedMemoryStore() {
  const demoUserId = 'demo-user-001';
  
  // Default demo user
  memoryStore.users.set(demoUserId, {
    id: demoUserId,
    phone: '07030000000',
    email: 'amara.okonkwo@taviapp.ng',
    passwordHash: '$2a$10$wTqI3rC2tD5H2vYFv8k5nOUY8zY4W4m8m8m8m8m8m8m8m8m8m8m8m', // demo pass
    pinHash: '$2a$10$wTqI3rC2tD5H2vYFv8k5nOUY8zY4W4m8m8m8m8m8m8m8m8m8m8m8m', // 1234
    investPinHash: '$2a$10$wTqI3rC2tD5H2vYFv8k5nOUY8zY4W4m8m8m8m8m8m8m8m8m8m8m8m',
    role: 'USER',
    isPhoneVerified: true,
    isEmailVerified: true,
    kycTier: 'TIER_3_PRO',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.profiles.set(demoUserId, {
    id: 'profile-001',
    userId: demoUserId,
    firstName: 'Amara',
    lastName: 'Okonkwo',
    displayName: 'Amara Okonkwo',
    avatarUrl: null,
    address: 'Victoria Island, Lagos, Nigeria',
    countryCode: 'NG',
    currencyPreference: 'NGN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Wallets
  memoryStore.wallets.set(`${demoUserId}_NGN`, {
    id: 'wallet-ngn-001',
    userId: demoUserId,
    currency: 'NGN',
    balanceMinor: 48525000, // ₦485,250.00
    pendingMinor: 1500000, // ₦15,000.00
    isDefault: true,
    providerName: 'Providus Bank',
    providerAccountNumber: '9920394811',
    provisioningStatus: 'active',
  });

  memoryStore.wallets.set(`${demoUserId}_USD`, {
    id: 'wallet-usd-001',
    userId: demoUserId,
    currency: 'USD',
    balanceMinor: 142050, // $1,420.50
    pendingMinor: 0,
    isDefault: false,
    providerName: 'Lead Bank (USA)',
    providerAccountNumber: '1029384756',
    provisioningStatus: 'active',
  });

  memoryStore.wallets.set(`${demoUserId}_GBP`, {
    id: 'wallet-gbp-001',
    userId: demoUserId,
    currency: 'GBP',
    balanceMinor: 85000, // £850.00
    pendingMinor: 0,
    isDefault: false,
    providerName: 'ClearBank UK',
    providerAccountNumber: '04928172',
    provisioningStatus: 'active',
  });

  memoryStore.wallets.set(`${demoUserId}_EUR`, {
    id: 'wallet-eur-001',
    userId: demoUserId,
    currency: 'EUR',
    balanceMinor: 62000, // €620.00
    pendingMinor: 0,
    isDefault: false,
    providerName: 'Banking Circle S.A.',
    providerAccountNumber: 'DE89370400440532013000',
    provisioningStatus: 'active',
  });

  // Seed default transactions
  memoryStore.transactions.push(
    {
      id: 'txn-001',
      reference: 'TXN20261027001',
      userId: demoUserId,
      type: 'TRANSFER',
      direction: 'DEBIT',
      amountMinor: 2500000, // ₦25,000.00
      feeMinor: 1000, // ₦10.00
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Ada Chukwu',
      counterpartyAccount: '0123456789',
      counterpartyBank: 'GTBank',
      narration: 'Project milestone settlement',
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      id: 'txn-002',
      reference: 'TXN20261027002',
      userId: demoUserId,
      type: 'DEPOSIT',
      direction: 'CREDIT',
      amountMinor: 5000000, // ₦50,000.00
      feeMinor: 0,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Ada Chukwu',
      counterpartyAccount: '0123456789',
      counterpartyBank: 'GTBank',
      narration: 'Consulting fees reimbursement',
      createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
    },
    {
      id: 'txn-003',
      reference: 'TXN20261027003',
      userId: demoUserId,
      type: 'TRANSFER',
      direction: 'DEBIT',
      amountMinor: 1500000, // ₦15,000.00
      feeMinor: 1000,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Babajide Sanwo',
      counterpartyAccount: '2049182741',
      counterpartyBank: 'Zenith Bank',
      narration: 'Catering deposit',
      createdAt: new Date(Date.now() - 3600000 * 48), // 2 days ago
    }
  );

  // Seed default NGX stocks
  memoryStore.stocks.push(
    { symbol: 'DANGCEM', name: 'Dangote Cement Plc', sector: 'Industrial Goods', priceMinor: 65000, dayChangePercent: 2.36, volume: 1420500 },
    { symbol: 'GTCO', name: 'Guaranty Trust Holding Co.', sector: 'Banking & Financial', priceMinor: 5210, dayChangePercent: 1.15, volume: 18940000 },
    { symbol: 'AIRTELAFRI', name: 'Airtel Africa Plc', sector: 'Telecommunications', priceMinor: 220000, dayChangePercent: -0.45, volume: 854000 },
    { symbol: 'MTNN', name: 'MTN Nigeria Communications', sector: 'Telecommunications', priceMinor: 21500, dayChangePercent: 3.12, volume: 6410000 },
    { symbol: 'ZENITHBANK', name: 'Zenith Bank Plc', sector: 'Banking & Financial', priceMinor: 4120, dayChangePercent: -1.05, volume: 22100000 }
  );

  // Seed TAVI indices
  memoryStore.indices.push(
    { symbol: 'TAVI 15', name: 'TAVI Top 15 Index', level: 1245.8, dayChangePercent: 1.42, constituentsCount: 15, methodology: 'Free-float market capitalization weighted benchmark of the 15 most liquid NGX companies.' },
    { symbol: 'TAVI 30', name: 'TAVI Broad Market 30 Index', level: 2180.4, dayChangePercent: 0.88, constituentsCount: 30, methodology: 'Broad market equity benchmark covering top 30 liquid capitalization stocks.' },
    { symbol: 'TAVI DIV30', name: 'TAVI Dividend 30 Index', level: 980.2, dayChangePercent: 1.12, constituentsCount: 30, methodology: 'Tracks top 30 highest dividend-yielding equities on the Nigerian Exchange.' }
  );

  // Seed default notifications
  memoryStore.notifications.push(
    {
      id: 'notif-001',
      userId: demoUserId,
      category: 'TRANSACTIONS',
      title: 'Transfer Received',
      message: '₦50,000.00 received from Ada Chukwu',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'notif-002',
      userId: demoUserId,
      category: 'SECURITY',
      title: 'Successful Sign-in',
      message: 'New sign-in detected on Chrome on Windows (Lagos, NG)',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 5),
    }
  );
}

// Initialize seed on module load
seedMemoryStore();

export function isDatabaseConnected(): boolean {
  return config.databaseUrl.length > 0;
}
