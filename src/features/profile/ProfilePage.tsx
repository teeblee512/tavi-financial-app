import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button } from '../../components/ui';
import { DemoChip } from '../../components/ui/DemoBanner';
import { formatAccountNumber } from '../../services/phoneUtils';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, account, logout, showToast } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(`${user?.firstName || 'Amara'} ${user?.lastName || 'Okonkwo'}`);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    showToast('Profile updated successfully (Demo)', 'success');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-14">
      <PageHeader title="Profile & Account Center" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {/* Profile Header Card (Phase 10 Section 3A) */}
        <Card className="p-5 border border-border-color bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-green to-action-green rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              {user?.avatarInitials || 'AO'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-midnight-navy truncate">
                  {displayName}
                </h3>
                <DemoChip />
              </div>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-action-green bg-pale-mint px-2 py-0.5 rounded">
                  {user?.normalizedPhone ? user.normalizedPhone.slice(0, 7) + '••••' : '+234 707 •••• 290'}
                </span>
                <span className="text-[10px] bg-green-100 text-primary-green font-bold px-2 py-0.5 rounded-full uppercase">
                  Tier 3 Verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border-color">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/account-details')}
            >
              View Account Details
            </Button>
          </div>

          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="pt-3 border-t space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <Button variant="primary" fullWidth type="submit">
                Save Changes (Demo)
              </Button>
            </form>
          )}
        </Card>

        {/* Account Status Summary (Section 3B) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">KYC Status</span>
            <span className="text-xs font-bold text-action-green mt-0.5 block">Verified (Tier 3)</span>
          </div>
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Account</span>
            <span className="text-xs font-mono font-bold text-midnight-navy mt-0.5 block">
              {formatAccountNumber(account?.providerAccountNumber || '7074100290')}
            </span>
          </div>
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Country</span>
            <span className="text-xs font-bold text-midnight-navy mt-0.5 block">Nigeria (NG)</span>
          </div>
          <div className="card p-3 bg-white border border-border-color">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Security</span>
            <span className="text-xs font-bold text-action-green mt-0.5 block">2FA & PIN Active</span>
          </div>
        </div>

        {/* Grouped Account Navigation (Phase 10 Section 3D) */}
        <div className="space-y-4">
          {/* MY ACCOUNT */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              My Account
            </span>
            <Card className="divide-y divide-border-color bg-white border border-border-color overflow-hidden shadow-2xs">
              {[
                { label: 'Account Details', desc: 'Nigerian NUBAN receiving details & provider info', path: '/account-details' },
                { label: 'Verification & Limits', desc: 'Tier 3 status and ₦5,000,000 daily limit', path: '/settings' },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-midnight-navy">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
              ))}
            </Card>
          </div>

          {/* MONEY MANAGEMENT */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Money Management
            </span>
            <Card className="divide-y divide-border-color bg-white border border-border-color overflow-hidden shadow-2xs">
              {[
                { label: 'Budget & Analytics', desc: 'Spending limits, monthly pacing and category breakdowns', path: '/budget' },
                { label: 'Reminders & Schedules', desc: 'Upcoming rent, subscriptions, and recurring payments', path: '/reminders' },
                { label: 'FX & Foreign Currency', desc: 'Multi-currency accounts (USD, GBP, EUR) and conversions', path: '/fx' },
                { label: 'Gift Card Trading Desk', desc: 'Sell supported gift cards for prompt Naira credit', path: '/gift-cards' },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-midnight-navy">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
              ))}
            </Card>
          </div>

          {/* PREFERENCES & SECURITY */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Security & Preferences
            </span>
            <Card className="divide-y divide-border-color bg-white border border-border-color overflow-hidden shadow-2xs">
              {[
                { label: 'Notifications Center', desc: 'Review transactional, security and bill alerts', path: '/notifications' },
                { label: 'Security & PIN Center', desc: 'Biometric sign-in, transaction PIN, and 2FA', path: '/settings' },
                { label: 'Support & Help Hub', desc: 'File transaction dispute traces or talk with support', path: '/support' },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-midnight-navy">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
              ))}
            </Card>
          </div>

          {/* ACCOUNT ACTIONS */}
          <div className="pt-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign Out of TAVI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
