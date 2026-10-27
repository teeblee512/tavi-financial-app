import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { formatNaira, formatTransactionDate, getGreeting, CATEGORY_LABELS } from '../../services/formatters';
import { formatAccountNumber } from '../../services/phoneUtils';
import { useClipboard } from '../../hooks/useClipboard';
import { Card, SectionHeader, StatusBadge, EmptyState } from '../../components/ui';
import { DemoChip } from '../../components/ui/DemoBanner';
import { TaviLogo } from '../../components/ui/TaviLogo';
import { DashboardCarousel } from './DashboardCarousel';

export function HomePage() {
  const { user, account, balance, transactions, isBalanceVisible, toggleBalanceVisibility, reminders, unreadNotificationsCount } = useApp();
  const { copyToClipboard } = useClipboard();
  const navigate = useNavigate();
  const [askQuery, setAskQuery] = useState('');

  const recentTransactions = transactions.slice(0, 5);
  const upcomingReminders = reminders.filter((r) => !r.completed).slice(0, 2);

  const handleCopyAccount = () => {
    if (account?.providerAccountNumber) {
      copyToClipboard(account.providerAccountNumber, 'Account number copied to clipboard');
    }
  };

  const handleShare = () => {
    if (!account) return;
    const text = `TAVI Demo Account\nName: ${account.accountName}\nAccount No: ${account.providerAccountNumber}\nBank: ${account.providerName}\n(Simulated demo account for evaluation)`;
    if (navigator.share) {
      navigator.share({ title: 'My TAVI Account Details', text }).catch(() => {});
    } else {
      copyToClipboard(text, 'Account details copied for sharing');
    }
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) {
      navigate('/ask-ai');
    } else {
      navigate('/ask-ai', { state: { initialPrompt: askQuery.trim() } });
    }
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-8">
      {/* ─── Compact Emerald Hero ─── */}
      <header className="bg-deep-emerald px-5 pt-4 pb-5 rounded-b-hero">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TaviLogo size={28} variant="white" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-base tracking-tight">TAVI</span>
                <DemoChip />
              </div>
              <p className="text-white/70 text-xs">{getGreeting(user?.firstName || 'there')}, {user?.firstName}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Notifications"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-action-green text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
              aria-label="Profile"
            >
              {user?.avatarInitials || 'AO'}
            </button>
          </div>
        </div>

        {/* ─── Balance Hero Section ─── */}
        <div className="mt-4 bg-white/10 rounded-hero p-4 border border-white/15 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/75 text-xs font-semibold uppercase tracking-wider">Available Balance</span>
            <button
              onClick={toggleBalanceVisibility}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
              aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {isBalanceVisible ? (
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <div className="balance-amount text-white text-3xl font-extrabold tracking-tight">
            {isBalanceVisible ? formatNaira(balance?.available || 0) : '₦ ••••••'}
          </div>
          {balance && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-white/60 text-xs">
                {formatNaira(balance.pending)} pending verification
              </span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-mint text-xs font-medium">Active Ledger</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── Seamless Account Details Card ─── */}
      <div className="px-5 -mt-2 relative z-10">
        <div className="card p-4 shadow-sm border border-border-color bg-white">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Account Details</p>
              <p className="text-sm font-bold text-midnight-navy mt-0.5">
                {account?.accountName || 'DEMO ACCOUNT'}
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
              Demo Bank
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">{account?.providerName || 'TAVI Demo Bank'}</p>
              <span className="account-number font-mono text-base font-bold text-midnight-navy tracking-wider">
                {account ? formatAccountNumber(account.providerAccountNumber) : '7074 100 290'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1 px-3 py-1.5 rounded-icon bg-pale-mint text-action-green text-xs font-semibold hover:bg-mint transition-colors"
                aria-label="Copy account number"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-icon bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                aria-label="Share account details"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Primary Action Tiles ─── */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'Send', icon: 'send', to: '/payments/send' },
            { label: 'Add Money', icon: 'add', to: '/payments/add' },
            { label: 'Request', icon: 'request', to: '/payments/request' },
            { label: 'History', icon: 'history', to: '/transactions' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="action-tile group hover:border-action-green/30 transition-all min-h-[58px]"
              aria-label={action.label}
            >
              <div className="action-tile-icon group-hover:bg-pale-mint transition-colors">
                <ActionIcon name={action.icon} />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Financial Highlights Cards (Phase 2A) ─── */}
      <div className="mt-5">
        <DashboardCarousel />
      </div>

      {/* ─── Refined Ask TAVI Card with Search Placeholder (Phase 2A & 7) ─── */}
      <div className="px-5 mt-4">
        <div className="card p-4 border border-border-color bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-8 h-8 rounded-icon bg-gradient-to-br from-primary-green to-action-green flex items-center justify-center text-white">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-midnight-navy text-sm">Ask TAVI</p>
              <p className="text-[11px] text-slate-500">Your context-aware financial copilot</p>
            </div>
            <button
              onClick={() => navigate('/ask-ai')}
              className="text-xs font-semibold text-action-green hover:underline"
            >
              Full Workspace →
            </button>
          </div>

          <form onSubmit={handleAskSubmit} className="relative mb-2.5">
            <input
              type="text"
              placeholder="Ask about your money, transfers, or spending…"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              className="w-full text-xs py-2.5 pl-3 pr-10 rounded-xl bg-input-bg border border-border-color text-midnight-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-action-green/30"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-action-green hover:opacity-80"
              aria-label="Submit question"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Transactions with Ada Chukwu',
              'Total spent this month',
              'How to sell a gift card',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => navigate('/ask-ai', { state: { initialPrompt: prompt } })}
                className="text-[11px] bg-pale-mint/70 hover:bg-pale-mint text-primary-green px-2.5 py-1 rounded-full font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Activity (Consistent Relative Dates & Statuses) ─── */}
      <div className="px-5 mt-5">
        <SectionHeader
          title="Recent Activity"
          action={
            <button onClick={() => navigate('/transactions')} className="text-action-green text-xs font-bold hover:underline">
              See all
            </button>
          }
        />
        <div className="card overflow-hidden divide-y divide-border-color">
          {recentTransactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Your recent activity will appear here." />
          ) : (
            recentTransactions.map((tx) => (
              <button
                key={tx.id}
                className="tx-row w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3"
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                <div className={`w-9 h-9 rounded-icon flex items-center justify-center flex-shrink-0 ${tx.direction === 'credit' ? 'bg-green-100 text-action-green' : 'bg-slate-100 text-slate-600'}`}>
                  <TxIcon category={tx.category} direction={tx.direction} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-midnight-navy truncate">{tx.counterpartyName}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {CATEGORY_LABELS[tx.category]} · {formatTransactionDate(tx.timestamp)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.direction === 'debit' ? 'amount-debit text-midnight-navy' : 'amount-credit text-action-green'}`}>
                    {tx.direction === 'debit' ? '-' : '+'}{formatNaira(tx.amountKobo)}
                  </p>
                  {tx.status !== 'successful' && (
                    <div className="mt-0.5">
                      <StatusBadge status={tx.status} />
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Upcoming Reminders ─── */}
      {upcomingReminders.length > 0 && (
        <div className="px-5 mt-5">
          <SectionHeader
            title="Upcoming Reminders"
            action={
              <button onClick={() => navigate('/reminders')} className="text-action-green text-xs font-bold hover:underline">
                All reminders
              </button>
            }
          />
          <div className="flex flex-col gap-2">
            {upcomingReminders.map((rem) => (
              <div key={rem.id} className="card p-3 flex items-center gap-3 border border-border-color">
                <div className="w-8 h-8 bg-amber-100 rounded-icon flex items-center justify-center flex-shrink-0 text-amber-700">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-midnight-navy truncate">{rem.title}</p>
                  <p className="text-xs text-slate-400">
                    {rem.amountKobo ? formatNaira(rem.amountKobo) + ' · ' : ''}
                    Due {new Date(rem.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    send: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12m0 0l-6-6m6 6l-6 6" />
      </svg>
    ),
    add: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    request: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m0 0l6-6m-6 6l6 6" />
      </svg>
    ),
    history: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  };
  return icons[name] || <span />;
}

function TxIcon({ category, direction }: { category: string; direction: string }) {
  if (direction === 'credit') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}
