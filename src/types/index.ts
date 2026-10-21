// ─── Domain Types ──────────────────────────────────────────────────────────────

// Phone number provisioning status
export type AccountProvisioningStatus =
  | 'not_started'
  | 'pending'
  | 'active'
  | 'conflict'
  | 'failed'
  | 'suspended';

// Transaction status
export type TransactionStatus =
  | 'draft'
  | 'awaiting_auth'
  | 'submitted'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'pending_confirmation'
  | 'reversed'
  | 'refunded';

// Transaction direction
export type TransactionDirection = 'debit' | 'credit';

// Transaction category
export type TransactionCategory =
  | 'transfer'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'cable_tv'
  | 'internet'
  | 'gift_card'
  | 'add_money'
  | 'request'
  | 'investment'
  | 'fx'
  | 'bill'
  | 'other';

// ─── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneInput: string;           // Original input
  normalizedPhone: string;      // E.164 normalised
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  avatarInitials: string;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

// ─── Account ──────────────────────────────────────────────────────────────────
export interface Account {
  id: string;
  userId: string;
  // Provider-confirmed details
  providerAccountNumber: string;   // The authoritative account number from provider
  expectedPattern: string;         // Pattern derived from phone (display rule)
  providerName: string;            // e.g. "TAVI Demo Bank"
  accountName: string;             // Provider-confirmed account name
  accountType: string;
  currency: string;
  provisioningStatus: AccountProvisioningStatus;
  provisioningTimestamp?: string;
  lastProviderCheck?: string;
  // Is the pattern matched exactly by provider?
  patternMatchConfirmed: boolean;
}

// ─── Balance ──────────────────────────────────────────────────────────────────
export interface BalanceSnapshot {
  accountId: string;
  available: number;               // In kobo (minor units) — never use floats for money
  ledger: number;
  pending: number;
  currency: string;
  timestamp: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  accountId: string;
  direction: TransactionDirection;
  amountKobo: number;              // Always integer kobo
  feeKobo: number;
  currency: string;
  status: TransactionStatus;
  category: TransactionCategory;
  counterpartyName: string;
  counterpartyAccount?: string;
  counterpartyBank?: string;
  narration: string;
  reference: string;
  providerReference?: string;
  timestamp: string;
  settledAt?: string;
}

// ─── Beneficiary ──────────────────────────────────────────────────────────────
export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  nickname?: string;
  lastUsed?: string;
}

// ─── Reminder ─────────────────────────────────────────────────────────────────
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  amountKobo?: number;
  currency?: string;
  recurrence: 'once' | 'weekly' | 'monthly';
  notes?: string;
  notificationEnabled: boolean;
  completed: boolean;
}

// ─── Budget ───────────────────────────────────────────────────────────────────
export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  limitKobo: number;
  spentKobo: number;
  currency: string;
  month: string; // "YYYY-MM"
}

// ─── FX Quote ─────────────────────────────────────────────────────────────────
export interface CurrencyQuote {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  indicativeOnly: boolean;
  timestamp: string;
  expiresAt?: string;
  source: string;
}

// ─── Investment ───────────────────────────────────────────────────────────────
export interface InvestmentAccount {
  id: string;
  userId: string;
  portfolioValueKobo: number;
  investedAmountKobo: number;
  realisedGainKobo: number;
  unrealisedGainKobo: number;
  cashAvailableKobo: number;
  currency: string;
  lastUpdated: string;
}

export interface Holding {
  id: string;
  investmentAccountId: string;
  ticker: string;
  companyName: string;
  exchange: string;
  quantity: number;
  averagePriceKobo: number;
  currentPriceKobo: number;
  currency: string;
  priceTimestamp: string;
}

// ─── Gift Card ────────────────────────────────────────────────────────────────
export interface GiftCardRedemption {
  id: string;
  userId: string;
  brand: string;
  region: string;
  denomination: number;
  denominationCurrency: string;
  payoutKobo: number;
  payoutCurrency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'under_review';
  submittedAt: string;
  completedAt?: string;
  reference: string;
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: 'search' | 'transfer_draft' | 'reminder' | 'navigation' | 'info';
  actionPayload?: Record<string, unknown>;
}

export interface AITransferDraft {
  recipientName: string;
  recipientAccount?: string;
  recipientBank?: string;
  amountKobo: number;
  narration: string;
  feeKobo: number;
  totalDebitKobo: number;
  confirmed: boolean;
}

// ─── Support ──────────────────────────────────────────────────────────────────
export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  reference: string;
}

// ─── App Mode ─────────────────────────────────────────────────────────────────
export type AppMode = 'demo' | 'production';

export type ServiceStatus =
  | 'prototype'
  | 'partner_required'
  | 'compliance_review'
  | 'available'
  | 'temporarily_unavailable'
  | 'disabled';
