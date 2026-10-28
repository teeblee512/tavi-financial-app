import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

// In-memory data structures for high-performance demo/sandbox store
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
  idempotencyKeys: Map<string, any>;
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
  idempotencyKeys: new Map(),
};

function getStorageFilePath(): string {
  const filePath = config.sandbox?.storageFile || './data/sandbox_store.json';
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

/**
 * Persists in-memory sandbox state to JSON disk store for restart/reload survival
 */
export function saveStoreToDisk(): void {
  try {
    const storagePath = getStorageFilePath();
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const serializable = {
      users: Array.from(memoryStore.users.entries()),
      profiles: Array.from(memoryStore.profiles.entries()),
      wallets: Array.from(memoryStore.wallets.entries()),
      transactions: memoryStore.transactions,
      beneficiaries: memoryStore.beneficiaries,
      stocks: memoryStore.stocks,
      indices: memoryStore.indices,
      orders: memoryStore.orders,
      supportCases: memoryStore.supportCases,
      notifications: memoryStore.notifications,
      auditLogs: memoryStore.auditLogs,
      idempotencyKeys: Array.from(memoryStore.idempotencyKeys.entries()),
      savedAt: new Date().toISOString(),
    };

    fs.writeFileSync(storagePath, JSON.stringify(serializable, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[Sandbox Store] Failed to persist data to disk:', err.message);
  }
}

/**
 * Hydrates sandbox state from JSON disk store if available
 */
export function loadStoreFromDisk(): boolean {
  try {
    const storagePath = getStorageFilePath();
    if (!fs.existsSync(storagePath)) {
      return false;
    }

    const raw = fs.readFileSync(storagePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.users)) {
      return false;
    }

    memoryStore.users = new Map(parsed.users);
    memoryStore.profiles = new Map(parsed.profiles);
    memoryStore.wallets = new Map(parsed.wallets);
    memoryStore.transactions = parsed.transactions || [];
    memoryStore.beneficiaries = parsed.beneficiaries || [];
    memoryStore.stocks = parsed.stocks || [];
    memoryStore.indices = parsed.indices || [];
    memoryStore.orders = parsed.orders || [];
    memoryStore.supportCases = parsed.supportCases || [];
    memoryStore.notifications = parsed.notifications || [];
    memoryStore.auditLogs = parsed.auditLogs || [];
    memoryStore.idempotencyKeys = new Map(parsed.idempotencyKeys || []);

    console.log(`[Sandbox Store] Successfully hydrated ${memoryStore.users.size} users, ${memoryStore.wallets.size} wallets, and ${memoryStore.transactions.length} transactions from disk.`);
    return true;
  } catch (err: any) {
    console.warn('[Sandbox Store] Could not load persisted data from disk, re-seeding:', err.message);
    return false;
  }
}

/**
 * Seed default demonstration records with at least 3 independent accounts
 */
export function seedMemoryStore(): void {
  memoryStore.users.clear();
  memoryStore.profiles.clear();
  memoryStore.wallets.clear();
  memoryStore.transactions = [];
  memoryStore.beneficiaries = [];
  memoryStore.stocks = [];
  memoryStore.indices = [];
  memoryStore.orders = [];
  memoryStore.supportCases = [];
  memoryStore.notifications = [];
  memoryStore.auditLogs = [];
  memoryStore.idempotencyKeys.clear();

  const demoPasswordHash = '$2a$10$wTqI3rC2tD5H2vYFv8k5nOUY8zY4W4m8m8m8m8m8m8m8m8m8m8m8m'; // "demo123" / "1234"

  // 1. Primary Demo User: Amara Okonkwo (Tester 1)
  const u1Id = 'demo-user-001';
  memoryStore.users.set(u1Id, {
    id: u1Id,
    phone: '07030000000',
    email: 'amara.okonkwo@taviapp.ng',
    demoTag: '@amara',
    passwordHash: demoPasswordHash,
    pinHash: demoPasswordHash,
    investPinHash: demoPasswordHash,
    role: 'USER',
    isPhoneVerified: true,
    isEmailVerified: true,
    kycTier: 'TIER_3_PRO',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.profiles.set(u1Id, {
    id: 'profile-001',
    userId: u1Id,
    firstName: 'Amara',
    lastName: 'Okonkwo',
    displayName: 'Amara Okonkwo',
    demoTag: '@amara',
    avatarUrl: null,
    address: 'Victoria Island, Lagos, Nigeria',
    countryCode: 'NG',
    currencyPreference: 'NGN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.wallets.set(`${u1Id}_NGN`, {
    id: 'wallet-ngn-001',
    userId: u1Id,
    currency: 'NGN',
    balanceMinor: 48525000, // ₦485,250.00
    pendingMinor: 0,
    isDefault: true,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'Providus Bank',
    providerAccountNumber: '9920394811',
    provisioningStatus: 'active',
  });

  // Multi-currency demo wallets for Amara
  memoryStore.wallets.set(`${u1Id}_USD`, {
    id: 'wallet-usd-001',
    userId: u1Id,
    currency: 'USD',
    balanceMinor: 142050, // $1,420.50
    pendingMinor: 0,
    isDefault: false,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'Lead Bank (USA)',
    providerAccountNumber: '1029384756',
    provisioningStatus: 'active',
  });

  memoryStore.wallets.set(`${u1Id}_GBP`, {
    id: 'wallet-gbp-001',
    userId: u1Id,
    currency: 'GBP',
    balanceMinor: 85000, // £850.00
    pendingMinor: 0,
    isDefault: false,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'ClearBank UK',
    providerAccountNumber: '04928172',
    provisioningStatus: 'active',
  });

  memoryStore.wallets.set(`${u1Id}_EUR`, {
    id: 'wallet-eur-001',
    userId: u1Id,
    currency: 'EUR',
    balanceMinor: 62000, // €620.00
    pendingMinor: 0,
    isDefault: false,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'Banking Circle S.A.',
    providerAccountNumber: 'DE89370400440532013000',
    provisioningStatus: 'active',
  });

  // 2. Secondary Demo User: Babajide Adeleke (Tester 2)
  const u2Id = 'demo-user-002';
  memoryStore.users.set(u2Id, {
    id: u2Id,
    phone: '08020000002',
    email: 'babajide.adeleke@tavi-tester.ng',
    demoTag: '@babajide',
    passwordHash: demoPasswordHash,
    pinHash: demoPasswordHash,
    investPinHash: demoPasswordHash,
    role: 'USER',
    isPhoneVerified: true,
    isEmailVerified: true,
    kycTier: 'TIER_2_VERIFIED',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.profiles.set(u2Id, {
    id: 'profile-002',
    userId: u2Id,
    firstName: 'Babajide',
    lastName: 'Adeleke',
    displayName: 'Babajide Adeleke',
    demoTag: '@babajide',
    avatarUrl: null,
    address: 'Ikeja GRA, Lagos, Nigeria',
    countryCode: 'NG',
    currencyPreference: 'NGN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.wallets.set(`${u2Id}_NGN`, {
    id: 'wallet-ngn-002',
    userId: u2Id,
    currency: 'NGN',
    balanceMinor: config.sandbox?.demoStartingBalanceMinor || 25000000, // ₦250,000.00
    pendingMinor: 0,
    isDefault: true,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'Providus Bank',
    providerAccountNumber: '9920394822',
    provisioningStatus: 'active',
  });

  // 3. Tertiary Demo User: Chioma Nwosu (Tester 3)
  const u3Id = 'demo-user-003';
  memoryStore.users.set(u3Id, {
    id: u3Id,
    phone: '09030000003',
    email: 'chioma.nwosu@tavi-tester.ng',
    demoTag: '@chioma',
    passwordHash: demoPasswordHash,
    pinHash: demoPasswordHash,
    investPinHash: demoPasswordHash,
    role: 'USER',
    isPhoneVerified: true,
    isEmailVerified: true,
    kycTier: 'TIER_2_VERIFIED',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.profiles.set(u3Id, {
    id: 'profile-003',
    userId: u3Id,
    firstName: 'Chioma',
    lastName: 'Nwosu',
    displayName: 'Chioma Nwosu',
    demoTag: '@chioma',
    avatarUrl: null,
    address: 'Lekki Phase 1, Lagos, Nigeria',
    countryCode: 'NG',
    currencyPreference: 'NGN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  memoryStore.wallets.set(`${u3Id}_NGN`, {
    id: 'wallet-ngn-003',
    userId: u3Id,
    currency: 'NGN',
    balanceMinor: 15000000, // ₦150,000.00
    pendingMinor: 0,
    isDefault: true,
    isDemo: true,
    label: 'Demo Funds (Simulated)',
    providerName: 'Providus Bank',
    providerAccountNumber: '9920394833',
    provisioningStatus: 'active',
  });

  // Seed default transactions for Amara
  memoryStore.transactions.push(
    {
      id: 'txn-001',
      reference: 'TXN20261027001',
      userId: u1Id,
      type: 'TRANSFER',
      direction: 'DEBIT',
      amountMinor: 2500000, // ₦25,000.00
      feeMinor: 1000,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Babajide Adeleke',
      counterpartyAccount: '9920394822',
      counterpartyBank: 'Providus Bank',
      narration: 'Project milestone settlement',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'txn-002',
      reference: 'TXN20261027002',
      userId: u1Id,
      type: 'DEPOSIT',
      direction: 'CREDIT',
      amountMinor: 5000000, // ₦50,000.00
      feeMinor: 0,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Chioma Nwosu',
      counterpartyAccount: '9920394833',
      counterpartyBank: 'Providus Bank',
      narration: 'Consulting fees reimbursement',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 24),
    }
  );

  // Seed initial mirror transactions for Babajide and Chioma
  memoryStore.transactions.push(
    {
      id: 'txn-001-rec',
      reference: 'TXN20261027001',
      userId: u2Id,
      type: 'DEPOSIT',
      direction: 'CREDIT',
      amountMinor: 2500000,
      feeMinor: 0,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Amara Okonkwo',
      counterpartyAccount: '9920394811',
      counterpartyBank: 'Providus Bank',
      narration: 'Project milestone settlement',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'txn-002-send',
      reference: 'TXN20261027002',
      userId: u3Id,
      type: 'TRANSFER',
      direction: 'DEBIT',
      amountMinor: 5000000,
      feeMinor: 1000,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'Amara Okonkwo',
      counterpartyAccount: '9920394811',
      counterpartyBank: 'Providus Bank',
      narration: 'Consulting fees reimbursement',
      isDemo: true,
      createdAt: new Date(Date.now() - 3600000 * 24),
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

  // Seed notifications
  memoryStore.notifications.push(
    {
      id: 'notif-001',
      userId: u1Id,
      category: 'TRANSACTIONS',
      title: 'Transfer Received (Demo)',
      message: '₦50,000.00 simulated demo funds received from Chioma Nwosu',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'notif-002',
      userId: u1Id,
      category: 'SECURITY',
      title: 'Successful Sign-in',
      message: 'New sign-in detected on TAVI Demo Sandbox',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 5),
    }
  );

  saveStoreToDisk();
}

/**
 * Searches for a registered user by phone, email, demo tag (@...), or account number
 */
export function findUserByIdentifier(identifier: string): { user: any; profile: any; wallet: any } | null {
  const query = identifier.trim().toLowerCase();
  const rawCleaned = identifier.replace(/\D/g, '');
  const cleanQuery = query.startsWith('@') ? query.slice(1) : query;

  for (const [_, user] of memoryStore.users) {
    const profile = memoryStore.profiles.get(user.id);
    const wallet = memoryStore.wallets.get(`${user.id}_NGN`);

    const userPhoneClean = user.phone ? user.phone.replace(/\D/g, '') : '';
    const acctClean = wallet?.providerAccountNumber ? wallet.providerAccountNumber.replace(/\D/g, '') : '';
    const userTag = (user.demoTag || profile?.demoTag || '').toLowerCase();
    const cleanTag = userTag.startsWith('@') ? userTag.slice(1) : userTag;

    const hasNumericDigits = rawCleaned.length >= 7;
    const phoneMatches = hasNumericDigits && (userPhoneClean === rawCleaned || userPhoneClean.endsWith(rawCleaned));
    const acctMatches = hasNumericDigits && (acctClean === rawCleaned);
    const tagMatches = cleanTag.length > 0 && cleanTag === cleanQuery;
    const emailMatches = Boolean(user.email && user.email.toLowerCase() === query);
    const idMatches = user.id === query;

    if (idMatches || emailMatches || phoneMatches || acctMatches || tagMatches) {
      return { user, profile, wallet };
    }
  }

  return null;
}

/**
 * Returns safe public recipient records for all eligible demo users (optionally excluding requester)
 */
export function getEligibleRecipients(excludeUserId?: string): any[] {
  const recipients: any[] = [];

  for (const [_, user] of memoryStore.users) {
    if (excludeUserId && user.id === excludeUserId) {
      continue;
    }

    const profile = memoryStore.profiles.get(user.id);
    const wallet = memoryStore.wallets.get(`${user.id}_NGN`);

    recipients.push({
      userId: user.id,
      name: profile?.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'TAVI Demo User',
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      demoTag: user.demoTag || profile?.demoTag || `@user${user.phone?.slice(-4)}`,
      phone: user.phone,
      accountNumber: wallet?.providerAccountNumber || '9920000000',
      bankName: wallet?.providerName || 'Providus Bank (Demo)',
      currency: 'NGN',
      kycTier: user.kycTier,
      isDemo: true,
    });
  }

  return recipients;
}

/**
 * Reset a specific user's demo balance and purge their test transactions
 */
export function resetUserDemoBalance(userId: string): { newBalanceMinor: number } {
  const walletKey = `${userId}_NGN`;
  const wallet = memoryStore.wallets.get(walletKey);
  const startingBalance = config.sandbox?.demoStartingBalanceMinor || 25000000;

  if (wallet) {
    wallet.balanceMinor = startingBalance;
    wallet.pendingMinor = 0;
  } else {
    memoryStore.wallets.set(walletKey, {
      id: `wallet-ngn-${Date.now()}`,
      userId,
      currency: 'NGN',
      balanceMinor: startingBalance,
      pendingMinor: 0,
      isDefault: true,
      isDemo: true,
      label: 'Demo Funds (Simulated)',
      providerName: 'Providus Bank',
      providerAccountNumber: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      provisioningStatus: 'active',
    });
  }

  // Remove previous transactions for this user
  memoryStore.transactions = memoryStore.transactions.filter((tx) => tx.userId !== userId);

  // Add initial grant transaction
  memoryStore.transactions.unshift({
    id: `tx-reset-${Date.now()}`,
    reference: `DEMO-RESET-${Date.now().toString().slice(-6)}`,
    userId,
    type: 'DEPOSIT',
    direction: 'CREDIT',
    amountMinor: startingBalance,
    feeMinor: 0,
    currency: 'NGN',
    status: 'SUCCESSFUL',
    counterpartyName: 'TAVI Demo Sandbox Authority',
    counterpartyAccount: '0000000000',
    counterpartyBank: 'TAVI Central',
    narration: 'Simulated Demo Funds Initial Grant',
    isDemo: true,
    createdAt: new Date(),
  });

  saveStoreToDisk();
  return { newBalanceMinor: startingBalance };
}

/**
 * Global sandbox reset back to factory seeded demo state
 */
export function resetDemoStore(): void {
  seedMemoryStore();
}

// Initialize: Hydrate from disk or seed fresh demo state
if (!loadStoreFromDisk()) {
  seedMemoryStore();
}

export function isDatabaseConnected(): boolean {
  return config.databaseUrl.length > 0;
}
