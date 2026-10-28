import { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, Button, Card } from '../../components/ui';
import { NIGERIAN_BANKS } from '../../data/demoData';
import { parseNairaToKobo, formatNaira } from '../../services/formatters';
import { apiClient } from '../../services/apiClient';

interface DemoRecipient {
  userId: string;
  name: string;
  demoTag: string;
  phone: string;
  accountNumber: string;
  bankName: string;
  isDemo: boolean;
}

export function SendMoneyPage() {
  const navigate = useNavigate();
  const bankSelectId = useId();
  const { user, balance, refreshLiveState, showToast } = useApp();

  const [transferMode, setTransferMode] = useState<'demo_peer' | 'other_bank'>('demo_peer');
  const [demoDirectory, setDemoDirectory] = useState<DemoRecipient[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  // Recipient input & resolution
  const [recipientQuery, setRecipientQuery] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState<any | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  // Other Bank fields
  const [bank, setBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [externalRecipientName, setExternalRecipientName] = useState('');

  // Transfer Details
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedTransaction, setConfirmedTransaction] = useState<any | null>(null);

  // Transfer limits & calculations
  const parsedAmountKobo = parseNairaToKobo(amount) || 0;
  const transferFeeKobo = 10_00; // ₦10.00 standard minor fee
  const totalDebitKobo = parsedAmountKobo + transferFeeKobo;

  // Load registered demo directory for quick 1-click tester selection
  useEffect(() => {
    async function loadDirectory() {
      setIsLoadingDirectory(true);
      const res = await apiClient.getDemoDirectory();
      if (res.success && Array.isArray(res.data)) {
        setDemoDirectory(res.data);
      }
      setIsLoadingDirectory(false);
    }
    loadDirectory();
  }, [user?.id]);

  // Debounced lookup for recipientQuery
  useEffect(() => {
    if (transferMode !== 'demo_peer') return;

    const trimmed = recipientQuery.trim();
    if (!trimmed) {
      setResolvedRecipient(null);
      setResolveError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsResolving(true);
      setResolveError('');
      const res = await apiClient.lookupRecipient(trimmed);
      setIsResolving(false);

      if (res.success && res.data) {
        if (res.data.isSelf) {
          setResolveError('Self-transfer is disallowed. Please select an eligible external demo recipient.');
          setResolvedRecipient(null);
        } else {
          setResolvedRecipient(res.data);
          setResolveError('');
        }
      } else {
        setResolvedRecipient(null);
        setResolveError(res.error?.message || 'No registered TAVI demo recipient matches this query.');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [recipientQuery, transferMode]);

  const handleSelectDirectoryRecipient = (rec: DemoRecipient) => {
    setRecipientQuery(rec.demoTag || rec.phone);
    setResolvedRecipient({
      userId: rec.userId,
      name: rec.name,
      demoTag: rec.demoTag,
      accountNumber: rec.accountNumber,
      bankName: rec.bankName,
      isDemo: true,
      isEligible: true,
    });
    setResolveError('');
    setErrorMessage('');
  };

  const handleProceedToReview = () => {
    setErrorMessage('');

    if (transferMode === 'demo_peer') {
      if (!resolvedRecipient) {
        setErrorMessage('Please enter or select a verified registered demo recipient.');
        return;
      }
      if (resolvedRecipient.userId === user?.id) {
        setErrorMessage('Self-transfer is disallowed. Please choose another tester.');
        return;
      }
    } else {
      if (!accountNumber || accountNumber.length !== 10) {
        setErrorMessage('Please enter a valid 10-digit Nigerian NUBAN account number.');
        return;
      }
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

  const handleConfirmTransfer = async () => {
    if (transactionPin.length !== 4) {
      setErrorMessage('Please enter your 4-digit transaction PIN (e.g. 1234).');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const targetIdentifier = transferMode === 'demo_peer'
        ? (resolvedRecipient?.demoTag || resolvedRecipient?.accountNumber || recipientQuery)
        : accountNumber;

      const targetName = transferMode === 'demo_peer'
        ? resolvedRecipient?.name
        : (externalRecipientName || 'Commercial Bank Recipient');

      const targetBank = transferMode === 'demo_peer'
        ? (resolvedRecipient?.bankName || 'Providus Bank (Demo)')
        : bank;

      const res = await apiClient.transfer({
        recipientIdentifier: targetIdentifier,
        recipientName: targetName,
        recipientBank: targetBank,
        amountMinor: parsedAmountKobo,
        currency: 'NGN',
        narration: narration.trim() || 'Demo funds transfer',
        pin: transactionPin,
      });

      if (res.success && res.data) {
        setConfirmedTransaction(res.data.transaction);
        await refreshLiveState();
        setIsSubmitting(false);
        setStep('success');
        showToast('Transfer completed and confirmed by backend!', 'success');
      } else {
        setIsSubmitting(false);
        setErrorMessage(res.error?.message || 'Transfer failed on the backend. No funds were debited.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Network request failed. No funds were transferred.');
    }
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-10">
      <PageHeader
        title="Send Money (Demo Sandbox)"
        onBack={() => (step === 'form' ? navigate(-1) : setStep('form'))}
      />

      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {step === 'form' && (
          <>
            {/* Mode Switch: Demo Peer vs Other Bank */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-border-color">
              <button
                type="button"
                onClick={() => { setTransferMode('demo_peer'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  transferMode === 'demo_peer'
                    ? 'bg-white text-midnight-navy shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-midnight-navy'
                }`}
              >
                TAVI Demo Peer Transfer
              </button>
              <button
                type="button"
                onClick={() => { setTransferMode('other_bank'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  transferMode === 'other_bank'
                    ? 'bg-white text-midnight-navy shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-midnight-navy'
                }`}
              >
                Other Nigerian Bank (NIP)
              </button>
            </div>

            {/* Live Balance Banner */}
            <div className="p-3 bg-pale-mint/50 border border-action-green/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-green">
                  Your Available Demo Balance
                </span>
                <p className="text-base font-extrabold text-midnight-navy">
                  {formatNaira(balance?.available || 0)}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-border-color">
                {user?.demoTag || `@user${user?.phoneInput?.slice(-4)}`}
              </span>
            </div>

            {/* Quick Registered Demo Testers Directory */}
            {transferMode === 'demo_peer' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Eligible Demo Testers
                  </span>
                  <span className="text-[11px] text-action-green font-medium">1-Click Pick</span>
                </div>

                {isLoadingDirectory ? (
                  <p className="text-xs text-slate-400">Loading active demo testers...</p>
                ) : demoDirectory.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {demoDirectory.map((rec) => (
                      <button
                        key={rec.userId}
                        onClick={() => handleSelectDirectoryRecipient(rec)}
                        className={`flex items-center gap-2.5 p-2.5 bg-white rounded-xl border transition-all text-left flex-shrink-0 ${
                          resolvedRecipient?.userId === rec.userId
                            ? 'border-action-green bg-pale-mint/20 ring-1 ring-action-green'
                            : 'border-border-color hover:border-action-green'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-pale-mint text-primary-green flex items-center justify-center font-bold text-xs">
                          {rec.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="pr-1">
                          <p className="text-xs font-bold text-midnight-navy truncate max-w-[130px]">{rec.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{rec.demoTag} • {rec.accountNumber}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No other demo testers registered yet.</p>
                )}
              </div>
            )}

            {/* Transfer Form Card */}
            <Card className="p-5 space-y-4 border border-border-color bg-white shadow-sm">
              <div className="space-y-3">
                {transferMode === 'demo_peer' ? (
                  <div className="space-y-1">
                    <Input
                      label="Demo Recipient Identifier"
                      placeholder="Enter @demoTag, phone, or 10-digit account"
                      value={recipientQuery}
                      onChange={(e) => {
                        setRecipientQuery(e.target.value);
                        setErrorMessage('');
                      }}
                      hint="Search by unique tag (e.g. @babajide), phone number, or account"
                    />

                    {isResolving && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                        <span className="w-2.5 h-2.5 border-2 border-action-green border-t-transparent rounded-full animate-spin"></span>
                        Resolving verified demo recipient...
                      </p>
                    )}

                    {resolvedRecipient && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <span className="text-action-green font-extrabold">✓</span> {resolvedRecipient.name}
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            {resolvedRecipient.demoTag} • Account: {resolvedRecipient.accountNumber} ({resolvedRecipient.bankName})
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          Verified Demo
                        </span>
                      </div>
                    )}

                    {resolveError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl mt-2 text-xs text-red-700 font-medium">
                        {resolveError}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label htmlFor={bankSelectId} className="text-xs font-medium text-slate-700 block">
                        Destination Bank
                      </label>
                      <select
                        id={bankSelectId}
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-input-bg border border-border-color text-sm text-midnight-navy focus:outline-none focus:ring-2 focus:ring-action-green"
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b.code} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Account Number (10 Digits)"
                      type="tel"
                      placeholder="0123456789"
                      value={accountNumber}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAccountNumber(cleaned);
                        if (cleaned.length === 10) {
                          setExternalRecipientName('Simulated External Beneficiary');
                        }
                      }}
                      maxLength={10}
                    />

                    {externalRecipientName && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        Resolved: <strong>{externalRecipientName}</strong>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1">
                  <Input
                    label="Amount (₦)"
                    type="number"
                    placeholder="e.g. 5,000"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMessage('');
                    }}
                  />
                  {parsedAmountKobo > 0 && (
                    <p className="text-[11px] text-slate-500 flex justify-between">
                      <span>Total Debit (+₦10 fee):</span>
                      <strong className="text-midnight-navy font-bold">{formatNaira(totalDebitKobo)}</strong>
                    </p>
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
                  disabled={
                    (transferMode === 'demo_peer' && !resolvedRecipient) ||
                    (transferMode === 'other_bank' && accountNumber.length !== 10) ||
                    !parsedAmountKobo
                  }
                  onClick={handleProceedToReview}
                >
                  Continue to Review
                </Button>
              </div>
            </Card>
          </>
        )}

        {step === 'review' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white animate-fade-in shadow-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 2 of 2</span>
              <h3 className="text-lg font-bold text-midnight-navy mt-0.5">Review Transfer</h3>
              <p className="text-xs text-slate-500">
                Please verify the transfer details and authorize with your 4-digit PIN.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-y border-border-color py-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recipient Name</span>
                <span className="font-bold text-midnight-navy text-sm">
                  {transferMode === 'demo_peer' ? resolvedRecipient?.name : externalRecipientName}
                </span>
              </div>
              {transferMode === 'demo_peer' && resolvedRecipient?.demoTag && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Demo Tag</span>
                  <span className="font-mono font-bold text-primary-green">{resolvedRecipient.demoTag}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Destination Bank</span>
                <span className="font-medium text-slate-800">
                  {transferMode === 'demo_peer' ? (resolvedRecipient?.bankName || 'Providus Bank (Demo)') : bank}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Number</span>
                <span className="font-mono font-medium text-slate-800">
                  {transferMode === 'demo_peer' ? resolvedRecipient?.accountNumber : accountNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transfer Amount</span>
                <span className="font-bold text-midnight-navy text-sm">{formatNaira(parsedAmountKobo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Simulated NIP Fee</span>
                <span className="font-medium text-slate-600">₦10.00</span>
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
              <p className="text-[11px] text-slate-400 text-center">Demo environment: 1234 or any 4 digits.</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
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
                Confirm & Send Demo Funds
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setStep('form')} disabled={isSubmitting}>
                Back to Edit
              </Button>
            </div>
          </Card>
        )}

        {step === 'success' && (
          <Card className="p-6 text-center space-y-4 border border-border-color bg-white animate-slide-up shadow-sm">
            <div className="w-16 h-16 bg-pale-mint rounded-full flex items-center justify-center mx-auto text-action-green">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-action-green uppercase tracking-wider">
                Transfer Confirmed by Backend
              </span>
              <h3 className="text-2xl font-extrabold text-midnight-navy mt-1">
                {formatNaira(parsedAmountKobo)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sent to <span className="font-semibold text-slate-700">
                  {confirmedTransaction?.counterpartyName || resolvedRecipient?.name || 'Recipient'}
                </span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-500 text-left">
              <div className="flex justify-between">
                <span>Unique Reference:</span>
                <span className="font-mono text-slate-800 font-bold">
                  {confirmedTransaction?.reference || 'TAVI-TRF-CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-700">
                  {new Date().toLocaleString('en-NG')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Backend Status:</span>
                <span className="text-action-green font-bold uppercase">SUCCESSFUL (Audited)</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                <span>Updated Available Balance:</span>
                <span className="text-midnight-navy font-bold">{formatNaira(balance?.available || 0)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button variant="primary" fullWidth onClick={() => navigate('/transactions')}>
                View in Transaction History
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
