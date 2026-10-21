import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { formatAccountNumber } from '../../services/phoneUtils';
import { formatNaira } from '../../services/formatters';
import { useClipboard } from '../../hooks/useClipboard';
import { PageHeader, Card, Button, InfoBanner, StatusBadge } from '../../components/ui';
import { DemoChip } from '../../components/ui/DemoBanner';

export function AccountDetailsPage() {
  const { account, balance } = useApp();
  const { copyToClipboard } = useClipboard();
  const navigate = useNavigate();

  const handleCopy = () => {
    if (account?.providerAccountNumber) {
      copyToClipboard(account.providerAccountNumber, 'Account number copied');
    }
  };

  const handleShare = () => {
    if (!account) return;
    const text = [
      `Account Name: ${account.accountName}`,
      `Account Number: ${account.providerAccountNumber}`,
      `Bank: ${account.providerName}`,
      `Currency: ${account.currency}`,
      '',
      '⚠️ DEMO ACCOUNT — Not a real bank account.',
    ].join('\n');
    if (navigator.share) {
      navigator.share({ title: 'My TAVI Account Details', text });
    } else {
      copyToClipboard(text, 'Account details copied');
    }
  };

  const provisioningStatusMeta: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'text-success' },
    pending: { label: 'Setting up your account…', color: 'text-warning' },
    not_started: { label: 'Not started', color: 'text-slate-500' },
    conflict: { label: 'Account conflict — contact support', color: 'text-error' },
    failed: { label: 'Setup failed — contact support', color: 'text-error' },
    suspended: { label: 'Account suspended', color: 'text-error' },
  };

  const statusMeta = account
    ? provisioningStatusMeta[account.provisioningStatus]
    : provisioningStatusMeta.not_started;

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Account details" onBack={() => navigate(-1)} />

      <div className="px-5 py-6 flex flex-col gap-5">
        {/* Demo notice */}
        <InfoBanner
          type="warning"
          message="DEMO: This account is simulated for demonstration. The account number shown is not a real bank account."
        />

        {/* Account Number Card */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-midnight-navy">TAVI Account</h2>
            <DemoChip />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account name</p>
              <p className="font-semibold text-midnight-navy">{account?.accountName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Bank / Provider</p>
              <p className="font-semibold text-midnight-navy">{account?.providerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account number</p>
              <p className="text-2xl font-bold tracking-widest text-midnight-navy">
                {account ? formatAccountNumber(account.providerAccountNumber) : '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Phone-linked pattern from 07074100290
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account type</p>
              <p className="font-medium text-midnight-navy">{account?.accountType} · {account?.currency}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Account status</p>
              <p className={`font-medium text-sm ${statusMeta.color}`}>{statusMeta.label}</p>
            </div>
            {account?.patternMatchConfirmed && (
              <div className="flex items-center gap-2 text-xs text-success bg-green-50 rounded-input px-3 py-2">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Phone-linked pattern confirmed (demo)
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <Button variant="primary" size="md" className="flex-1" onClick={handleCopy}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy number
            </Button>
            <Button variant="secondary" size="md" className="flex-1" onClick={handleShare}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>
          </div>
        </div>

        {/* Provisioning info */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-midnight-navy mb-3">About your account number</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Your account number follows a phone-linked pattern:</p>
            <div className="bg-pale-mint rounded-input px-3 py-2 text-sm font-mono text-midnight-navy">
              <span className="text-slate-400">Phone:</span> 07074100290<br />
              <span className="text-slate-400">Pattern:</span> 7074100290
            </div>
            <p className="text-xs text-slate-500">
              In production, this number is only shown as operational after your authorised account 
              provider confirms the mapping. The provider's confirmed number is always the authoritative one.
            </p>
          </div>
        </div>

        {/* Provisioning states demo */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-midnight-navy mb-3">Account provisioning states</h3>
          <div className="space-y-2">
            {[
              { status: 'active', label: '✅ Active — provider confirmed', desc: 'Account is ready to receive funds.' },
              { status: 'pending', label: '⏳ Pending — setting up', desc: 'Account details are being set up.' },
              { status: 'conflict', label: '⚠️ Conflict', desc: 'Another account uses this number. Contact support.' },
              { status: 'failed', label: '❌ Failed', desc: 'Setup could not be completed. We could not confirm your account details yet.' },
            ].map((s) => (
              <div key={s.status} className="text-xs bg-slate-50 rounded-input px-3 py-2">
                <p className="font-medium text-midnight-navy">{s.label}</p>
                <p className="text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
