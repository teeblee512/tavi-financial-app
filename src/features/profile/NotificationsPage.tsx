import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input } from '../../components/ui';
import type { NotificationCategory } from '../../types';

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const securityAlertsCount = notifications.filter((n) => n.category === 'security' && !n.read).length;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: `Unread (${unreadNotificationsCount})` },
    { id: 'transaction', label: 'Transactions' },
    { id: 'security', label: 'Security' },
    { id: 'bills', label: 'Bills & Payments' },
    { id: 'investments', label: 'Investments' },
    { id: 'account', label: 'Account' },
    { id: 'reminders', label: 'Reminders' },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = search.toLowerCase();
      const matchesSearch =
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.reference && n.reference.toLowerCase().includes(q));

      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'unread') return matchesSearch && !n.read;
      return matchesSearch && n.category === selectedCategory;
    });
  }, [notifications, search, selectedCategory]);

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-14">
      <PageHeader
        title="Notifications Center"
        onBack={() => navigate(-1)}
        rightAction={
          unreadNotificationsCount > 0 ? (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-semibold text-action-green bg-pale-mint px-3.5 py-1.5 rounded-full hover:bg-mint transition-colors"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      <div className="p-5 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        {/* Header Summary Cards (Phase 11 Requirement 3B) */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Alerts</span>
            <span className="text-base font-extrabold text-midnight-navy mt-0.5 block">{notifications.length}</span>
          </div>
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Unread</span>
            <span className="text-base font-extrabold text-action-green mt-0.5 block">{unreadNotificationsCount}</span>
          </div>
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Security Notices</span>
            <span className="text-base font-extrabold text-red-600 mt-0.5 block">{securityAlertsCount}</span>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search notifications by title, details or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Filters (Requirement 3C) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                selectedCategory === c.id
                  ? 'bg-action-green text-white border-action-green shadow-2xs'
                  : 'bg-white text-slate-600 border-border-color hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border border-border-color bg-white">
              <p className="text-slate-500 text-sm font-semibold">No notifications found</p>
              <p className="text-xs text-slate-400">All clear! You are fully up to date with your account activity.</p>
            </Card>
          ) : (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 border transition-all flex items-start gap-3.5 ${
                  !notif.read ? 'border-action-green/40 bg-pale-mint/15 shadow-2xs' : 'border-border-color bg-white'
                }`}
              >
                {/* Category Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    notif.category === 'security'
                      ? 'bg-red-100 text-red-600'
                      : notif.category === 'transaction'
                      ? 'bg-green-100 text-action-green'
                      : notif.category === 'investments'
                      ? 'bg-blue-100 text-blue-700'
                      : notif.category === 'bills'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CategoryIcon category={notif.category} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-midnight-navy truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(notif.timestamp).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                  {notif.reference && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1">Ref: {notif.reference}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-border-color/60 text-xs">
                    {notif.actionUrl && (
                      <button
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          navigate(notif.actionUrl!);
                        }}
                        className="font-bold text-action-green hover:underline flex items-center gap-1"
                      >
                        View Details <span>→</span>
                      </button>
                    )}

                    {!notif.read && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="text-slate-500 hover:text-slate-800 text-[11px]"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-slate-400 hover:text-red-600 text-[11px] ml-auto"
                      title="Dismiss notification"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: NotificationCategory }) {
  if (category === 'security') return <span>🛡️</span>;
  if (category === 'transaction') return <span>💵</span>;
  if (category === 'investments') return <span>📈</span>;
  if (category === 'bills') return <span>⚡</span>;
  if (category === 'reminders') return <span>⏰</span>;
  return <span>🔔</span>;
}
