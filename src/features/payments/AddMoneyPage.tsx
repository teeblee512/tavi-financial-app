import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button } from '../../components/ui';
import { formatAccountNumber } from '../../services/phoneUtils';
import { useClipboard } from '../../hooks/useClipboard';

export function AddMoneyPage() {
  const navigate = useNavigate();
  const { account } = useApp();
  const { copyToClipboard } = useClipboard();

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Add Money" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-midnight-navy">Instant Bank Transfer</h3>
          <p className="text-xs text-slate-500">
            Transfer money from any Nigerian banking app or USSD to your unique TAVI account:
          </p>
          <div className="p-4 bg-input-bg rounded-xl space-y-2">
            <div className="text-xs text-slate-500">Bank Name</div>
            <div className="font-semibold text-midnight-navy">{account?.providerName || 'TAVI Demo Bank'}</div>
            <div className="text-xs text-slate-500">Account Number</div>
            <div className="text-xl font-bold tracking-widest text-midnight-navy">
              {formatAccountNumber(account?.providerAccountNumber || '7074100290')}
            </div>
            <div className="text-xs text-slate-500">Account Name</div>
            <div className="font-semibold text-midnight-navy">{account?.accountName}</div>
          </div>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => copyToClipboard(account?.providerAccountNumber || '7074100290', 'Account number copied')}
          >
            Copy Account Number
          </Button>
        </Card>

        <Card className="p-5 space-y-2">
          <h4 className="font-semibold text-midnight-navy">Top Up with Debit Card</h4>
          <p className="text-xs text-slate-500">Supports Mastercard, Visa, and Verve cards issued in Nigeria.</p>
          <Button variant="outline" fullWidth onClick={() => alert('Card gateway simulated.')}>
            Add with Card (Simulated)
          </Button>
        </Card>
      </div>
    </div>
  );
}
