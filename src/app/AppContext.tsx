import React, { createContext, useContext, useState, useCallback } from 'react';
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

interface AppContextType {
  appMode: AppMode;
  isAuthenticated: boolean;
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
  // Auth
  loginDemo: () => void;
  logout: () => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to authenticated for instant preview
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

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((v) => !v);
  }, []);

  const loginDemo = useCallback(() => {
    setUser(DEMO_USER);
    setAccount(DEMO_ACCOUNT);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
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
      userId: 'demo-user-001',
    };
    setReminders((prev) => [newReminder, ...prev]);
  }, []);

  const completeReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: true } : r)),
    );
  }, []);

  const addDemoTransaction = useCallback((tx: Omit<Transaction, 'id' | 'accountId'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `txn-demo-${Date.now()}`,
      accountId: 'demo-acct-001',
    };
    setTransactions((prev) => [newTx, ...prev]);
    // update balance
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
  }, []);

  const addBeneficiary = useCallback((ben: Omit<Beneficiary, 'id' | 'userId'>) => {
    const newBen: Beneficiary = {
      ...ben,
      id: `ben-${Date.now()}`,
      userId: 'demo-user-001',
      lastUsed: new Date().toISOString(),
    };
    setBeneficiaries((prev) => [newBen, ...prev]);
  }, []);

  const removeBeneficiary = useCallback((id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Investment Security Boundary & Trades
  const unlockInvest = useCallback((pin: string): boolean => {
    // Demo accept 4-digit PIN
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

  // Gift Card redemption (Legacy direct helper)
  const redeemGiftCard = useCallback((brand: string, region: string, denomination: number, payoutKobo: number) => {
    const newRedemption: GiftCardRedemption = {
      id: `gc-${Date.now()}`,
      userId: 'demo-user-001',
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
  }, []);

  // Safe Multi-stage Gift Card Offer Submission (Phase 6)
  const submitGiftCardOffer = useCallback((brand: string, region: string, denomination: number, payoutKobo: number, _cardCode: string): GiftCardRedemption => {
    const newRedemption: GiftCardRedemption = {
      id: `gc-demo-${Date.now()}`,
      userId: 'demo-user-001',
      brand,
      region,
      denomination,
      denominationCurrency: 'USD',
      payoutKobo,
      payoutCurrency: 'NGN',
      status: 'under_review', // Non-instant: enters review queue
      submittedAt: new Date().toISOString(),
      reference: `GC-DEMO-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setGiftCards((prev) => [newRedemption, ...prev]);
    return newRedemption;
  }, []);

  // Notifications (Phase 11)
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

  // Support Cases (Phase 8)
  const createSupportCase = useCallback((category: string, subject: string, description: string, relatedTxRef?: string): SupportCase => {
    const newCase: SupportCase = {
      id: `case-${Date.now()}`,
      userId: 'demo-user-001',
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
  }, []);

  // Money Requests (Phase 3)
  const createMoneyRequest = useCallback((req: Omit<MoneyRequest, 'id' | 'userId' | 'createdAt' | 'reference'>): MoneyRequest => {
    const newReq: MoneyRequest = {
      ...req,
      id: `req-${Date.now()}`,
      userId: 'demo-user-001',
      createdAt: new Date().toISOString(),
      reference: `TVI-REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      shareUrl: `https://tavi.app/pay/req_demo?amt=${req.amountKobo ? (req.amountKobo / 100).toFixed(0) : '0'}`,
    };
    setMoneyRequests((prev) => [newReq, ...prev]);
    return newReq;
  }, []);

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

  const value: AppContextType = {
    appMode: 'demo',
    isAuthenticated,
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
    logout,
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

