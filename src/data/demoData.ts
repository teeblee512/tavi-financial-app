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

// ─── Demo User ────────────────────────────────────────────────────────────────
export const DEMO_USER: User = {
  id: 'demo-user-001',
  firstName: 'Amara',
  lastName: 'Okonkwo',
  email: 'amara.okonkwo@demo.tavi.app',
  phoneInput: '07074100290',
  normalizedPhone: '+2347074100290',
  phoneVerified: true,
  phoneVerifiedAt: '2024-09-01T10:00:00Z',
  avatarInitials: 'AO',
  kycStatus: 'verified',
  createdAt: '2024-09-01T09:00:00Z',
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
  provisioningTimestamp: '2024-09-01T10:05:00Z',
  lastProviderCheck: '2024-10-20T00:00:00Z',
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
  timestamp: '2024-10-20T16:00:00Z',
};

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
    reference: 'TVI20241020001',
    providerReference: 'NIPS240001234567',
    timestamp: '2024-10-20T14:32:00Z',
    settledAt: '2024-10-20T14:32:45Z',
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
    reference: 'TVI20241020002',
    providerReference: 'NIPS240001234568',
    timestamp: '2024-10-20T11:15:00Z',
    settledAt: '2024-10-20T11:15:32Z',
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
    reference: 'TVI20241019003',
    timestamp: '2024-10-19T09:00:00Z',
    settledAt: '2024-10-19T09:00:10Z',
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
    narration: 'Dinner',
    reference: 'TVI20241019004',
    timestamp: '2024-10-19T20:45:00Z',
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
    reference: 'TVI20241018005',
    timestamp: '2024-10-18T08:20:00Z',
    settledAt: '2024-10-18T08:20:05Z',
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
    reference: 'TVI20241017006',
    timestamp: '2024-10-17T16:00:00Z',
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
    narration: 'October salary',
    reference: 'TVI20241015007',
    timestamp: '2024-10-15T08:00:00Z',
    settledAt: '2024-10-15T08:01:00Z',
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
    reference: 'TVI20241014008',
    timestamp: '2024-10-14T10:00:00Z',
    settledAt: '2024-10-14T10:00:08Z',
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
    reference: 'TVI20241013009',
    timestamp: '2024-10-13T18:30:00Z',
    settledAt: '2024-10-13T18:30:05Z',
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
    reference: 'TVI20241012010',
    timestamp: '2024-10-12T12:00:00Z',
    settledAt: '2024-10-12T12:30:00Z',
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
    narration: 'Reversal of TVI20241012010',
    reference: 'TVI20241012011',
    timestamp: '2024-10-12T12:35:00Z',
    settledAt: '2024-10-12T12:35:30Z',
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
    reference: 'TVI20241010012',
    timestamp: '2024-10-10T13:00:00Z',
    settledAt: '2024-10-10T13:00:45Z',
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
    lastUsed: '2024-10-20T14:32:00Z',
  },
  {
    id: 'ben-002',
    userId: 'demo-user-001',
    name: 'Emeka Balogun',
    accountNumber: '7064321890',
    bankName: 'TAVI Demo Bank',
    bankCode: 'TAVI',
    lastUsed: '2024-10-18T11:00:00Z',
  },
  {
    id: 'ben-003',
    userId: 'demo-user-001',
    name: 'Tobi Adeyemi',
    accountNumber: '2087654321',
    bankName: 'GTBank',
    bankCode: '058',
    lastUsed: '2024-10-19T20:45:00Z',
  },
];

// ─── Demo Reminders ───────────────────────────────────────────────────────────
export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'rem-001',
    userId: 'demo-user-001',
    title: 'Rent Payment',
    dueDate: '2024-11-01T00:00:00Z',
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
    dueDate: '2024-10-25T00:00:00Z',
    amountKobo: 7_000_00,
    currency: 'NGN',
    recurrence: 'monthly',
    notificationEnabled: true,
    completed: false,
  },
  {
    id: 'rem-003',
    userId: 'demo-user-001',
    title: 'Call Mum',
    dueDate: '2024-10-22T00:00:00Z',
    recurrence: 'weekly',
    notificationEnabled: true,
    completed: false,
  },
];

// ─── Demo Budgets ─────────────────────────────────────────────────────────────
export const DEMO_BUDGETS: Budget[] = [
  { id: 'bud-001', userId: 'demo-user-001', category: 'transfer', limitKobo: 200_000_00, spentKobo: 182_600_00, currency: 'NGN', month: '2024-10' },
  { id: 'bud-002', userId: 'demo-user-001', category: 'airtime', limitKobo: 15_000_00, spentKobo: 5_000_00, currency: 'NGN', month: '2024-10' },
  { id: 'bud-003', userId: 'demo-user-001', category: 'electricity', limitKobo: 35_000_00, spentKobo: 28_500_00, currency: 'NGN', month: '2024-10' },
  { id: 'bud-004', userId: 'demo-user-001', category: 'cable_tv', limitKobo: 35_000_00, spentKobo: 32_000_00, currency: 'NGN', month: '2024-10' },
  { id: 'bud-005', userId: 'demo-user-001', category: 'data', limitKobo: 10_000_00, spentKobo: 3_000_00, currency: 'NGN', month: '2024-10' },
];

// ─── Demo FX Rates ────────────────────────────────────────────────────────────
export const DEMO_FX_RATES: CurrencyQuote[] = [
  { id: 'fx-001', fromCurrency: 'NGN', toCurrency: 'USD', rate: 0.000625, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
  { id: 'fx-002', fromCurrency: 'NGN', toCurrency: 'GBP', rate: 0.000503, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
  { id: 'fx-003', fromCurrency: 'NGN', toCurrency: 'EUR', rate: 0.000583, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
  { id: 'fx-004', fromCurrency: 'USD', toCurrency: 'NGN', rate: 1600, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
  { id: 'fx-005', fromCurrency: 'GBP', toCurrency: 'NGN', rate: 1987.5, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
  { id: 'fx-006', fromCurrency: 'EUR', toCurrency: 'NGN', rate: 1714.8, indicativeOnly: true, timestamp: '2024-10-20T15:00:00Z', source: 'TAVI Demo Rates' },
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
  lastUpdated: '2024-10-20T16:00:00Z',
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
    priceTimestamp: '2024-10-20T15:00:00Z',
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
    priceTimestamp: '2024-10-20T15:00:00Z',
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
    priceTimestamp: '2024-10-20T15:00:00Z',
  },
];

// ─── Demo Gift Cards ──────────────────────────────────────────────────────────
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
    submittedAt: '2024-10-10T14:00:00Z',
    completedAt: '2024-10-10T15:00:00Z',
    reference: 'GC20241010001',
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
  { name: 'Amazon', regions: ['US', 'UK', 'DE'], minDenomination: 10 },
  { name: 'iTunes/Apple', regions: ['US', 'UK'], minDenomination: 15 },
  { name: 'Google Play', regions: ['US', 'UK'], minDenomination: 10 },
  { name: 'Steam', regions: ['US'], minDenomination: 20 },
  { name: 'Netflix', regions: ['US'], minDenomination: 25 },
  { name: 'Sephora', regions: ['US'], minDenomination: 25 },
  { name: 'eBay', regions: ['US'], minDenomination: 25 },
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
