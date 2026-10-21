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
  // Investment Trades
  placeTrade: (ticker: string, quantity: number, type: 'buy' | 'sell') => boolean;
  // Gift Card redemption
  redeemGiftCard: (brand: string, region: string, denomination: number, payoutKobo: number) => void;
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
  const [budgets, setBudgets] = useState<Budget[]>(DEMO_BUDGETS);
  const [investmentAccount, setInvestmentAccount] = useState<InvestmentAccount | null>(DEMO_INVESTMENT_ACCOUNT);
  const [holdings, setHoldings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [giftCards, setGiftCards] = useState<GiftCardRedemption[]>(DEMO_GIFT_CARDS);
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
    addDemoTransaction({
      direction: 'credit',
      amountKobo: payoutKobo,
      feeKobo: 0,
      currency: 'NGN',
      status: 'successful',
      category: 'gift_card',
      counterpartyName: `${brand} Gift Card Redemption`,
      narration: `Payout for $${denomination} ${brand} card`,
      reference: newRedemption.reference,
      timestamp: new Date().toISOString(),
    });
  }, [addDemoTransaction]);

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
    placeTrade,
    redeemGiftCard,
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
