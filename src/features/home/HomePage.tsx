import { useState } from 'react';
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
  const { user, account, balance, transactions, isBalanceVisible, toggleBalanceVisibility, reminders } = useApp();
  const { copyToClipboard } = useClipboard();
  const navigate = useNavigate();

  const recentTransactions = transactions.slice(0, 5);
  const upcomingReminders = reminders.filter((r) => !r.completed).slice(0, 2);

  const handleCopyAccount = () => {
    if (account?.providerAccountNumber) {
      copyToClipboard(account.providerAccountNumber, 'Account number copied');
    }
  };

  const handleShare = () => {
    if (!account) return;
    const text = `Account Name: ${account.accountName}\nAccount Number: ${account.providerAccountNumber}\nBank: ${account.providerName} (DEMO — not a real bank account)`;
    if (navigator.share) {
      navigator.share({ title: 'My TAVI Account Details', text });
    } else {
      copyToClipboard(text, 'Account details copied');
    }
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      {/* ─── Header ─── */}
      <header className="bg-deep-emerald px-5 pt-5 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TaviLogo size={24} variant="white" />
              <DemoChip />
            </div>
            <p className="text-white/60 text-xs">{getGreeting(user?.firstName || 'there')}</p>
            <h1 className="text-white text-lg font-bold mt-0.5">
              {user?.firstName} {user?.lastName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Notifications"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-action-green text-white font-bold text-sm"
              aria-label="Profile"
            >
              {user?.avatarInitials || 'AO'}
            </button>
          </div>
        </div>

        {/* ─── Balance Card ─── */}
        <div className="mt-5 bg-white/10 rounded-hero p-4 border border-white/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs font-medium uppercase tracking-wide">Available Balance</span>
            <button
              onClick={toggleBalanceVisibility}
              className="text-white/70 hover:text-white p-1"
              aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {isBalanceVisible ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <div className="balance-amount text-white">
            {isBalanceVisible ? formatNaira(balance?.available || 0) : '₦ ••••••'}
          </div>
          {balance && (
            <p className="text-white/50 text-xs mt-1">
              {formatNaira(balance.pending)} pending
            </p>
          )}
        </div>
      </header>

      {/* ─── Account Card ─── */}
      <div className="px-5 -mt-3 relative z-10">
        <div className="card p-4 shadow-md">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-slate-500 font-medium">My account details</p>
              <p className="text-sm font-semibold text-midnight-navy mt-0.5">
                {account?.accountName || 'DEMO ACCOUNT'}
              </p>
            </div>
            <DemoChip />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{account?.providerName}</p>
              <span className="account-number">
                {account ? formatAccountNumber(account.providerAccountNumber) : '0000 000 000'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-icon bg-pale-mint text-action-green text-xs font-semibold hover:bg-mint transition-colors"
                aria-label="Copy account number"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-icon bg-pale-mint text-action-green text-xs font-semibold hover:bg-mint transition-colors"
                aria-label="Share account details"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate('/account-details')}
            className="mt-3 text-action-green text-xs font-medium hover:underline"
          >
            View account details →
          </button>
        </div>
      </div>

      {/* ─── Primary Actions ─── */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Send', icon: 'send', to: '/payments/send' },
            { label: 'Add Money', icon: 'add', to: '/payments/add' },
            { label: 'Request', icon: 'request', to: '/payments/request' },
            { label: 'History', icon: 'history', to: '/transactions' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="action-tile"
              aria-label={action.label}
            >
              <div className="action-tile-icon">
                <ActionIcon name={action.icon} />
              </div>
              <span className="text-[11px] font-medium text-slate-600 text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Dashboard Carousel ─── */}
      <div className="mt-6">
        <DashboardCarousel />
      </div>

      {/* ─── AI Assistant Card ─── */}
      <div className="px-5 mt-5">
        <button
          onClick={() => navigate('/ask-ai')}
          className="w-full card p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-pale-mint"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-icon bg-gradient-to-br from-primary-green to-action-green flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-midnight-navy text-sm">Ask TAVI</p>
              <p className="text-xs text-slate-500">Your AI financial assistant</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Find my last transfer to Ada',
              'How much did I spend this month?',
              'Remind me to pay rent',
            ].map((prompt) => (
              <span key={prompt} className="text-xs bg-pale-mint text-primary-green px-2.5 py-1 rounded-pill font-medium">
                {prompt}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* ─── Recent Transactions ─── */}
      <div className="px-5 mt-6 mb-6">
        <SectionHeader
          title="Recent activity"
          action={
            <button onClick={() => navigate('/transactions')} className="text-action-green text-sm font-medium hover:underline">
              See all
            </button>
          }
        />
        <div className="card overflow-hidden">
          {recentTransactions.length === 0 ? (
            <EmptyState title="No transactions yet" description="Your recent activity will appear here." />
          ) : (
            recentTransactions.map((tx) => (
              <button
                key={tx.id}
                className="tx-row w-full text-left"
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-icon flex items-center justify-center flex-shrink-0 ${tx.direction === 'credit' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  <TxIcon category={tx.category} direction={tx.direction} />
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-midnight-navy truncate">{tx.counterpartyName}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {CATEGORY_LABELS[tx.category]} · {formatTransactionDate(tx.timestamp)}
                  </p>
                </div>
                {/* Amount + status */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${tx.direction === 'debit' ? 'amount-debit' : 'amount-credit'}`}>
                    {tx.direction === 'debit' ? '-' : '+'}{formatNaira(tx.amountKobo)}
                  </p>
                  {tx.status !== 'successful' && (
                    <StatusBadge status={tx.status} />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Upcoming Reminders ─── */}
      {upcomingReminders.length > 0 && (
        <div className="px-5 mb-6">
          <SectionHeader
            title="Upcoming"
            action={
              <button onClick={() => navigate('/reminders')} className="text-action-green text-sm font-medium hover:underline">
                All reminders
              </button>
            }
          />
          <div className="flex flex-col gap-2">
            {upcomingReminders.map((rem) => (
              <div key={rem.id} className="card p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-icon flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B45309" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-midnight-navy truncate">{rem.title}</p>
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
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12m0 0l-6-6m6 6l-6 6" />
      </svg>
    ),
    add: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    request: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m0 0l6-6m-6 6l6 6" />
      </svg>
    ),
    history: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  };
  return icons[name] || <span />;
}

function TxIcon({ category, direction }: { category: string; direction: string }) {
  const color = direction === 'credit' ? '#15803D' : '#475569';
  if (category === 'airtime' || category === 'data') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5" />
      </svg>
    );
  }
  if (category === 'electricity') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B45309" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    );
  }
  if (direction === 'credit') {
    return (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0-16l-4 4m4-4l4 4" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m0 16l-4-4m4 4l4-4" />
    </svg>
  );
}
