/**
 * TAVI Synthetic Demo Data
 * 
 * ALL data in this file is fictional and for demonstration purposes only.
 * No real accounts, real money, or real people are represented.
 * Demo mode is clearly indicated throughout the UI.
 */

import type {
  User,
  Account,
  BalanceSnapshot,
  Transaction,
  Beneficiary,
  Reminder,
  Budget,
  CurrencyQuote,
  InvestmentAccount,
  Holding,
  GiftCardRedemption,
} from '../types';

// ─── Relative Date Generators for Controlled Demonstration ──────────────────
const now = new Date();
export const daysAgo = (days: number, hours = 0, minutes = 0): string => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000 - minutes * 60 * 1000);
  return d.toISOString();
};
export const daysFromNow = (days: number): string => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

// ─── Demo User ────────────────────────────────────────────────────────────────
export const DEMO_USER: User = {
  id: 'demo-user-001',
  firstName: 'Amara',
  lastName: 'Okonkwo',
  email: 'amara.okonkwo@demo.tavi.app',
  phoneInput: '07074100290',
  normalizedPhone: '+2347074100290',
  phoneVerified: true,
  phoneVerifiedAt: daysAgo(60),
  avatarInitials: 'AO',
  kycStatus: 'verified',
  createdAt: daysAgo(60),
};

// ─── Demo Account ─────────────────────────────────────────────────────────────
/**
 * The phone number 07074100290 → display pattern 7074100290
 * In production, this is only shown after the authorised provider confirms.
 * This demo account is synthetic and does not represent a real bank account.
 */
export const DEMO_ACCOUNT: Account = {
  id: 'demo-acct-001',
  userId: 'demo-user-001',
  providerAccountNumber: '7074100290',   // Demo: matches the expected pattern
  expectedPattern: '7074100290',         // Derived from phone: 07074100290 → 7074100290
  providerName: 'TAVI Demo Bank',        // Fictional demo provider
  accountName: 'AMARA OKONKWO',
  accountType: 'Current',
  currency: 'NGN',
  provisioningStatus: 'active',
  provisioningTimestamp: daysAgo(60),
  lastProviderCheck: daysAgo(0, 1),
  patternMatchConfirmed: true,
};

// ─── Demo Balance ─────────────────────────────────────────────────────────────
// Balance stored as integer kobo (1 NGN = 100 kobo)
export const DEMO_BALANCE: BalanceSnapshot = {
  accountId: 'demo-acct-001',
  available: 845_650_00,    // ₦845,650.00
  ledger: 845_650_00,
  pending: 25_000_00,       // ₦25,000.00 pending
  currency: 'NGN',
  timestamp: daysAgo(0, 1),
};

// ─── Demo Transactions ────────────────────────────────────────────────────────
// ─── Demo Transactions ────────────────────────────────────────────────────────
export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 50_000_00,
    feeKobo: 10_75,
    currency: 'NGN',
    status: 'successful',
    category: 'transfer',
    counterpartyName: 'Ada Chukwu',
    counterpartyAccount: '0123456789',
    counterpartyBank: 'Access Bank',
    narration: 'Rent contribution',
    reference: 'TVI-DEMO-001',
    providerReference: 'NIPS240001234567',
    timestamp: daysAgo(1, 2, 30),
    settledAt: daysAgo(1, 2, 29),
  },
  {
    id: 'txn-002',
    accountId: 'demo-acct-001',
    direction: 'credit',
    amountKobo: 200_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'transfer',
    counterpartyName: 'Emeka Balogun',
    counterpartyAccount: '7064321890',
    counterpartyBank: 'TAVI Demo Bank',
    narration: 'Project payment Q4',
    reference: 'TVI-DEMO-002',
    providerReference: 'NIPS240001234568',
    timestamp: daysAgo(0, 3, 15),
    settledAt: daysAgo(0, 3, 14),
  },
  {
    id: 'txn-003',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 5_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'airtime',
    counterpartyName: 'MTN Nigeria',
    narration: 'Airtime recharge – 08074100290',
    reference: 'TVI-DEMO-003',
    timestamp: daysAgo(2, 5),
    settledAt: daysAgo(2, 4, 59),
  },
  {
    id: 'txn-004',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 15_000_00,
    feeKobo: 10_75,
    currency: 'NGN',
    status: 'pending_confirmation',
    category: 'transfer',
    counterpartyName: 'Tobi Adeyemi',
    counterpartyAccount: '2087654321',
    counterpartyBank: 'GTBank',
    narration: 'Dinner with colleagues',
    reference: 'TVI-DEMO-004',
    timestamp: daysAgo(0, 1, 10),
  },
  {
    id: 'txn-005',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 28_500_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'electricity',
    counterpartyName: 'IKEDC – Ikeja Electric',
    narration: 'Prepaid electricity – Meter 0450123456',
    reference: 'TVI-DEMO-005',
    timestamp: daysAgo(4, 6),
    settledAt: daysAgo(4, 5, 59),
  },
  {
    id: 'txn-006',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 7_600_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'failed',
    category: 'transfer',
    counterpartyName: 'Ngozi Eze',
    counterpartyAccount: '3041234567',
    counterpartyBank: 'Zenith Bank',
    narration: 'Birthday contribution',
    reference: 'TVI-DEMO-006',
    timestamp: daysAgo(5, 8),
  },
  {
    id: 'txn-007',
    accountId: 'demo-acct-001',
    direction: 'credit',
    amountKobo: 450_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'add_money',
    counterpartyName: 'Salary – Tech Innovate Ltd',
    narration: 'Monthly salary disbursement',
    reference: 'TVI-DEMO-007',
    timestamp: daysAgo(12, 10),
    settledAt: daysAgo(12, 9, 59),
  },
  {
    id: 'txn-008',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 32_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'cable_tv',
    counterpartyName: 'DSTV – MultiChoice Nigeria',
    narration: 'Premium bouquet renewal',
    reference: 'TVI-DEMO-008',
    timestamp: daysAgo(14, 4),
    settledAt: daysAgo(14, 3, 59),
  },
  {
    id: 'txn-009',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 3_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'data',
    counterpartyName: 'Airtel Nigeria',
    narration: 'Data bundle – 3GB 30-day',
    reference: 'TVI-DEMO-009',
    timestamp: daysAgo(16, 7),
    settledAt: daysAgo(16, 6, 59),
  },
  {
    id: 'txn-010',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 100_000_00,
    feeKobo: 26_88,
    currency: 'NGN',
    status: 'reversed',
    category: 'transfer',
    counterpartyName: 'Chidi Obi',
    counterpartyAccount: '5023456789',
    counterpartyBank: 'First Bank',
    narration: 'Car parts payment',
    reference: 'TVI-DEMO-010',
    timestamp: daysAgo(18, 5),
    settledAt: daysAgo(18, 4, 30),
  },
  {
    id: 'txn-011',
    accountId: 'demo-acct-001',
    direction: 'credit',
    amountKobo: 100_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'transfer',
    counterpartyName: 'Reversal – Chidi Obi',
    narration: 'Reversal of TVI-DEMO-010',
    reference: 'TVI-DEMO-011',
    timestamp: daysAgo(18, 4, 25),
    settledAt: daysAgo(18, 4, 20),
  },
  {
    id: 'txn-012',
    accountId: 'demo-acct-001',
    direction: 'debit',
    amountKobo: 25_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'transfer',
    counterpartyName: 'Ada Chukwu',
    counterpartyAccount: '0123456789',
    counterpartyBank: 'Access Bank',
    narration: 'Groceries split',
    reference: 'TVI-DEMO-012',
    timestamp: daysAgo(20, 6),
    settledAt: daysAgo(20, 5, 59),
  },
  {
    id: 'txn-013',
    accountId: 'demo-acct-001',
    direction: 'credit',
    amountKobo: 18_000_00,
    feeKobo: 0,
    currency: 'NGN',
    status: 'successful',
    category: 'transfer',
    counterpartyName: 'Ada Chukwu',
    counterpartyAccount: '0123456789',
    counterpartyBank: 'Access Bank',
    narration: 'Refund for market run',
    reference: 'TVI-DEMO-013',
    timestamp: daysAgo(4, 2),
    settledAt: daysAgo(4, 1, 58),
  },
];

// ─── Demo Beneficiaries ───────────────────────────────────────────────────────
export const DEMO_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-001',
    userId: 'demo-user-001',
    name: 'Ada Chukwu',
    accountNumber: '0123456789',
    bankName: 'Access Bank',
    bankCode: '044',
    nickname: 'Ada',
    lastUsed: daysAgo(1, 2),
  },
  {
    id: 'ben-002',
    userId: 'demo-user-001',
    name: 'Emeka Balogun',
    accountNumber: '7064321890',
    bankName: 'TAVI Demo Bank',
    bankCode: 'TAVI',
    lastUsed: daysAgo(0, 3),
  },
  {
    id: 'ben-003',
    userId: 'demo-user-001',
    name: 'Tobi Adeyemi',
    accountNumber: '2087654321',
    bankName: 'GTBank',
    bankCode: '058',
    lastUsed: daysAgo(0, 1),
  },
];

// ─── Demo Reminders ───────────────────────────────────────────────────────────
export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'rem-001',
    userId: 'demo-user-001',
    title: 'Rent Contribution',
    dueDate: daysFromNow(4),
    amountKobo: 250_000_00,
    currency: 'NGN',
    recurrence: 'monthly',
    notes: 'Pay to landlord by 1st',
    notificationEnabled: true,
    completed: false,
  },
  {
    id: 'rem-002',
    userId: 'demo-user-001',
    title: 'Netflix Subscription',
    dueDate: daysFromNow(11),
    amountKobo: 7_000_00,
    currency: 'NGN',
    recurrence: 'monthly',
    notificationEnabled: true,
    completed: false,
  },
  {
    id: 'rem-003',
    userId: 'demo-user-001',
    title: 'Review Investment Portfolio',
    dueDate: daysFromNow(2),
    recurrence: 'weekly',
    notificationEnabled: true,
    completed: false,
  },
];

// ─── Demo Budgets ─────────────────────────────────────────────────────────────
const currentMonthStr = new Date().toISOString().slice(0, 7);
export const DEMO_BUDGETS: Budget[] = [
  { id: 'bud-001', userId: 'demo-user-001', category: 'transfer', limitKobo: 200_000_00, spentKobo: 182_600_00, currency: 'NGN', month: currentMonthStr },
  { id: 'bud-002', userId: 'demo-user-001', category: 'airtime', limitKobo: 15_000_00, spentKobo: 5_000_00, currency: 'NGN', month: currentMonthStr },
  { id: 'bud-003', userId: 'demo-user-001', category: 'electricity', limitKobo: 35_000_00, spentKobo: 28_500_00, currency: 'NGN', month: currentMonthStr },
  { id: 'bud-004', userId: 'demo-user-001', category: 'cable_tv', limitKobo: 35_000_00, spentKobo: 32_000_00, currency: 'NGN', month: currentMonthStr },
  { id: 'bud-005', userId: 'demo-user-001', category: 'data', limitKobo: 10_000_00, spentKobo: 3_000_00, currency: 'NGN', month: currentMonthStr },
];

// ─── Demo FX Rates ────────────────────────────────────────────────────────────
export const DEMO_FX_RATES: CurrencyQuote[] = [
  { id: 'fx-001', fromCurrency: 'NGN', toCurrency: 'USD', rate: 0.000625, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
  { id: 'fx-002', fromCurrency: 'NGN', toCurrency: 'GBP', rate: 0.000503, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
  { id: 'fx-003', fromCurrency: 'NGN', toCurrency: 'EUR', rate: 0.000583, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
  { id: 'fx-004', fromCurrency: 'USD', toCurrency: 'NGN', rate: 1600, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
  { id: 'fx-005', fromCurrency: 'GBP', toCurrency: 'NGN', rate: 1987.5, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
  { id: 'fx-006', fromCurrency: 'EUR', toCurrency: 'NGN', rate: 1714.8, indicativeOnly: true, timestamp: daysAgo(0, 0, 15), source: 'TAVI Mid-Market Feed (Demo)' },
];

// ─── Demo Investment ──────────────────────────────────────────────────────────
export const DEMO_INVESTMENT_ACCOUNT: InvestmentAccount = {
  id: 'inv-acct-001',
  userId: 'demo-user-001',
  portfolioValueKobo: 1_250_000_00,
  investedAmountKobo: 1_100_000_00,
  realisedGainKobo: 15_000_00,
  unrealisedGainKobo: 135_000_00,
  cashAvailableKobo: 50_000_00,
  currency: 'NGN',
  lastUpdated: daysAgo(0, 0, 25),
};

export const DEMO_HOLDINGS: Holding[] = [
  {
    id: 'hold-001',
    investmentAccountId: 'inv-acct-001',
    ticker: 'DANGCEM',
    companyName: 'Dangote Cement Plc',
    exchange: 'NGX',
    quantity: 500,
    averagePriceKobo: 380_00,
    currentPriceKobo: 395_00,
    currency: 'NGN',
    priceTimestamp: daysAgo(0, 0, 30),
  },
  {
    id: 'hold-002',
    investmentAccountId: 'inv-acct-001',
    ticker: 'GTCO',
    companyName: 'Guaranty Trust Holding Co.',
    exchange: 'NGX',
    quantity: 2000,
    averagePriceKobo: 48_00,
    currentPriceKobo: 52_50,
    currency: 'NGN',
    priceTimestamp: daysAgo(0, 0, 30),
  },
  {
    id: 'hold-003',
    investmentAccountId: 'inv-acct-001',
    ticker: 'AIRTELAFRI',
    companyName: 'Airtel Africa Plc',
    exchange: 'NGX',
    quantity: 1000,
    averagePriceKobo: 195_00,
    currentPriceKobo: 207_00,
    currency: 'NGN',
    priceTimestamp: daysAgo(0, 0, 30),
  },
  {
    id: 'hold-004',
    investmentAccountId: 'inv-acct-001',
    ticker: 'MTNN',
    companyName: 'MTN Nigeria Communications Plc',
    exchange: 'NGX',
    quantity: 1200,
    averagePriceKobo: 220_00,
    currentPriceKobo: 238_50,
    currency: 'NGN',
    priceTimestamp: daysAgo(0, 0, 30),
  },
];

// ─── Nigerian Equities Market Universe (NGX) ──────────────────────────────────
export interface NGXStock {
  ticker: string;
  name: string;
  sector: string;
  priceKobo: number;
  changePercent: number;
  volume: string;
  mktCap: string;
  peRatio?: string;
  dividendYield?: string;
  logoBg: string;
  logoText: string;
}

export const DEMO_NGX_STOCKS: NGXStock[] = [
  { ticker: 'DANGCEM', name: 'Dangote Cement Plc', sector: 'Industrial Goods', priceKobo: 395_00, changePercent: +2.15, volume: '1.42M', mktCap: '₦6.72T', peRatio: '14.2x', dividendYield: '4.8%', logoBg: '#1E3A8A', logoText: 'DC' },
  { ticker: 'GTCO', name: 'Guaranty Trust Holding Co.', sector: 'Financial Services', priceKobo: 52_50, changePercent: +1.85, volume: '8.75M', mktCap: '₦1.54T', peRatio: '4.1x', dividendYield: '7.2%', logoBg: '#EA580C', logoText: 'GT' },
  { ticker: 'AIRTELAFRI', name: 'Airtel Africa Plc', sector: 'Telecommunications', priceKobo: 207_00, changePercent: -0.45, volume: '412K', mktCap: '₦7.78T', peRatio: '18.5x', dividendYield: '3.1%', logoBg: '#DC2626', logoText: 'AA' },
  { ticker: 'MTNN', name: 'MTN Nigeria Communications Plc', sector: 'Telecommunications', priceKobo: 238_50, changePercent: +3.12, volume: '3.10M', mktCap: '₦4.89T', peRatio: '12.8x', dividendYield: '5.6%', logoBg: '#EAB308', logoText: 'MTN' },
  { ticker: 'ZENITHBANK', name: 'Zenith Bank Plc', sector: 'Financial Services', priceKobo: 41_20, changePercent: +0.75, volume: '6.90M', mktCap: '₦1.29T', peRatio: '3.8x', dividendYield: '8.4%', logoBg: '#B91C1C', logoText: 'ZB' },
  { ticker: 'BUACEMENT', name: 'BUA Cement Plc', sector: 'Industrial Goods', priceKobo: 142_00, changePercent: -1.20, volume: '890K', mktCap: '₦4.80T', peRatio: '16.0x', dividendYield: '2.5%', logoBg: '#047857', logoText: 'BUA' },
  { ticker: 'SEPLAT', name: 'Seplat Energy Plc', sector: 'Oil & Gas', priceKobo: 3450_00, changePercent: +4.20, volume: '320K', mktCap: '₦2.03T', peRatio: '8.2x', dividendYield: '6.8%', logoBg: '#059669', logoText: 'SEP' },
  { ticker: 'NESTLE', name: 'Nestle Nigeria Plc', sector: 'Consumer Goods', priceKobo: 910_00, changePercent: -0.80, volume: '185K', mktCap: '₦721B', peRatio: '22.1x', dividendYield: '4.0%', logoBg: '#4338CA', logoText: 'NES' },
];

// ─── TAVI Indices ─────────────────────────────────────────────────────────────
export interface TAVIIndex {
  code: string;
  name: string;
  level: number;
  change: number;
  changePercent: number;
  description: string;
  constituentsCount: number;
  weighting: string;
}

export const DEMO_TAVI_INDICES: TAVIIndex[] = [
  { code: 'TAVI 15', name: 'TAVI Top 15 Index', level: 1845.20, change: +24.10, changePercent: +1.32, description: 'Market-cap weighted benchmark tracking the 15 largest and most liquid NGX companies.', constituentsCount: 15, weighting: 'Free-Float Market Cap' },
  { code: 'TAVI 30', name: 'TAVI Broad Market 30 Index', level: 2412.85, change: +18.40, changePercent: +0.77, description: 'The flagship broad-market indicator covering 30 blue-chip equities on the Nigerian Exchange.', constituentsCount: 30, weighting: 'Free-Float Market Cap' },
  { code: 'TAVI DIV30', name: 'TAVI Dividend 30 Index', level: 1620.40, change: +12.30, changePercent: +0.76, description: 'High-dividend yield strategy index screening the top 30 dividend-paying Nigerian companies.', constituentsCount: 30, weighting: 'Dividend-Yield Weighted' },
  { code: 'TAVI VAL30', name: 'TAVI Value 30 Index', level: 1430.15, change: -5.20, changePercent: -0.36, description: 'Fundamental value benchmark focusing on attractive P/E and P/B multiples on NGX.', constituentsCount: 30, weighting: 'Fundamental Value' },
  { code: 'TAVI MOM30', name: 'TAVI Momentum 30 Index', level: 2890.60, change: +45.80, changePercent: +1.61, description: 'Price momentum factor tracking the strongest 6-month and 12-month relative performers.', constituentsCount: 30, weighting: 'Momentum Factor Weighted' },
  { code: 'TAVI LC30', name: 'TAVI Large Cap 30 Index', level: 2150.90, change: +15.70, changePercent: +0.73, description: 'Core large-capitalization equities representing over 85% of total NGX market capitalization.', constituentsCount: 30, weighting: 'Market Cap Weighted' },
  { code: 'TAVI MC30', name: 'TAVI Mid Cap Index', level: 1180.30, change: -2.10, changePercent: -0.18, description: 'Mid-sized Nigerian enterprises positioned for high long-term domestic economic growth.', constituentsCount: 30, weighting: 'Equal Weighted' },
  { code: 'TAVI SC30', name: 'TAVI Small Cap Index', level: 940.50, change: +8.40, changePercent: +0.90, description: 'Emerging high-beta small cap companies listed on the Growth and Main boards of NGX.', constituentsCount: 30, weighting: 'Equal Weighted' },
];

// ─── Demo Order Book (NGX: DANGCEM) ───────────────────────────────────────────
export interface OrderBookLevel {
  orders: number;
  quantity: number;
  priceKobo: number;
}

export const DEMO_ORDER_BOOK: { bids: OrderBookLevel[]; offers: OrderBookLevel[]; spreadKobo: number; timestamp: string } = {
  spreadKobo: 1_00, // ₦1.00 spread
  timestamp: daysAgo(0, 0, 1),
  bids: [
    { orders: 4, quantity: 45_000, priceKobo: 395_00 },
    { orders: 8, quantity: 120_500, priceKobo: 394_50 },
    { orders: 12, quantity: 310_000, priceKobo: 394_00 },
    { orders: 15, quantity: 450_000, priceKobo: 393_50 },
    { orders: 22, quantity: 820_000, priceKobo: 393_00 },
  ],
  offers: [
    { orders: 3, quantity: 32_000, priceKobo: 396_00 },
    { orders: 7, quantity: 95_000, priceKobo: 396_50 },
    { orders: 11, quantity: 240_000, priceKobo: 397_00 },
    { orders: 18, quantity: 510_000, priceKobo: 397_50 },
    { orders: 25, quantity: 980_000, priceKobo: 398_00 },
  ],
};

// ─── Demo Multi-Currency Balances ─────────────────────────────────────────────
export interface MultiCurrencyAccount {
  currency: string;
  name: string;
  symbol: string;
  balance: number;
  accountNumber?: string;
  bankOrIban?: string;
  sortOrRouting?: string;
  status: 'active' | 'available_to_activate' | 'verification_required';
  isLocal: boolean;
}

export const DEMO_MULTI_CURRENCY_ACCOUNTS: MultiCurrencyAccount[] = [
  { currency: 'NGN', name: 'Nigerian Naira', symbol: '₦', balance: 845650.00, accountNumber: '7074100290', bankOrIban: 'TAVI Demo Bank', status: 'active', isLocal: true },
  { currency: 'USD', name: 'US Dollar', symbol: '$', balance: 1420.50, accountNumber: '8841920491', bankOrIban: 'Community Federal Savings Bank (US)', sortOrRouting: '026073150', status: 'active', isLocal: false },
  { currency: 'GBP', name: 'British Pound', symbol: '£', balance: 850.00, accountNumber: '29401823', bankOrIban: 'Barclays Bank UK PLC', sortOrRouting: '20-04-15', status: 'active', isLocal: false },
  { currency: 'EUR', name: 'Euro', symbol: '€', balance: 1100.00, accountNumber: 'DE89370400440532013000', bankOrIban: 'Solaris SE (Germany)', status: 'active', isLocal: false },
];

// ─── Demo Crypto Assets (Informational Tracker) ───────────────────────────────
export interface CryptoAssetItem {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  mktCap: string;
  supportedNetworks: string[];
  depositNotice: string;
}

export const DEMO_CRYPTO_ASSETS: CryptoAssetItem[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', priceUsd: 68450.00, change24h: +2.85, mktCap: '$1.35T', supportedNetworks: ['Bitcoin (Native SegWit)', 'Lightning Network'], depositNotice: 'Send only BTC to this Bitcoin address. Minimum 2 network confirmations.' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', priceUsd: 2620.00, change24h: +1.40, mktCap: '$315B', supportedNetworks: ['Ethereum (ERC-20)', 'Arbitrum One', 'Optimism'], depositNotice: 'Send ETH or ERC-20 assets only on the specified network.' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', priceUsd: 1.00, change24h: +0.02, mktCap: '$120B', supportedNetworks: ['Tron (TRC-20)', 'Ethereum (ERC-20)', 'BNB Smart Chain (BEP-20)'], depositNotice: 'Match network exactly! Sending USDT across incompatible chains causes permanent loss.' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', priceUsd: 175.40, change24h: +5.10, mktCap: '$82B', supportedNetworks: ['Solana (SPL)'], depositNotice: 'Send only Solana SPL tokens to this address.' },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', priceUsd: 590.20, change24h: -0.60, mktCap: '$87B', supportedNetworks: ['BNB Smart Chain (BEP-20)'], depositNotice: 'Memo/Tag may be required for exchange custodial deposits.' },
];

// ─── Demo Gift Cards (Multi-stage Status Lifecycle) ───────────────────────────
export const DEMO_GIFT_CARDS: GiftCardRedemption[] = [
  {
    id: 'gc-001',
    userId: 'demo-user-001',
    brand: 'Amazon',
    region: 'US',
    denomination: 50,
    denominationCurrency: 'USD',
    payoutKobo: 72_500_00,
    payoutCurrency: 'NGN',
    status: 'paid',
    submittedAt: daysAgo(10, 2),
    completedAt: daysAgo(10, 1),
    reference: 'GC-DEMO-94021',
  },
  {
    id: 'gc-002',
    userId: 'demo-user-001',
    brand: 'iTunes/Apple',
    region: 'US',
    denomination: 100,
    denominationCurrency: 'USD',
    payoutKobo: 142_000_00,
    payoutCurrency: 'NGN',
    status: 'under_review',
    submittedAt: daysAgo(0, 1, 30),
    reference: 'GC-DEMO-94022',
  },
  {
    id: 'gc-003',
    userId: 'demo-user-001',
    brand: 'Steam',
    region: 'US',
    denomination: 25,
    denominationCurrency: 'USD',
    payoutKobo: 35_000_00,
    payoutCurrency: 'NGN',
    status: 'approved',
    submittedAt: daysAgo(1, 4),
    completedAt: daysAgo(1, 3, 40),
    reference: 'GC-DEMO-94023',
  },
];

// ─── Supported Nigerian Banks ─────────────────────────────────────────────────
export const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank', code: '011' },
  { name: 'GTBank', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
  { name: 'Union Bank', code: '032' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Opay', code: '100004' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Moniepoint', code: '50515' },
  { name: 'PalmPay', code: '100033' },
  { name: 'Carbon', code: '100026' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Ecobank', code: '050' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'TAVI Demo Bank', code: 'TAVI' },
];

// ─── Supported Gift Card Brands ───────────────────────────────────────────────
export const GIFT_CARD_BRANDS = [
  { name: 'Amazon', regions: ['US', 'UK', 'DE'], minDenomination: 10, ratePerDollar: 1450 },
  { name: 'iTunes/Apple', regions: ['US', 'UK'], minDenomination: 15, ratePerDollar: 1420 },
  { name: 'Google Play', regions: ['US', 'UK'], minDenomination: 10, ratePerDollar: 1400 },
  { name: 'Steam', regions: ['US', 'UK', 'DE'], minDenomination: 20, ratePerDollar: 1400 },
  { name: 'Razer Gold', regions: ['US'], minDenomination: 25, ratePerDollar: 1410 },
  { name: 'Sephora', regions: ['US'], minDenomination: 25, ratePerDollar: 1380 },
];

// ─── Spending Chart Data ──────────────────────────────────────────────────────
export const DEMO_SPENDING_CHART = [
  { month: 'Jul', amount: 280000 },
  { month: 'Aug', amount: 320000 },
  { month: 'Sep', amount: 195000 },
  { month: 'Oct', amount: 251100 },
];

// ─── Portfolio Chart ──────────────────────────────────────────────────────────
export const DEMO_PORTFOLIO_CHART = [
  { date: 'May', value: 900000 },
  { date: 'Jun', value: 950000 },
  { date: 'Jul', value: 980000 },
  { date: 'Aug', value: 1050000 },
  { date: 'Sep', value: 1120000 },
  { date: 'Oct', value: 1250000 },
];

// ─── Notifications Dataset (Phase 11) ─────────────────────────────────────────
import type { AppNotification } from '../types';

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    title: 'Inward Transfer Received',
    message: '₦200,000 received from Emeka Balogun via TAVI Instant Transfer.',
    category: 'transaction',
    timestamp: daysAgo(0, 3, 15),
    read: false,
    reference: 'TVI-DEMO-002',
    amountKobo: 200_000_00,
    actionUrl: '/transactions',
  },
  {
    id: 'notif-002',
    title: 'Security Alert: New Device Sign-in',
    message: 'Your account was accessed from Chrome on Windows 11 in Lagos, Nigeria.',
    category: 'security',
    timestamp: daysAgo(0, 8, 30),
    read: false,
    actionUrl: '/settings',
  },
  {
    id: 'notif-003',
    title: 'Upcoming Rent Reminder',
    message: 'Your scheduled Rent Contribution of ₦250,000 is due in 4 days.',
    category: 'reminders',
    timestamp: daysAgo(1, 4),
    read: false,
    actionUrl: '/reminders',
  },
  {
    id: 'notif-004',
    title: 'Stock Dividend Announced',
    message: 'Dangote Cement (DANGCEM) announced a proposed dividend of ₦20.00 per ordinary share.',
    category: 'investments',
    timestamp: daysAgo(2, 6),
    read: true,
    actionUrl: '/invest',
  },
  {
    id: 'notif-005',
    title: 'Electricity Token Generated',
    message: 'Meter: 0450123456 | Token: 4930-1829-4829-1029-8821 | Units: 142.5 kWh',
    category: 'bills',
    timestamp: daysAgo(4, 6),
    read: true,
    actionUrl: '/transactions',
  },
  {
    id: 'notif-006',
    title: 'Tier 3 Identity Verified',
    message: 'Your BVN and address documents have been confirmed. Daily limit upgraded to ₦5,000,000.',
    category: 'account',
    timestamp: daysAgo(10, 5),
    read: true,
    actionUrl: '/settings',
  },
];

// ─── Support Cases Dataset (Phase 8) ──────────────────────────────────────────
import type { SupportCase } from '../types';

export const DEMO_SUPPORT_CASES: SupportCase[] = [
  {
    id: 'case-001',
    userId: 'demo-user-001',
    category: 'Transaction Issue',
    subject: 'Delayed transfer to Tobi Adeyemi',
    description: 'Transfer TVI-DEMO-004 is currently pending confirmation from recipient bank GTBank.',
    relatedTxReference: 'TVI-DEMO-004',
    status: 'in_progress',
    createdAt: daysAgo(0, 1),
    reference: 'TVI-CASE-84920',
    updates: [
      { timestamp: daysAgo(0, 1), author: 'System', message: 'Case automatically logged following payment status enquiry.' },
      { timestamp: daysAgo(0, 0, 45), author: 'TAVI Support Team', message: 'We have initiated a trace with NIBSS and GTBank. Ambiguous settlement status will resolve within 30 minutes.' },
    ],
  },
  {
    id: 'case-002',
    userId: 'demo-user-001',
    category: 'Account & KYC',
    subject: 'Proof of Address Verification',
    description: 'Utility bill submission for international USD currency account activation.',
    status: 'resolved',
    createdAt: daysAgo(8, 2),
    reference: 'TVI-CASE-81024',
    updates: [
      { timestamp: daysAgo(8, 2), author: 'Amara Okonkwo', message: 'Uploaded IKEDC prepaid receipt for verification.' },
      { timestamp: daysAgo(7, 6), author: 'Compliance Officer', message: 'Address verified successfully. International account provisioned.' },
    ],
  },
];

// ─── Full 40 FAQs Dataset (Phase 9) ───────────────────────────────────────────
import type { FAQItem } from '../types';

export const DEMO_FAQS: FAQItem[] = [
  // CATEGORY A — ACCOUNT & PROFILE
  {
    id: 'faq-01',
    category: 'Account & Profile',
    question: 'How do I update my personal information?',
    answer: 'Open Settings, select Profile & Personal Information, and choose the field you want to update. Follow any verification steps shown. Some verified identity details may require additional checks before they can be changed.',
    keywords: ['profile', 'update', 'personal', 'name', 'phone', 'address'],
    relevantRoute: '/profile',
  },
  {
    id: 'faq-02',
    category: 'Account & Profile',
    question: 'Why is my email address or phone number marked as unverified?',
    answer: 'It means the required verification process has not been completed or confirmed. Open your profile and follow the available verification instructions. If you no longer have access to the contact method, use the secure account-recovery process.',
    keywords: ['unverified', 'email', 'phone', 'verification', 'confirm'],
    relevantRoute: '/profile',
  },
  {
    id: 'faq-03',
    category: 'Account & Profile',
    question: 'Can I use TAVI from another country?',
    answer: 'Availability depends on the services offered in your country, your eligibility and the relevant verification requirements. Check the supported-country information for the specific TAVI service. Do not assume every feature is available worldwide.',
    keywords: ['country', 'international', 'diaspora', 'abroad', 'eligibility'],
    relevantRoute: '/fx',
  },

  // CATEGORY B — LOGIN & PASSWORD
  {
    id: 'faq-04',
    category: 'Login & Password',
    question: 'How do I change my password?',
    answer: 'Open Settings, select Security & Sign-in, then choose Change Password if available. Complete the verification steps and use a strong, unique password. If you cannot sign in, use the official password-recovery process.',
    keywords: ['password', 'change password', 'security', 'login'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-05',
    category: 'Login & Password',
    question: 'What should I do if I forget my password?',
    answer: 'Use the official password-recovery option on the sign-in screen. Follow the verification steps shown. Never share your password or recovery code with anyone, including someone claiming to be TAVI support.',
    keywords: ['forgot password', 'reset', 'recovery'],
    relevantRoute: '/login',
  },
  {
    id: 'faq-06',
    category: 'Login & Password',
    question: 'What should I do if I suspect someone has accessed my account?',
    answer: 'Use a trusted device to secure your account if possible. Change your password, review active sessions and revoke any session you do not recognise. Contact support through a verified channel and report any unauthorised transactions immediately. Do not share OTPs or authentication secrets.',
    keywords: ['hack', 'unauthorised', 'compromise', 'suspect', 'security alert'],
    relevantRoute: '/support',
  },

  // CATEGORY C — BIOMETRICS & PASSKEYS
  {
    id: 'faq-07',
    category: 'Biometrics & Passkeys',
    question: 'How do I enable fingerprint or face authentication?',
    answer: "Open Settings, select Security & Sign-in and choose the supported biometric option. Follow your device's authentication instructions. Availability depends on your device and the authentication methods TAVI has implemented.",
    keywords: ['face id', 'fingerprint', 'biometrics', 'touch id'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-08',
    category: 'Biometrics & Passkeys',
    question: 'Does TAVI store my fingerprint or face image?',
    answer: 'TAVI should use the supported device authentication system rather than collect raw biometric images or fingerprint templates. The exact sign-in implementation should be described in the current privacy documentation.',
    keywords: ['privacy', 'biometrics', 'fingerprint storage'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-09',
    category: 'Biometrics & Passkeys',
    question: 'Why is biometric authentication unavailable on my device?',
    answer: 'Your device may not support the required capability, the device’s biometric feature may not be configured, or the current TAVI implementation may not support that method. Use the supported alternative displayed in the app.',
    keywords: ['biometric error', 'not supported', 'hardware'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-10',
    category: 'Biometrics & Passkeys',
    question: 'What is a passkey?',
    answer: 'A passkey is a sign-in method that uses a supported device or authenticator to verify you without requiring a traditional password for that sign-in. Availability depends on the implemented authentication service.',
    keywords: ['passkey', 'webauthn', 'passwordless'],
    relevantRoute: '/settings',
  },

  // CATEGORY D — TWO-FACTOR AUTHENTICATION
  {
    id: 'faq-11',
    category: 'Two-Factor Authentication',
    question: 'What is two-factor authentication (2FA)?',
    answer: '2FA adds another verification step to sign-in or another protected action. For example, an authenticator app can generate a time-based code in addition to your usual sign-in method.',
    keywords: ['2fa', 'mfa', 'two factor', 'security'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-12',
    category: 'Two-Factor Authentication',
    question: 'How do I enable an authenticator app?',
    answer: 'Open Settings, select Security & Sign-in, then Two-Factor Authentication. Follow the setup instructions, scan the provisioning QR code in your authenticator app and verify a code before activation. Only display these instructions when the feature is implemented.',
    keywords: ['authenticator', 'totp', 'google authenticator', 'qr code'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-13',
    category: 'Two-Factor Authentication',
    question: 'What if I lose access to my authenticator app?',
    answer: 'Use TAVI’s official recovery process. If you saved recovery codes, follow the instructions provided during setup. If you have neither, contact support through a verified channel and complete the required identity checks. Do not bypass security verification.',
    keywords: ['lost 2fa', 'recovery code', 'lost phone'],
    relevantRoute: '/support',
  },
  {
    id: 'faq-14',
    category: 'Two-Factor Authentication',
    question: 'Should I share my 2FA code with support?',
    answer: 'No. Never share an authenticator code, OTP, recovery code or other authentication secret with another person.',
    keywords: ['share otp', 'scam', 'fraud', '2fa secret'],
    relevantRoute: '/settings',
  },

  // CATEGORY E — TRANSACTION PIN & PAYMENTS
  {
    id: 'faq-15',
    category: 'Transaction PIN & Payments',
    question: 'What is my transaction PIN used for?',
    answer: 'A transaction PIN is an additional security control for supported financial actions. The exact actions that require it depend on the TAVI payment and security configuration.',
    keywords: ['pin', 'transaction pin', 'transfer security'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-16',
    category: 'Transaction PIN & Payments',
    question: 'How do I change my transaction PIN?',
    answer: 'Open Settings, select Transaction Security and choose Change Transaction PIN. Complete the required verification steps. Do not share your PIN or write it in a chat or support ticket.',
    keywords: ['change pin', 'update pin'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-17',
    category: 'Transaction PIN & Payments',
    question: 'What if I forget my transaction PIN?',
    answer: 'Use the official PIN-recovery process, if available, and complete the required verification. Do not attempt to bypass the PIN through another screen or ask support to reveal the existing PIN.',
    keywords: ['forgot pin', 'reset pin'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-18',
    category: 'Transaction PIN & Payments',
    question: 'Why is my transaction PIN temporarily locked?',
    answer: 'Repeated incorrect attempts or a security control may temporarily block further attempts. Follow the recovery instructions shown in the app or contact verified support if you need assistance. Do not keep guessing the PIN.',
    keywords: ['pin locked', 'too many attempts', 'lockout'],
    relevantRoute: '/support',
  },
  {
    id: 'faq-19',
    category: 'Transaction PIN & Payments',
    question: 'Why is my transfer limit different from someone else’s?',
    answer: 'Limits may depend on verification status, account type, service-provider requirements, transaction risk and applicable rules. Check your own verification and limits page for the current authorised values.',
    keywords: ['limit', 'transfer limit', 'tier', 'daily limit'],
    relevantRoute: '/settings',
  },

  // CATEGORY F — IDENTITY VERIFICATION & LIMITS
  {
    id: 'faq-20',
    category: 'Identity Verification & Limits',
    question: 'How do I check my verification status?',
    answer: 'Open Settings and select Identity Verification & Limits. Review the status and any outstanding requirements shown for your account.',
    keywords: ['kyc', 'verification', 'tier', 'status'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-21',
    category: 'Identity Verification & Limits',
    question: 'How do I upgrade my verification level?',
    answer: 'Follow the verification steps displayed in the app. You may need to provide additional information or documents. An upgrade is not guaranteed until the relevant verification service confirms it.',
    keywords: ['upgrade', 'tier 3', 'higher limits'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-22',
    category: 'Identity Verification & Limits',
    question: 'Why has my verification not been completed?',
    answer: 'The submitted information may still be under review, additional information may be required, or verification may have failed. Check the status and instructions in your account. Contact support if the displayed explanation does not resolve the issue.',
    keywords: ['verification pending', 'kyc delayed', 'review'],
    relevantRoute: '/support',
  },
  {
    id: 'faq-23',
    category: 'Identity Verification & Limits',
    question: 'Can I increase my daily transfer limit?',
    answer: 'If an increase is available, the app will show the relevant eligibility and verification process. Limits are subject to the applicable provider rules and regulatory requirements. Do not promise a particular limit unless the authoritative service confirms it.',
    keywords: ['increase limit', 'daily transfer', 'upgrade'],
    relevantRoute: '/settings',
  },

  // CATEGORY G — DEVICES & SESSIONS
  {
    id: 'faq-24',
    category: 'Devices & Sessions',
    question: 'How can I see which devices are signed in?',
    answer: 'Open Settings, select Devices & Active Sessions, and review the available session information. This section should show only data returned by the actual session service.',
    keywords: ['devices', 'active sessions', 'logged in'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-25',
    category: 'Devices & Sessions',
    question: 'How do I sign out a device I no longer use?',
    answer: 'Select the relevant session and choose Sign Out or Revoke Access, if supported. Confirm the action. The interface should report success only after the backend confirms that the session has been revoked.',
    keywords: ['revoke', 'sign out device', 'kill session'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-26',
    category: 'Devices & Sessions',
    question: 'What should I do if I see a device I do not recognise?',
    answer: 'Revoke the session if the option is available, secure your sign-in credentials and report the event through verified support. Review your transactions for activity you do not recognise.',
    keywords: ['unknown device', 'unrecognised session', 'security'],
    relevantRoute: '/support',
  },

  // CATEGORY H — NOTIFICATIONS
  {
    id: 'faq-27',
    category: 'Notifications',
    question: 'How do I turn transaction notifications on or off?',
    answer: 'Open Settings, select Notifications & Preferences and change the supported notification options. Some essential security or transactional notifications may remain enabled where required.',
    keywords: ['push notifications', 'sms alerts', 'email alerts'],
    relevantRoute: '/notifications',
  },
  {
    id: 'faq-28',
    category: 'Notifications',
    question: 'Why am I not receiving notifications?',
    answer: 'Check the notification settings in TAVI and the relevant device settings. Push, SMS and email notifications depend on the channels configured for your account. If the problem continues, contact support.',
    keywords: ['missing alerts', 'no sms', 'no push'],
    relevantRoute: '/notifications',
  },
  {
    id: 'faq-29',
    category: 'Notifications',
    question: 'Can I stop marketing messages without stopping security alerts?',
    answer: 'The app should distinguish optional marketing preferences from essential security and transactional communications. Use the relevant controls in Notifications & Preferences.',
    keywords: ['marketing', 'opt out', 'spam', 'security alerts'],
    relevantRoute: '/settings',
  },

  // CATEGORY I — PRIVACY & DATA
  {
    id: 'faq-30',
    category: 'Privacy & Data',
    question: 'How does TAVI use my personal information?',
    answer: 'Review the current TAVI Privacy Notice for the information collected, the purposes of processing, relevant sharing arrangements, retention and your available rights. Do not publish an answer that makes unsupported claims about data handling.',
    keywords: ['privacy policy', 'gdpr', 'ndpr', 'data usage'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-31',
    category: 'Privacy & Data',
    question: 'How do I request a copy of my data?',
    answer: 'Open Settings, select Privacy & Data and use the available data-request process, if implemented. You may need to verify your identity before the request is processed.',
    keywords: ['data export', 'copy of data', 'data subject request'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-32',
    category: 'Privacy & Data',
    question: 'Can I delete my TAVI account?',
    answer: 'Use the account-closure request process in Settings if available. Review any outstanding transactions, active products, balances and relevant retention requirements first. Account closure may not result in immediate deletion of records that must be retained by law.',
    keywords: ['delete account', 'close account', 'erasure'],
    relevantRoute: '/settings',
  },

  // CATEGORY J — ACCOUNT RECOVERY
  {
    id: 'faq-33',
    category: 'Account Recovery',
    question: 'What if I lose my phone?',
    answer: 'Use a trusted device to sign in and revoke the lost device’s sessions where supported. Secure your account and contact support if you cannot regain access or suspect unauthorised activity.',
    keywords: ['lost phone', 'stolen device', 'emergency'],
    relevantRoute: '/support',
  },
  {
    id: 'faq-34',
    category: 'Account Recovery',
    question: 'What if I lose access to my registered phone number or email?',
    answer: 'Start the official account-recovery process and complete the required identity checks. Do not create another account or bypass verification unless the applicable account policy instructs you to do so.',
    keywords: ['lost number', 'changed sim', 'change email'],
    relevantRoute: '/support',
  },
  {
    id: 'faq-35',
    category: 'Account Recovery',
    question: 'How do I report a compromised account?',
    answer: 'Open the Security or Support section and choose the appropriate account-compromise reporting route. Follow the protective instructions and report any unrecognised transactions immediately.',
    keywords: ['compromised', 'hacked', 'freeze account', 'urgent'],
    relevantRoute: '/support',
  },

  // CATEGORY K — CARDS & CONNECTED SERVICES
  {
    id: 'faq-36',
    category: 'Cards & Connected Services',
    question: 'How do I freeze my TAVI card?',
    answer: 'If a supported card-control service is available, open the relevant card section and select Freeze Card. Confirm the action and wait for the provider’s result. If the option is unavailable, use the configured card-support route.',
    keywords: ['freeze card', 'block card', 'debit card'],
    relevantRoute: '/fx',
  },
  {
    id: 'faq-37',
    category: 'Cards & Connected Services',
    question: 'How do I remove a connected service?',
    answer: 'Open the relevant connected-service settings and choose Revoke Access or Disconnect where supported. Review the consequences before confirming.',
    keywords: ['connected apps', 'revoke access', 'third party'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-38',
    category: 'Cards & Connected Services',
    question: 'Why is a card-control option unavailable?',
    answer: 'The feature may not be supported for your card or provider, or the relevant service may not be connected. Use the support route displayed in the app.',
    keywords: ['card unavailable', 'card error'],
    relevantRoute: '/fx',
  },

  // CATEGORY L — ACCOUNT CLOSURE
  {
    id: 'faq-39',
    category: 'Account Closure',
    question: 'How do I close my TAVI account?',
    answer: 'Open Settings, select Account Closure and review the requirements. Resolve or understand any outstanding transactions and active services before submitting a request. Complete the required verification and confirmation.',
    keywords: ['close account', 'terminate', 'exit'],
    relevantRoute: '/settings',
  },
  {
    id: 'faq-40',
    category: 'Account Closure',
    question: 'What happens to my financial records after account closure?',
    answer: 'Retention depends on applicable legal, regulatory, security and operational requirements. Refer to the current TAVI Privacy Notice and account-closure terms for the rules that apply.',
    keywords: ['retention', 'data storage', 'audit trail'],
    relevantRoute: '/settings',
  },
];

