import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { formatAccountNumber } from '../../services/phoneUtils';
import { useClipboard } from '../../hooks/useClipboard';
import { PageHeader, Card, Button, InfoBanner, StatusBadge } from '../../components/ui';
import { DemoChip } from '../../components/ui/DemoBanner';
import type { AccountProvisioningStatus } from '../../types';

export function AccountDetailsPage() {
  const { account, user, setAccountProvisioningStatus, showToast } = useApp();
  const { copyToClipboard } = useClipboard();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleCopy = () => {
    if (account?.providerAccountNumber) {
      copyToClipboard(account.providerAccountNumber, 'Account number copied');
    }
  };

  const handleShare = () => {
    if (!account) return;
    const text = [
      `TAVI Account Details:`,
      `Name: ${account.accountName}`,
      `Account Number: ${account.providerAccountNumber}`,
      `Provider: ${account.providerName}`,
      `Currency: ${account.currency}`,
      `Status: ${account.provisioningStatus.toUpperCase()}`,
      '',
      'Note: This is an interactive demo prototype on synthetic data.',
    ].join('\n');

    if (navigator.share) {
      navigator.share({ title: 'My TAVI Account Details', text }).catch(() => {});
    } else {
      copyToClipboard(text, 'Account details copied for sharing');
    }
  };

  const statusConfigs: Record<AccountProvisioningStatus, { badge: string; desc: string; bannerType: 'info' | 'warning' | 'success' | 'error' }> = {
    active: {
      badge: 'Active & Verified',
      desc: 'Account is operational and ready to receive deposits.',
      bannerType: 'success',
    },
    pending: {
      badge: 'Setting up your account…',
      desc: 'Waiting for provider confirmation. Operational number will display once confirmed.',
      bannerType: 'warning',
    },
    conflict: {
      badge: 'Provider Conflict',
      desc: 'This phone-linked number is mapped to an existing profile at the institution.',
      bannerType: 'error',
    },
    failed: {
      badge: 'Provisioning Failed',
      desc: 'We could not confirm your account details yet. Please retry or contact support.',
      bannerType: 'error',
    },
    not_started: {
      badge: 'Not Started',
      desc: 'Onboarding verification not completed.',
      bannerType: 'info',
    },
    suspended: {
      badge: 'Suspended',
      desc: 'Account is temporarily restricted.',
      bannerType: 'error',
    },
  };

  const currentConfig = account ? statusConfigs[account.provisioningStatus] : statusConfigs.not_started;

  const handleSimulateStatus = (st: AccountProvisioningStatus) => {
    setIsSimulating(true);
    setTimeout(() => {
      setAccountProvisioningStatus(st);
      setIsSimulating(false);
      showToast(`Account provisioning status changed to: ${st.toUpperCase()}`, 'info');
    }, 400);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Account Details" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-5 max-w-xl mx-auto w-full">
        {/* Top Notice */}
        <InfoBanner
          type={currentConfig.bannerType}
          message={`Status: ${currentConfig.badge} — ${currentConfig.desc}`}
        />

        {/* Account Details Card */}
        <Card className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Account Identifier</p>
              <h2 className="text-xl font-bold text-midnight-navy mt-0.5">{account?.accountName}</h2>
            </div>
            <DemoChip />
          </div>

          <div className="p-4 bg-input-bg rounded-xl space-y-3">
            <div>
              <span className="text-xs text-slate-500">Phone-Linked Account Number</span>
              <div className="text-2xl font-extrabold tracking-widest text-midnight-navy mt-0.5">
                {account?.provisioningStatus === 'active' 
                  ? formatAccountNumber(account.providerAccountNumber)
                  : account?.provisioningStatus === 'pending'
                  ? '•••• ••• ••• (Setting up)'
                  : 'Unavailable'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border-color">
              <div>
                <span className="text-slate-500">Account Provider</span>
                <p className="font-semibold text-midnight-navy">{account?.providerName}</p>
              </div>
              <div>
                <span className="text-slate-500">Currency</span>
                <p className="font-semibold text-midnight-navy">{account?.currency} (Nigerian Naira)</p>
              </div>
              <div>
                <span className="text-slate-500">Registered Mobile</span>
                <p className="font-semibold text-midnight-navy">{user?.normalizedPhone || '+2347074100290'}</p>
              </div>
              <div>
                <span className="text-slate-500">Mapping Rule</span>
                <p className="font-semibold text-action-green">07074100290 → 7074100290</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleCopy}
              disabled={account?.provisioningStatus !== 'active'}
            >
              Copy Number
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={handleShare}
            >
              Share Details
            </Button>
          </div>
        </Card>

        {/* Interactive Provider State Switcher (Mandated by Section 5 & Phase B) */}
        <Card className="p-5 space-y-3 border-2 border-pale-mint">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-midnight-navy">Simulate Account Provisioning States</h3>
            <span className="text-[10px] bg-pale-mint text-primary-green px-2 py-0.5 rounded-full font-bold">
              QA Test Panel
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Per the Master Product Spec, test how TAVI reacts to provider confirmation, ongoing setup, conflict, or failure:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleSimulateStatus('active')}
              disabled={isSimulating}
              className={`p-2.5 rounded-btn text-xs font-semibold text-left border transition-all ${
                account?.provisioningStatus === 'active'
                  ? 'bg-action-green text-white border-action-green shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-border-color text-slate-700'
              }`}
            >
              🟢 Active (Confirmed)
              <p className="text-[10px] opacity-80 font-normal">Normal operational account</p>
            </button>

            <button
              onClick={() => handleSimulateStatus('pending')}
              disabled={isSimulating}
              className={`p-2.5 rounded-btn text-xs font-semibold text-left border transition-all ${
                account?.provisioningStatus === 'pending'
                  ? 'bg-warning text-white border-warning shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-border-color text-slate-700'
              }`}
            >
              🟡 Pending Setup
              <p className="text-[10px] opacity-80 font-normal">Provider creation underway</p>
            </button>

            <button
              onClick={() => handleSimulateStatus('conflict')}
              disabled={isSimulating}
              className={`p-2.5 rounded-btn text-xs font-semibold text-left border transition-all ${
                account?.provisioningStatus === 'conflict'
                  ? 'bg-error text-white border-error shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-border-color text-slate-700'
              }`}
            >
              🔴 Mapping Conflict
              <p className="text-[10px] opacity-80 font-normal">Assigned to another identity</p>
            </button>

            <button
              onClick={() => handleSimulateStatus('failed')}
              disabled={isSimulating}
              className={`p-2.5 rounded-btn text-xs font-semibold text-left border transition-all ${
                account?.provisioningStatus === 'failed'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-border-color text-slate-700'
              }`}
            >
              ⚪ Setup Failed
              <p className="text-[10px] opacity-80 font-normal">Provider service error</p>
            </button>
          </div>
        </Card>

        {/* Regulatory & Architecture Disclosures */}
        <div className="p-4 bg-slate-100 rounded-card text-xs text-slate-600 space-y-1.5">
          <h4 className="font-semibold text-midnight-navy">Architectural Safeguards (Rule 5.3):</h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
            <li>Never creates an unverified account number by blindly truncating digits.</li>
            <li>Authoritative mapping is verified against the licensed partner institution.</li>
            <li>In production, funds cannot be directed until the provider emits an operational webhook confirmation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
