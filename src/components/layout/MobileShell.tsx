import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface MobileShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: 'Home',
    to: '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill={active ? '#059669' : 'none'} viewBox="0 0 24 24" stroke={active ? '#059669' : '#94A3B8'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: 'Payments',
    to: '/payments',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#059669' : '#94A3B8'} strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" />
        <path strokeLinecap="round" d="M2 10h20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 15h4" />
      </svg>
    ),
  },
  {
    label: 'Invest',
    to: '/invest',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#059669' : '#94A3B8'} strokeWidth={2}>
        <polyline strokeLinecap="round" strokeLinejoin="round" points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    label: 'Ask AI',
    to: '/ask-ai',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#059669' : '#94A3B8'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#059669' : '#94A3B8'} strokeWidth={2}>
        <circle cx="12" cy="8" r="4" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function MobileShell({ children }: MobileShellProps) {
  const location = useLocation();

  // Some pages are full-screen (e.g. Send Money) — hide bottom nav
  const hideBottomNav = ['/payments/send', '/payments/add', '/payments/request'].includes(location.pathname);

  return (
    <div className="page-container min-h-screen bg-app-bg" style={{ paddingTop: '24px' }}>
      {/* Main content */}
      <main
        className="overflow-y-auto"
        style={{
          minHeight: `calc(100vh - 24px - ${hideBottomNav ? '0px' : '72px'})`,
          paddingBottom: hideBottomNav ? 0 : '80px',
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav
          className="bottom-nav"
          aria-label="Main navigation"
        >
          <div className="flex items-stretch h-[68px]">
            {NAV_ITEMS.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150',
                    'min-w-[44px] min-h-[44px]',
                    isActive ? 'text-action-green' : 'text-slate-400',
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon(isActive)}
                  <span className={clsx('text-[10px] font-medium', isActive ? 'text-action-green' : 'text-slate-400')}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
          {/* Safe area spacer */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0)' }} />
        </nav>
      )}
    </div>
  );
}
