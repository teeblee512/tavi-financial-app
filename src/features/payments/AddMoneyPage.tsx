import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button, Input } from '../../components/ui';
import { formatAccountNumber } from '../../services/phoneUtils';
import { formatNaira, parseNairaToKobo } from '../../services/formatters';
import { useClipboard } from '../../hooks/useClipboard';

export function AddMoneyPage() {
  const navigate = useNavigate();
  const { account, addDemoTransaction, showToast } = useApp();
  const { copyToClipboard } = useClipboard();

  const [showCardModal, setShowCardModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('10000');
  const [cardNumber] = useState('5399 •••• •••• 4021');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopyAccount = () => {
    if (account?.providerAccountNumber) {
      copyToClipboard(account.providerAccountNumber, 'Account number copied to clipboard');
    }
  };

  const handleCardTopUp = () => {
    const kobo = parseNairaToKobo(topUpAmount) || 0;
    if (kobo <= 0) {
      showToast('Please enter a valid top up amount', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      addDemoTransaction({
        direction: 'credit',
        amountKobo: kobo,
        feeKobo: 0,
        currency: 'NGN',
        status: 'successful',
        category: 'add_money',
        counterpartyName: 'Debit Card Top-up (Simulated)',
        narration: `Card funding via Mastercard *4021`,
        reference: `TVI-TOP-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
      });
      setIsProcessing(false);
      setShowCardModal(false);
      showToast(`₦${(kobo / 100).toLocaleString()} credited to your balance (Simulated)`, 'success');
    }, 800);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-10">
      <PageHeader title="Add Money" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Method 1: Bank Transfer Funding */}
        <Card className="p-5 space-y-4 border border-border-color bg-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] bg-pale-mint text-primary-green px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Bank Transfer
              </span>
              <h3 className="font-bold text-base text-midnight-navy mt-1">Direct Bank Deposit</h3>
            </div>
            <span className="text-xs text-slate-400">Zero Fee</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Transfer money from any Nigerian commercial bank app, USSD code, or mobile money wallet to your dedicated TAVI account details:
          </p>

          <div className="p-4 bg-input-bg rounded-2xl border border-border-color space-y-3">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Receiving Bank</span>
              <span className="text-sm font-bold text-midnight-navy">{account?.providerName || 'TAVI Demo Bank'}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Account Number</span>
              <span className="text-2xl font-mono font-extrabold tracking-widest text-midnight-navy">
                {formatAccountNumber(account?.providerAccountNumber || '7074100290')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Account Name</span>
              <span className="text-sm font-bold text-midnight-navy">{account?.accountName || 'AMARA OKONKWO'}</span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-0.5">
            <span className="font-bold">Notice:</span> Funds are credited automatically once confirmed by the clearing network. Demo account details are simulated.
          </div>

          <Button variant="secondary" fullWidth onClick={handleCopyAccount}>
            Copy Account Number
          </Button>
        </Card>

        {/* Method 2: Debit Card Top Up (Interactive Modal) */}
        <Card className="p-5 space-y-3 border border-border-color bg-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Debit Card
              </span>
              <h4 className="font-bold text-base text-midnight-navy mt-1">Top Up with Card</h4>
            </div>
            <span className="text-xs text-slate-400">Instant</span>
          </div>

          <p className="text-xs text-slate-500">
            Supports Nigerian Mastercard, Visa, and Verve debit cards through secure tokenization.
          </p>

          <Button variant="outline" fullWidth onClick={() => setShowCardModal(true)}>
            Top Up with Card (Simulated)
          </Button>
        </Card>
      </div>

      {/* Simulated Card Top Up Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-midnight-navy">Simulate Card Top-up</h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Top-up Amount (NGN)</label>
                <Input
                  type="number"
                  placeholder="10,000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>

              {/* Presets */}
              <div className="flex gap-2">
                {['5000', '10000', '25000', '50000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopUpAmount(preset)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      topUpAmount === preset
                        ? 'bg-action-green text-white border-action-green'
                        : 'bg-slate-50 text-slate-700 border-border-color hover:bg-slate-100'
                    }`}
                  >
                    ₦{(parseInt(preset, 10) / 1000)}k
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1 text-xs">
                <span className="text-slate-400 font-medium">Selected Demo Card</span>
                <p className="font-mono font-bold text-midnight-navy">{cardNumber}</p>
                <p className="text-[10px] text-slate-500">Zero transaction fees apply for debit card funding in demo mode.</p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  loading={isProcessing}
                  onClick={handleCardTopUp}
                >
                  Pay {formatNaira(parseNairaToKobo(topUpAmount) || 0)} (Demo)
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowCardModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
