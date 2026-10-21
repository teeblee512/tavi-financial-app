import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import { MobileShell } from '../components/layout/MobileShell';
import { DesktopShell } from '../components/layout/DesktopShell';
import { ToastContainer } from '../components/ui/ToastContainer';
import { DemoBanner } from '../components/ui/DemoBanner';
import { useWindowWidth } from '../hooks/useWindowWidth';

// Pages
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { LoginPage } from '../features/onboarding/LoginPage';
import { HomePage } from '../features/home/HomePage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { SendMoneyPage } from '../features/payments/SendMoneyPage';
import { AddMoneyPage } from '../features/payments/AddMoneyPage';
import { RequestMoneyPage } from '../features/payments/RequestMoneyPage';
import { BillsPage } from '../features/payments/BillsPage';
import { TransactionsPage } from '../features/transactions/TransactionsPage';
import { TransactionDetailPage } from '../features/transactions/TransactionDetailPage';
import { InvestPage } from '../features/invest/InvestPage';
import { AskAIPage } from '../features/assistant/AskAIPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { AccountDetailsPage } from '../features/accounts/AccountDetailsPage';
import { FXPage } from '../features/fx/FXPage';
import { GiftCardsPage } from '../features/gift-cards/GiftCardsPage';
import { BudgetPage } from '../features/budgeting/BudgetPage';
import { RemindersPage } from '../features/budgeting/RemindersPage';
import { SupportPage } from '../features/profile/SupportPage';
import { SettingsPage } from '../features/profile/SettingsPage';
import { NotificationsPage } from '../features/profile/NotificationsPage';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();
  const width = useWindowWidth();
  const isDesktop = width >= 1024;

  return (
    <>
      <DemoBanner />
      <Routes>
        {/* Public routes */}
        <Route
          path="/onboarding"
          element={isAuthenticated ? <Navigate to="/" replace /> : <OnboardingPage />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGate>
              {isDesktop ? (
                <DesktopShell>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/payments/send" element={<SendMoneyPage />} />
                    <Route path="/payments/add" element={<AddMoneyPage />} />
                    <Route path="/payments/request" element={<RequestMoneyPage />} />
                    <Route path="/payments/bills" element={<BillsPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                    <Route path="/invest" element={<InvestPage />} />
                    <Route path="/ask-ai" element={<AskAIPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/account-details" element={<AccountDetailsPage />} />
                    <Route path="/fx" element={<FXPage />} />
                    <Route path="/gift-cards" element={<GiftCardsPage />} />
                    <Route path="/budget" element={<BudgetPage />} />
                    <Route path="/reminders" element={<RemindersPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </DesktopShell>
              ) : (
                <MobileShell>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/payments/send" element={<SendMoneyPage />} />
                    <Route path="/payments/add" element={<AddMoneyPage />} />
                    <Route path="/payments/request" element={<RequestMoneyPage />} />
                    <Route path="/payments/bills" element={<BillsPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                    <Route path="/invest" element={<InvestPage />} />
                    <Route path="/ask-ai" element={<AskAIPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/account-details" element={<AccountDetailsPage />} />
                    <Route path="/fx" element={<FXPage />} />
                    <Route path="/gift-cards" element={<GiftCardsPage />} />
                    <Route path="/budget" element={<BudgetPage />} />
                    <Route path="/reminders" element={<RemindersPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MobileShell>
              )}
            </AuthGate>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
