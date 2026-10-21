import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button } from '../../components/ui';
import { DemoChip } from '../../components/ui/DemoBanner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const links = [
    { label: 'Account Details', desc: 'Phone-linked account & bank details', path: '/account-details' },
    { label: 'Budget & Analytics', desc: 'Spending limits and category insights', path: '/budget' },
    { label: 'Reminders & Schedules', desc: 'Upcoming bills and subscriptions', path: '/reminders' },
    { label: 'FX & Foreign Currency', desc: 'Real-time conversion & quotes', path: '/fx' },
    { label: 'Gift Cards', desc: 'Redeem supported cards for naira', path: '/gift-cards' },
    { label: 'Notifications', desc: 'Alerts and transaction notices', path: '/notifications' },
    { label: 'Support & Help Center', desc: 'Get assistance or report issues', path: '/support' },
    { label: 'Security & Settings', desc: 'App limits, biometric & PIN', path: '/settings' },
  ];

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Profile" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* User Card */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-action-green rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.avatarInitials || 'AO'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-midnight-navy">{user?.firstName} {user?.lastName}</h3>
              <DemoChip />
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs font-mono text-action-green font-semibold mt-0.5">{user?.normalizedPhone}</p>
          </div>
        </Card>

        {/* Links */}
        <Card className="divide-y divide-border-color overflow-hidden">
          {links.map((link) => (
            <div
              key={link.label}
              onClick={() => navigate(link.path)}
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div>
                <h4 className="text-sm font-semibold text-midnight-navy">{link.label}</h4>
                <p className="text-xs text-slate-400">{link.desc}</p>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          ))}
        </Card>

        <Button variant="danger" fullWidth onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
