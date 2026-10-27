import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, Button, Card, SectionHeader } from '../../components/ui';
import { NIGERIAN_BANKS } from '../../data/demoData';
import { parseNairaToKobo, formatNaira } from '../../services/formatters';

export function SendMoneyPage() {
  const navigate = useNavigate();
  const bankSelectId = useId();
  const { addDemoTransaction, showToast, balance, beneficiaries } = useApp();

  const [bank, setBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isResolvingName, setIsResolvingName] = useState(false);
  const [nameLookupStatus, setNameLookupStatus] = useState<'idle' | 'simulated' | 'error'>('idle');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Transfer limits & calculations
  const parsedAmountKobo = parseNairaToKobo(amount) || 0;
  const transferFeeKobo = 10_75; // Standard NIP transfer fee
  const totalDebitKobo = parsedAmountKobo + transferFeeKobo;

  // Controlled simulated recipient resolution (Financial safety requirement)
  const handleAccountChange = (acc: string) => {
    const cleaned = acc.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    setErrorMessage('');

    if (cleaned.length === 10) {
      setIsResolvingName(true);
      setTimeout(() => {
        setIsResolvingName(false);
        // Match known demo beneficiary or provide transparent demo placeholder
        const matchedBen = beneficiaries.find((b) => b.accountNumber === cleaned);
        if (matchedBen) {
          setRecipientName(`${matchedBen.name} (Saved Beneficiary)`);
          setNameLookupStatus('simulated');
        } else {
          setRecipientName('Babajide A. Adeleke (Demo Resolution)');
          setNameLookupStatus('simulated');
        }
      }, 400);
    } else {
      setRecipientName('');
      setNameLookupStatus('idle');
    }
  };

  const handleSelectBeneficiary = (b: typeof beneficiaries[0]) => {
    setBank(b.bankName);
    setAccountNumber(b.accountNumber);
    setRecipientName(`${b.name} (Saved Beneficiary)`);
    setNameLookupStatus('simulated');
    setErrorMessage('');
  };

  const handleProceedToReview = () => {
    setErrorMessage('');
    if (!accountNumber || accountNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }
    if (!parsedAmountKobo || parsedAmountKobo <= 0) {
      setErrorMessage('Please enter a positive transfer amount.');
      return;
    }
    if (balance && totalDebitKobo > balance.available) {
      setErrorMessage(`Insufficient funds. Your available balance is ${formatNaira(balance.available)}.`);
      return;
    }
    setStep('review');
  };

  const handleConfirmTransfer = () => {
    if (transactionPin.length !== 4) {
      setErrorMessage('Please enter your 4-digit transaction PIN.');
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);
    setTimeout(() => {
      addDemoTransaction({
        direction: 'debit',
        amountKobo: parsedAmountKobo,
        feeKobo: transferFeeKobo,
        currency: 'NGN',
        status: 'successful',
        category: 'transfer',
        counterpartyName: recipientName.replace(' (Demo Resolution)', '').replace(' (Saved Beneficiary)', '') || 'Recipient',
        counterpartyAccount: accountNumber,
        counterpartyBank: bank,
        narration: narration.trim() || 'Transfer via TAVI',
        reference: `TVI-TRF-${Date.now().toString().slice(-7)}`,
        timestamp: new Date().toISOString(),
      });
      setIsSubmitting(false);
      setStep('success');
      showToast('Transfer completed successfully (Demo)', 'success');
    }, 700);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-10">
      <PageHeader title="Send Money" onBack={() => (step === 'form' ? navigate(-1) : setStep('form'))} />

      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {step === 'form' && (
          <>
            {/* Quick Beneficiaries */}
            {beneficiaries.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Beneficiaries</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {beneficiaries.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBeneficiary(b)}
                      className="flex items-center gap-2 p-2 bg-white rounded-xl border border-border-color hover:border-action-green transition-colors text-left flex-shrink-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-pale-mint text-primary-green flex items-center justify-center font-bold text-xs">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="pr-2">
                        <p className="text-xs font-bold text-midnight-navy truncate max-w-[110px]">{b.name}</p>
                        <p className="text-[10px] text-slate-400">{b.bankName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Card className="p-5 space-y-4 border border-border-color bg-white">
              <SectionHeader title="Recipient Details" />

              <div className="space-y-3">
                <div>
                  <label htmlFor={bankSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Select Destination Bank</label>
                  <select
                    id={bankSelectId}
                    className="input-field"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code + b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Account Number (10 digits)"
                    placeholder="e.g. 0123456789"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                  />
                  {isResolvingName && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-action-green" />
                      Resolving account name via NIP switch...
                    </p>
                  )}
                  {nameLookupStatus === 'simulated' && recipientName && (
                    <div className="mt-2 p-2.5 bg-pale-mint/70 rounded-xl border border-mint text-xs space-y-0.5">
                      <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">Resolved Recipient</span>
                      <p className="text-sm font-bold text-midnight-navy">{recipientName}</p>
                      <p className="text-[10px] text-slate-500">Source: Verified Nigerian Inter-Bank Settlement Switch (Demo)</p>
                    </div>
                  )}
                </div>

                <div>
                  <Input
                    label="Amount (NGN)"
                    placeholder="e.g. 15,000"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMessage('');
                    }}
                  />
                  {balance && (
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Available: {formatNaira(balance.available)}</span>
                      <span>Transfer Fee: ₦10.75</span>
                    </div>
                  )}
                </div>

                <Input
                  label="Narration / Note (Optional)"
                  placeholder="What is this transfer for?"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  maxLength={50}
                />

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {errorMessage}
                  </div>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  disabled={accountNumber.length !== 10 || !parsedAmountKobo}
                  onClick={handleProceedToReview}
                >
                  Continue to Review
                </Button>
              </div>
            </Card>
          </>
        )}

        {step === 'review' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 2 of 2</span>
              <h3 className="text-lg font-bold text-midnight-navy mt-0.5">Review Transfer</h3>
              <p className="text-xs text-slate-500">Please verify the transfer details and enter your transaction PIN.</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-y border-border-color py-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recipient Name</span>
                <span className="font-bold text-midnight-navy text-sm">{recipientName || 'Recipient'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bank</span>
                <span className="font-medium text-slate-800">{bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Number</span>
                <span className="font-mono font-medium text-slate-800">{accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transfer Amount</span>
                <span className="font-bold text-midnight-navy text-sm">{formatNaira(parsedAmountKobo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Applicable Fee</span>
                <span className="font-medium text-slate-600">₦10.75</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-border-color">
                <span className="font-bold text-midnight-navy">Total Debit</span>
                <span className="font-extrabold text-primary-green text-base">{formatNaira(totalDebitKobo)}</span>
              </div>
              {narration && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Narration</span>
                  <span className="text-slate-600 italic">"{narration}"</span>
                </div>
              )}
            </div>

            {/* Transaction PIN Verification */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 block">Enter 4-Digit Transaction PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={transactionPin}
                onChange={(e) => {
                  setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setErrorMessage('');
                }}
                className="w-full text-center text-xl tracking-widest py-2 rounded-xl bg-input-bg border border-border-color text-midnight-navy focus:outline-none focus:ring-2 focus:ring-action-green"
              />
              <p className="text-[11px] text-slate-400 text-center">Demo environment: Any 4 digits will verify.</p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                fullWidth
                loading={isSubmitting}
                disabled={transactionPin.length !== 4}
                onClick={handleConfirmTransfer}
              >
                Confirm & Authorize Transfer
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setStep('form')}>
                Back to Edit
              </Button>
            </div>
          </Card>
        )}

        {step === 'success' && (
          <Card className="p-6 text-center space-y-4 border border-border-color bg-white animate-slide-up">
            <div className="w-16 h-16 bg-pale-mint rounded-full flex items-center justify-center mx-auto text-action-green">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-action-green uppercase tracking-wider">Transfer Successful</span>
              <h3 className="text-2xl font-extrabold text-midnight-navy mt-1">{formatNaira(parsedAmountKobo)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sent to <span className="font-semibold text-slate-700">{recipientName}</span> ({bank})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-500 text-left">
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-slate-700">TVI-TRF-{Date.now().toString().slice(-7)}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-700">{new Date().toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-action-green font-bold">Confirmed Settled</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button variant="primary" fullWidth onClick={() => navigate('/transactions')}>
                View in Transaction History
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
                Back to Home Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
