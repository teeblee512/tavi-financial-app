import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { TaviLogo } from '../ui/TaviLogo';
import { useApp } from '../../app/AppContext';
import { DemoChip } from '../ui/DemoBanner';

interface DesktopShellProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS = [
  { label: 'Home', to: '/', icon: 'home' },
  { label: 'Payments', to: '/payments', icon: 'payments' },
  { label: 'Transactions', to: '/transactions', icon: 'transactions' },
  { label: 'Invest', to: '/invest', icon: 'invest' },
  { label: 'FX', to: '/fx', icon: 'fx' },
  { label: 'Gift Cards', to: '/gift-cards', icon: 'gift' },
  { label: 'Ask AI', to: '/ask-ai', icon: 'ai' },
  { label: 'Support', to: '/support', icon: 'support' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
  { label: 'Public Website', to: '/landing', icon: 'website' },
];

function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#059669' : '#94A3B8';
  const icons: Record<string, JSX.Element> = {
    home: (
      <svg width="20" height="20" fill={active ? color : 'none'} viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
      </svg>
    ),
    payments: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M2 10h20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h4" />
      </svg>
    ),
    transactions: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
    invest: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <polyline strokeLinecap="round" strokeLinejoin="round" points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="16 7 22 7 22 13" />
      </svg>
    ),
    fx: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
    gift: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
    ai: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    support: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
    settings: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    website: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  };
  return icons[name] || <span />;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  // Top Bar Dropdowns
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sidebarWidth = sidebarExpanded ? 248 : 76;
  const recentNotifs = notifications.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-app-bg" style={{ paddingTop: '24px' }}>
      {/* Sidebar */}
      <aside
        className="sidebar flex flex-col"
        style={{ width: sidebarWidth }}
        aria-label="Main sidebar"
      >
        {/* Logo */}
        <div className="flex items-center h-[72px] px-4 border-b border-white/10">
          <TaviLogo size={32} variant="white" />
          {sidebarExpanded && (
            <span className="ml-2.5 text-white font-bold text-xl tracking-tight">TAVI</span>
          )}
          <button
            className="ml-auto text-white/60 hover:text-white p-1"
            onClick={() => setSidebarExpanded((v) => !v)}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Sidebar navigation">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-card transition-colors duration-150 mb-0.5',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <SidebarIcon name={item.icon} active={isActive} />
                {sidebarExpanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User area */}
        <div className="border-t border-white/10 p-3">
          <div className={clsx('flex items-center gap-2', sidebarExpanded ? 'px-1' : 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-action-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatarInitials || 'AO'}
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <DemoChip />
              </div>
            )}
          </div>
          {sidebarExpanded && (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="mt-3 w-full text-white/60 hover:text-white text-xs py-1.5 rounded-card hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        {/* Top bar with Dropdowns */}
        <header className="sticky top-6 z-30 bg-white border-b border-border-color h-[72px] flex items-center px-8 gap-4 shadow-2xs">
          <div className="flex-1" />

          <NavLink to="/landing" className="text-xs font-semibold text-action-green bg-pale-mint px-3.5 py-1.5 rounded-full hover:bg-mint transition-colors">
            Public Website ↗
          </NavLink>

          {/* Notification Bell Dropdown (Phase 11 Requirement 2) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center text-slate-600"
              aria-label="Open notifications dropdown"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-border-color rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="p-3.5 border-b border-border-color flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-midnight-navy text-xs">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] bg-pale-mint text-primary-green px-1.5 py-0.2 rounded font-bold">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-action-green font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-border-color max-h-[300px] overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.actionUrl) {
                            navigate(n.actionUrl);
                            setNotifDropdownOpen(false);
                          }
                        }}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                          !n.read ? 'bg-pale-mint/15' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-midnight-navy truncate">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-action-green ml-1 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-border-color bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      navigate('/notifications');
                    }}
                    className="text-xs font-bold text-action-green hover:underline"
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown (Phase 10 Section 9) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 hover:bg-slate-50 rounded-card px-2.5 py-1.5 transition-colors"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-action-green flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                {user?.avatarInitials || 'AO'}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {user?.firstName}
              </span>
              <span className="text-slate-400 text-xs">▼</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-border-color rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
                {/* User Card */}
                <div className="p-4 border-b border-border-color bg-slate-50">
                  <p className="font-extrabold text-sm text-midnight-navy">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] bg-green-100 text-action-green font-bold px-2 py-0.5 rounded-full uppercase">
                      Tier 3 Verified
                    </span>
                    <DemoChip />
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="p-2 space-y-0.5 text-xs text-slate-700">
                  {[
                    { label: 'View Profile', path: '/profile' },
                    { label: 'Account Details', path: '/account-details' },
                    { label: 'Security & Settings', path: '/settings' },
                    { label: 'Notifications Center', path: '/notifications' },
                    { label: 'Support & Help Hub', path: '/support' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors font-medium flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-border-color">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-xs"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 max-w-[1280px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
