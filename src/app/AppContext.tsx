import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  User,
  Account,
  BalanceSnapshot,
  Transaction,
  Beneficiary,
  Reminder,
  Budget,
  InvestmentAccount,
  Holding,
  GiftCardRedemption,
  AppMode,
  AccountProvisioningStatus,
  AppNotification,
  SupportCase,
  MoneyRequest,
} from '../types';
import {
  DEMO_USER,
  DEMO_ACCOUNT,
  DEMO_BALANCE,
  DEMO_TRANSACTIONS,
  DEMO_BENEFICIARIES,
  DEMO_REMINDERS,
  DEMO_BUDGETS,
  DEMO_INVESTMENT_ACCOUNT,
  DEMO_HOLDINGS,
  DEMO_GIFT_CARDS,
  DEMO_NOTIFICATIONS,
  DEMO_SUPPORT_CASES,
  DEMO_MULTI_CURRENCY_ACCOUNTS,
  type MultiCurrencyAccount,
} from '../data/demoData';
import { apiClient } from '../services/apiClient';

interface AppContextType {
  appMode: AppMode;
  isAuthenticated: boolean;
  isSyncing: boolean;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  user: User | null;
  account: Account | null;
  balance: BalanceSnapshot | null;
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  reminders: Reminder[];
  budgets: Budget[];
  investmentAccount: InvestmentAccount | null;
  holdings: Holding[];
  giftCards: GiftCardRedemption[];
  // Multi-user Auth & Session Sync
  loginDemo: () => void;
  loginAsTester: (tester: 'amara' | 'babajide' | 'chioma') => Promise<boolean>;
  loginWithCredentials: (phoneOrEmail: string, passwordOrPin: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: { phone: string; email?: string; firstName: string; lastName: string; demoTag?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshLiveState: () => Promise<void>;
  resetDemoBalance: () => Promise<void>;
  // Account Provisioning State Control
  setAccountProvisioningStatus: (status: AccountProvisioningStatus) => void;
  // Reminders
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId'>) => void;
  completeReminder: (id: string) => void;
  // Transactions
  addDemoTransaction: (tx: Omit<Transaction, 'id' | 'accountId'>) => void;
  // Beneficiaries
  addBeneficiary: (ben: Omit<Beneficiary, 'id' | 'userId'>) => void;
  removeBeneficiary: (id: string) => void;
  // Investment Trades & Security Boundary (Phase 4)
  isInvestUnlocked: boolean;
  unlockInvest: (pin: string) => boolean;
  lockInvest: () => void;
  watchlist: string[];
  toggleWatchlist: (ticker: string) => void;
  placeTrade: (ticker: string, quantity: number, type: 'buy' | 'sell') => boolean;
  // Gift Card redemption (Phase 6 - multi-stage review)
  redeemGiftCard: (brand: string, region: string, denomination: number, payoutKobo: number) => void;
  submitGiftCardOffer: (brand: string, region: string, denomination: number, payoutKobo: number, cardCode: string) => GiftCardRedemption;
  // Notifications (Phase 11)
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  // Support Cases (Phase 8)
  supportCases: SupportCase[];
  createSupportCase: (category: string, subject: string, description: string, relatedTxRef?: string) => SupportCase;
  // Money Requests (Phase 3)
  moneyRequests: MoneyRequest[];
  createMoneyRequest: (req: Omit<MoneyRequest, 'id' | 'userId' | 'createdAt' | 'reference'>) => MoneyRequest;
  // Multi Currency Accounts (Phase 5)
  multiCurrencyAccounts: MultiCurrencyAccount[];
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const AppContext = createContext<AppContextType | null>(null);

let toastCounter = 0;

function mapBackendTxToFrontend(t: any, accountId: string = 'demo-acct-001'): Transaction {
  return {
    id: t.id || `tx-${t.reference}`,
    accountId,
    direction: (t.direction || 'DEBIT').toLowerCase() as any,
    amountKobo: t.amountMinor ?? 0,
    feeKobo: t.feeMinor || 0,
    currency: t.currency || 'NGN',
    status: (t.status || 'SUCCESSFUL').toLowerCase() as any,
    category: (t.type || 'TRANSFER').toLowerCase() as any,
    counterpartyName: t.counterpartyName || 'TAVI Counterparty',
    counterpartyAccount: t.counterpartyAccount,
    counterpartyBank: t.counterpartyBank || 'Providus Bank',
    narration: t.narration || 'Demo funds transfer',
    reference: t.reference,
    timestamp: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [account, setAccount] = useState<Account | null>(DEMO_ACCOUNT);
  const [balance, setBalance] = useState<BalanceSnapshot | null>(DEMO_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(DEMO_BENEFICIARIES);
  const [reminders, setReminders] = useState<Reminder[]>(DEMO_REMINDERS);
  const [budgets] = useState<Budget[]>(DEMO_BUDGETS);
  const [investmentAccount, setInvestmentAccount] = useState<InvestmentAccount | null>(DEMO_INVESTMENT_ACCOUNT);
  const [holdings, setHoldings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [giftCards, setGiftCards] = useState<GiftCardRedemption[]>(DEMO_GIFT_CARDS);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEMO_NOTIFICATIONS);
  const [supportCases, setSupportCases] = useState<SupportCase[]>(DEMO_SUPPORT_CASES);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([
    {
      id: 'req-001',
      userId: 'demo-user-001',
      type: 'money',
      recipientIdentifier: '0123456789',
      recipientName: 'Ada Chukwu',
      amountKobo: 25_000_00,
      note: 'Groceries split from weekend run',
      status: 'pending',
      createdAt: new Date().toISOString(),
      reference: 'TVI-REQ-98124',
    },
  ]);
  const [multiCurrencyAccounts] = useState<MultiCurrencyAccount[]>(DEMO_MULTI_CURRENCY_ACCOUNTS);
  const [isInvestUnlocked, setIsInvestUnlocked] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(['DANGCEM', 'GTCO', 'AIRTELAFRI']);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Synchronize authoritative live balance and transactions from the sandbox backend
   */
  const refreshLiveState = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [balRes, txRes] = await Promise.all([
        apiClient.getWalletBalance('NGN'),
        apiClient.getTransactions(),
      ]);

      if (balRes.success && balRes.data) {
        setBalance((prev) => ({
          accountId: prev?.accountId || 'demo-acct-001',
          available: balRes.data.balanceMinor,
          ledger: balRes.data.balanceMinor + (balRes.data.pendingMinor || 0),
          pending: balRes.data.pendingMinor || 0,
          currency: balRes.data.currency || 'NGN',
          timestamp: new Date().toISOString(),
          demoLabel: balRes.data.label || 'Demo Funds (Simulated)',
        }));
      }

      if (txRes.success && Array.isArray(txRes.data)) {
        const mapped = txRes.data.map((t: any) => mapBackendTxToFrontend(t, account?.id || 'demo-acct-001'));
        setTransactions(mapped);
      }
    } catch (err: any) {
      console.warn('[AppContext] Failed to refresh live state:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [account?.id]);

  /**
   * Helper to set authenticated user and load live backend state
   */
  const syncUserFromBackend = useCallback(async (meData: any) => {
    const initials = `${meData.firstName?.[0] || 'U'}${meData.lastName?.[0] || 'T'}`.toUpperCase();
    const newUser: User = {
      id: meData.id,
      firstName: meData.firstName,
      lastName: meData.lastName,
      email: meData.email || `${meData.phone}@tavi.ng`,
      phoneInput: meData.phone,
      normalizedPhone: meData.phone,
      phoneVerified: true,
      avatarInitials: initials,
      kycStatus: 'verified',
      createdAt: new Date().toISOString(),
      demoTag: meData.demoTag,
      isDemo: true,
    };
    setUser(newUser);

    const newAccount: Account = {
      id: `acct-${meData.id}`,
      userId: meData.id,
      providerAccountNumber: meData.accountNumber || '9920394811',
      expectedPattern: meData.accountNumber || '9920394811',
      providerName: meData.bankName || 'Providus Bank',
      accountName: meData.displayName || `${meData.firstName} ${meData.lastName}`,
      accountType: 'Personal Checking',
      currency: 'NGN',
      provisioningStatus: 'active',
      patternMatchConfirmed: true,
      demoTag: meData.demoTag,
    };
    setAccount(newAccount);

    setIsAuthenticated(true);
    await refreshLiveState();
  }, [refreshLiveState]);

  /**
   * Log in with specific pre-configured demo tester
   */
  const loginAsTester = useCallback(async (tester: 'amara' | 'babajide' | 'chioma'): Promise<boolean> => {
    const creds = {
      amara: { phone: '07030000000', pin: '1234' },
      babajide: { phone: '08020000002', pin: '1234' },
      chioma: { phone: '09030000003', pin: '1234' },
    }[tester];

    try {
      const res = await apiClient.login(creds.phone, creds.pin);
      if (res.success && res.data) {
        await syncUserFromBackend(res.data.user);
        showToast(`Signed in as ${res.data.user.displayName} (Demo Tester)`, 'success');
        return true;
      } else {
        showToast(res.error?.message || 'Login failed', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  }, [syncUserFromBackend, showToast]);

  /**
   * Log in with user credentials
   */
  const loginWithCredentials = useCallback(async (phoneOrEmail: string, passwordOrPin: string) => {
    try {
      const res = await apiClient.login(phoneOrEmail, passwordOrPin);
      if (res.success && res.data) {
        await syncUserFromBackend(res.data.user);
        showToast(`Welcome back, ${res.data.user.displayName}`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [syncUserFromBackend, showToast]);

  /**
   * Register brand new demo tester account
   */
  const registerUser = useCallback(async (data: { phone: string; email?: string; firstName: string; lastName: string; demoTag?: string }) => {
    try {
      const res = await apiClient.register(data);
      if (res.success && res.data) {
        await syncUserFromBackend(res.data.user);
        showToast(`Demo account created! ₦250,000.00 simulated funds granted.`, 'success');
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [syncUserFromBackend, showToast]);

  /**
   * Reset tester demo balance back to factory starting balance
   */
  const resetDemoBalance = useCallback(async () => {
    try {
      const res = await apiClient.resetDemoBalance();
      if (res.success) {
        await refreshLiveState();
        showToast('Demo balance reset to factory ₦250,000.00 successfully.', 'success');
      } else {
        showToast(res.error?.message || 'Failed to reset demo balance', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }, [refreshLiveState, showToast]);

  // Session bootstrap on mount & focus revalidation
  useEffect(() => {
    async function bootstrap() {
      const existingToken = apiClient.getToken();
      if (existingToken) {
        const meRes = await apiClient.getMe();
        if (meRes.success && meRes.data) {
          syncUserFromBackend(meRes.data);
          return;
        }
      }
      // If no valid session exists, initialize default demo session (Tester 1: Amara)
      loginAsTester('amara');
    }
    bootstrap();

    // Auto-refresh when tab gains focus (e.g. tester switched tabs or devices)
    const onFocus = () => {
      refreshLiveState();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((v) => !v);
  }, []);

  const loginDemo = useCallback(() => {
    loginAsTester('amara');
  }, [loginAsTester]);

  const logout = useCallback(() => {
    apiClient.setToken(null);
    setUser(null);
    setAccount(null);
    setIsAuthenticated(false);
    setIsBalanceVisible(true);
    setIsInvestUnlocked(false);
  }, []);

  const setAccountProvisioningStatus = useCallback((status: AccountProvisioningStatus) => {
    setAccount((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        provisioningStatus: status,
        lastProviderCheck: new Date().toISOString(),
      };
    });
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'userId'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
    };
    setReminders((prev) => [newReminder, ...prev]);
  }, [user?.id]);

  const completeReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: true } : r)),
    );
  }, []);

  const addDemoTransaction = useCallback((tx: Omit<Transaction, 'id' | 'accountId'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `txn-demo-${Date.now()}`,
      accountId: account?.id || 'demo-acct-001',
    };
    setTransactions((prev) => [newTx, ...prev]);
    setBalance((prev) => {
      if (!prev) return null;
      const diff = tx.direction === 'credit' ? tx.amountKobo : -tx.amountKobo;
      return {
        ...prev,
        available: Math.max(0, prev.available + diff),
        ledger: Math.max(0, prev.ledger + diff),
        timestamp: new Date().toISOString(),
      };
    });
  }, [account?.id]);

  const addBeneficiary = useCallback((ben: Omit<Beneficiary, 'id' | 'userId'>) => {
    const newBen: Beneficiary = {
      ...ben,
      id: `ben-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
      lastUsed: new Date().toISOString(),
    };
    setBeneficiaries((prev) => [newBen, ...prev]);
  }, [user?.id]);

  const removeBeneficiary = useCallback((id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Investment Security Boundary & Trades
  const unlockInvest = useCallback((pin: string): boolean => {
    if (pin.length === 4) {
      setIsInvestUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const lockInvest = useCallback(() => {
    setIsInvestUnlocked(false);
  }, []);

  const toggleWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  const placeTrade = useCallback((ticker: string, quantity: number, type: 'buy' | 'sell'): boolean => {
    if (!investmentAccount) return false;
    const holding = holdings.find((h) => h.ticker === ticker);
    if (!holding) return false;

    const totalCostKobo = holding.currentPriceKobo * quantity;

    if (type === 'buy') {
      if (investmentAccount.cashAvailableKobo < totalCostKobo) {
        return false;
      }
      setInvestmentAccount((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cashAvailableKobo: prev.cashAvailableKobo - totalCostKobo,
          portfolioValueKobo: prev.portfolioValueKobo + totalCostKobo,
        };
      });
      setHoldings((prev) =>
        prev.map((h) => (h.ticker === ticker ? { ...h, quantity: h.quantity + quantity } : h)),
      );
    } else {
      if (holding.quantity < quantity) {
        return false;
      }
      setInvestmentAccount((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          cashAvailableKobo: prev.cashAvailableKobo + totalCostKobo,
          portfolioValueKobo: Math.max(0, prev.portfolioValueKobo - totalCostKobo),
        };
      });
      setHoldings((prev) =>
        prev.map((h) => (h.ticker === ticker ? { ...h, quantity: h.quantity - quantity } : h)),
      );
    }
    return true;
  }, [investmentAccount, holdings]);

  const redeemGiftCard = useCallback((brand: string, region: string, denomination: number, payoutKobo: number) => {
    const newRedemption: GiftCardRedemption = {
      id: `gc-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
      brand,
      region,
      denomination,
      denominationCurrency: 'USD',
      payoutKobo,
      payoutCurrency: 'NGN',
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reference: `GC${Date.now().toString().slice(-6)}`,
    };
    setGiftCards((prev) => [newRedemption, ...prev]);
  }, [user?.id]);

  const submitGiftCardOffer = useCallback((brand: string, region: string, denomination: number, payoutKobo: number, _cardCode: string): GiftCardRedemption => {
    const newRedemption: GiftCardRedemption = {
      id: `gc-demo-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
      brand,
      region,
      denomination,
      denominationCurrency: 'USD',
      payoutKobo,
      payoutCurrency: 'NGN',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      reference: `GC-DEMO-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setGiftCards((prev) => [newRedemption, ...prev]);
    return newRedemption;
  }, [user?.id]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const createSupportCase = useCallback((category: string, subject: string, description: string, relatedTxRef?: string): SupportCase => {
    const newCase: SupportCase = {
      id: `case-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
      category,
      subject,
      description,
      relatedTxReference: relatedTxRef,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      reference: `TVI-CASE-${Math.floor(10000 + Math.random() * 90000)}`,
      updates: [
        {
          timestamp: new Date().toISOString(),
          author: 'System',
          message: 'Case successfully received. A TAVI support officer is assigned for review.',
        },
      ],
    };
    setSupportCases((prev) => [newCase, ...prev]);
    return newCase;
  }, [user?.id]);

  const createMoneyRequest = useCallback((req: Omit<MoneyRequest, 'id' | 'userId' | 'createdAt' | 'reference'>): MoneyRequest => {
    const newReq: MoneyRequest = {
      ...req,
      id: `req-${Date.now()}`,
      userId: user?.id || 'demo-user-001',
      createdAt: new Date().toISOString(),
      reference: `TVI-REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      shareUrl: `https://tavi.app/pay/req_demo?amt=${req.amountKobo ? (req.amountKobo / 100).toFixed(0) : '0'}`,
    };
    setMoneyRequests((prev) => [newReq, ...prev]);
    return newReq;
  }, [user?.id]);

  const value: AppContextType = {
    appMode: 'demo',
    isAuthenticated,
    isSyncing,
    isBalanceVisible,
    toggleBalanceVisibility,
    user,
    account,
    balance,
    transactions,
    beneficiaries,
    reminders,
    budgets,
    investmentAccount,
    holdings,
    giftCards,
    loginDemo,
    loginAsTester,
    loginWithCredentials,
    registerUser,
    logout,
    refreshLiveState,
    resetDemoBalance,
    setAccountProvisioningStatus,
    addReminder,
    completeReminder,
    addDemoTransaction,
    addBeneficiary,
    removeBeneficiary,
    isInvestUnlocked,
    unlockInvest,
    lockInvest,
    watchlist,
    toggleWatchlist,
    placeTrade,
    redeemGiftCard,
    submitGiftCardOffer,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    supportCases,
    createSupportCase,
    moneyRequests,
    createMoneyRequest,
    multiCurrencyAccounts,
    toasts,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
