import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, Button, Card, SectionHeader } from '../../components/ui';
import { NIGERIAN_BANKS } from '../../data/demoData';
import { parseNairaToKobo, formatNaira } from '../../services/formatters';

export function SendMoneyPage() {
  const navigate = useNavigate();
  const { addDemoTransaction, showToast, balance } = useApp();
  const [bank, setBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  const handleLookup = (acc: string) => {
    setAccountNumber(acc);
    if (acc.length === 10) {
      setRecipientName('Babajide Adeleke (Verified)');
    } else {
      setRecipientName('');
    }
  };

  const handleConfirm = () => {
    const kobo = parseNairaToKobo(amount) || 0;
    addDemoTransaction({
      direction: 'debit',
      amountKobo: kobo,
      feeKobo: 1075,
      currency: 'NGN',
      status: 'successful',
      category: 'transfer',
      counterpartyName: recipientName || 'Recipient',
      counterpartyAccount: accountNumber,
      counterpartyBank: bank,
      narration: narration || 'Transfer via TAVI',
      reference: `TVI${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    setStep('success');
    showToast('Transfer completed successfully (Demo)', 'success');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Send Money" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {step === 'form' && (
          <>
            <SectionHeader title="Recipient Details" />
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Select Bank</label>
              <select 
                className="input-field" 
                value={bank} 
                onChange={(e) => setBank(e.target.value)}
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.code + b.name} value={b.name}>{b.name}</option>
                ))}
              </select>

              <Input 
                label="Account Number" 
                placeholder="0123456789" 
                maxLength={10} 
                value={accountNumber}
                onChange={(e) => handleLookup(e.target.value)}
              />

              {recipientName && (
                <div className="p-3 bg-pale-mint rounded-xl text-primary-green text-sm font-semibold">
                  Account Name: {recipientName}
                </div>
              )}

              <Input 
                label="Amount (NGN)" 
                placeholder="5,000" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Input 
                label="Narration" 
                placeholder="What is this for?" 
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />

              <Button 
                variant="primary" 
                fullWidth 
                disabled={!accountNumber || !amount}
                onClick={() => setStep('review')}
              >
                Continue to Review
              </Button>
            </div>
          </>
        )}

        {step === 'review' && (
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-midnight-navy">Review Transfer</h3>
            <div className="space-y-2 text-sm text-slate-600 border-y py-3">
              <div className="flex justify-between"><span>To:</span><span className="font-semibold text-midnight-navy">{recipientName || 'Recipient'}</span></div>
              <div className="flex justify-between"><span>Bank:</span><span>{bank}</span></div>
              <div className="flex justify-between"><span>Account Number:</span><span>{accountNumber}</span></div>
              <div className="flex justify-between"><span>Amount:</span><span className="font-bold text-midnight-navy">₦{amount}</span></div>
              <div className="flex justify-between"><span>Fee:</span><span>₦10.75</span></div>
            </div>
            <Button variant="primary" fullWidth onClick={handleConfirm}>
              Confirm & Send (Demo)
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep('form')}>
              Edit Details
            </Button>
          </Card>
        )}

        {step === 'success' && (
          <Card className="p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="font-bold text-xl text-midnight-navy">Transfer Successful!</h3>
            <p className="text-sm text-slate-500">
              ₦{amount} was sent to {recipientName || accountNumber}.
            </p>
            <Button variant="primary" fullWidth onClick={() => navigate('/transactions')}>
              View in Transactions
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
