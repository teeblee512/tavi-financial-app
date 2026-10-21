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
} from '../data/demoData';

// ─── App Context Type ─────────────────────────────────────────────────────────
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
  // Reminders
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId'>) => void;
  completeReminder: (id: string) => void;
  // Transactions (demo — adds a simulated transaction)
  addDemoTransaction: (tx: Omit<Transaction, 'id' | 'accountId'>) => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [balance] = useState<BalanceSnapshot | null>(DEMO_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [beneficiaries] = useState<Beneficiary[]>(DEMO_BENEFICIARIES);
  const [reminders, setReminders] = useState<Reminder[]>(DEMO_REMINDERS);
  const [budgets] = useState<Budget[]>(DEMO_BUDGETS);
  const [investmentAccount] = useState<InvestmentAccount | null>(DEMO_INVESTMENT_ACCOUNT);
  const [holdings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [giftCards] = useState<GiftCardRedemption[]>(DEMO_GIFT_CARDS);
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
    addReminder,
    completeReminder,
    addDemoTransaction,
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
