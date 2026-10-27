import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { GIFT_CARD_BRANDS } from '../../data/demoData';
import { formatNaira } from '../../services/formatters';

export function GiftCardsPage() {
  const navigate = useNavigate();
  const brandSelectId = useId();
  const regionSelectId = useId();
  const cardFormatSelectId = useId();
  const payoutDestSelectId = useId();
  const { giftCards, submitGiftCardOffer, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'sell' | 'history' | 'rates' | 'help'>('sell');

  // Form states
  const [selectedBrandName, setSelectedBrandName] = useState(GIFT_CARD_BRANDS[0].name);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [denomination, setDenomination] = useState('50');
  const [cardCode, setCardCode] = useState('');
  const [cardFormat, setCardFormat] = useState<'ecode' | 'physical'>('ecode');
  const [payoutDestination, setPayoutDestination] = useState<'wallet' | 'bank'>('wallet');

  // Multi-step review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessRef, setSubmissionSuccessRef] = useState<string | null>(null);

  // Active pricing calculation
  const currentBrand = GIFT_CARD_BRANDS.find((b) => b.name === selectedBrandName) || GIFT_CARD_BRANDS[0];
  const ratePerDollar = currentBrand.ratePerDollar || 1400;
  const parsedFaceValue = parseFloat(denomination) || 0;
  const payoutKobo = parsedFaceValue * ratePerDollar * 100;
  const processingFeeKobo = 0; // Zero fee promotion

  const handleStartReview = () => {
    if (!cardCode.trim()) {
      showToast('Please enter the card claim code or PIN', 'error');
      return;
    }
    if (parsedFaceValue < currentBrand.minDenomination) {
      showToast(`Minimum denomination for ${currentBrand.name} is $${currentBrand.minDenomination}`, 'error');
      return;
    }
    setShowReviewModal(true);
  };

  const handleConfirmSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord = submitGiftCardOffer(
        currentBrand.name,
        selectedRegion,
        parsedFaceValue,
        payoutKobo,
        cardCode
      );
      setIsSubmitting(false);
      setSubmissionSuccessRef(newRecord.reference);
      setCardCode('');
      showToast(`Offer submitted for review (Ref: ${newRecord.reference})`, 'success');
    }, 800);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-12">
      <PageHeader title="Gift Card Trading" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Navigation Tabs (Phase 6 Requirement 2) */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'sell', label: '🏷️ Sell a Gift Card' },
            { id: 'history', label: '📜 My Redemptions' },
            { id: 'rates', label: '📊 Rates & Fees' },
            { id: 'help', label: '❓ Trading Guide' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSubmissionSuccessRef(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === tab.id
                  ? 'bg-white text-midnight-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: SELL A GIFT CARD ─── */}
        {activeTab === 'sell' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 space-y-4 border border-border-color bg-white shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">
                    Verified Exchange
                  </span>
                  <h3 className="font-extrabold text-base text-midnight-navy mt-0.5">
                    Sell Gift Card for Naira Payout
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Exchange unused international digital codes and physical store cards for prompt wallet credit.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Brand Selector */}
                  <div>
                    <label htmlFor={brandSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Gift Card Brand</label>
                    <select
                      id={brandSelectId}
                      className="input-field font-semibold"
                      value={selectedBrandName}
                      onChange={(e) => setSelectedBrandName(e.target.value)}
                    >
                      {GIFT_CARD_BRANDS.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name} (from ₦{b.ratePerDollar.toLocaleString()}/$)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Region */}
                    <div>
                      <label htmlFor={regionSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Card Region / Country</label>
                      <select
                        id={regionSelectId}
                        className="input-field"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                      >
                        <option value="US">United States (USD)</option>
                        <option value="UK">United Kingdom (GBP)</option>
                        <option value="DE">Germany / EU (EUR)</option>
                      </select>
                    </div>

                    {/* Denomination */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Face Value ($ / £ / €)</label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={denomination}
                        onChange={(e) => setDenomination(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Format */}
                    <div>
                      <label htmlFor={cardFormatSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Card Format</label>
                      <select
                        id={cardFormatSelectId}
                        className="input-field"
                        value={cardFormat}
                        onChange={(e) => setCardFormat(e.target.value as any)}
                      >
                        <option value="ecode">Digital E-Code / PIN</option>
                        <option value="physical">Physical Card Photo</option>
                      </select>
                    </div>

                    {/* Payout Destination */}
                    <div>
                      <label htmlFor={payoutDestSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Payout Destination</label>
                      <select
                        id={payoutDestSelectId}
                        className="input-field"
                        value={payoutDestination}
                        onChange={(e) => setPayoutDestination(e.target.value as any)}
                      >
                        <option value="wallet">TAVI Main NGN Wallet</option>
                        <option value="bank">Direct Bank Account</option>
                      </select>
                    </div>
                  </div>

                  {/* Claim Code Input */}
                  <div>
                    <Input
                      label="Card Claim Code or PIN"
                      placeholder="e.g. AMZN-8492-4910-4029"
                      value={cardCode}
                      onChange={(e) => setCardCode(e.target.value)}
                      hint="Demo Environment: Codes are not transmitted to third parties."
                    />
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    disabled={!cardCode.trim() || parsedFaceValue <= 0}
                    onClick={handleStartReview}
                  >
                    Review Offer & Continue
                  </Button>
                </div>
              </Card>
            </div>

            {/* Offer Breakdown Panel (Phase 6 Requirement 6) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 space-y-3.5 border border-border-color bg-white shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transparent Offer Breakdown
                </span>

                <div className="p-4 bg-gradient-to-br from-pale-mint/70 to-white rounded-2xl border border-mint text-center space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Estimated Customer Payout</span>
                  <div className="text-2xl font-extrabold text-primary-green">
                    {formatNaira(payoutKobo)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated for ${parsedFaceValue.toFixed(2)} USD {currentBrand.name} card
                  </p>
                </div>

                <div className="space-y-2 text-xs border-y border-border-color py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buying Rate:</span>
                    <span className="font-bold text-midnight-navy">₦{ratePerDollar.toLocaleString()} / $1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing Fee:</span>
                    <span className="font-semibold text-action-green">₦0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rate Timestamp:</span>
                    <span className="text-slate-600 font-mono text-[11px]">{new Date().toLocaleTimeString('en-NG')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quote Status:</span>
                    <span className="text-action-green font-bold">Active / Available for Acceptance</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1 leading-relaxed">
                  <p className="font-bold text-slate-700">Multi-Stage Status Lifecycle:</p>
                  <p>
                    Submitted cards undergo digital code verification. Payouts are credited immediately upon verified partner redemption.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─── TAB 2: MY REDEMPTIONS (Phase 6 Requirement 10) ─── */}
        {activeTab === 'history' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <div className="flex justify-between items-center pb-2 border-b">
              <SectionHeader title="Your Redemption History" />
              <span className="text-xs text-slate-400 font-mono">{giftCards.length} Submissions</span>
            </div>

            <div className="space-y-3">
              {giftCards.map((gc) => (
                <div key={gc.id} className="p-4 bg-slate-50 rounded-2xl border border-border-color flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      {gc.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-midnight-navy text-sm">{gc.brand}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          ${gc.denomination} {gc.denominationCurrency}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Ref: <span className="font-mono text-slate-700">{gc.reference}</span> · Region: {gc.region}
                      </p>
                      <p className="text-slate-400 text-[10px]">Submitted: {new Date(gc.submittedAt).toLocaleString('en-NG')}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-extrabold text-midnight-navy text-sm">{formatNaira(gc.payoutKobo)}</p>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          gc.status === 'paid'
                            ? 'bg-green-100 text-action-green border-green-200'
                            : gc.status === 'under_review'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : gc.status === 'approved'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-red-100 text-red-600 border-red-200'
                        }`}
                      >
                        {gc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── TAB 3: RATES & FEES ─── */}
        {activeTab === 'rates' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <SectionHeader title="Active Gift Card Buying Rates" />
            <p className="text-xs text-slate-500">
              Live market buying rates updated hourly. Rates are determined by international liquidity exchange demand.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {GIFT_CARD_BRANDS.map((b) => (
                <div key={b.name} className="p-4 bg-slate-50 rounded-xl border border-border-color space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-midnight-navy text-sm">{b.name}</span>
                    <span className="text-[10px] bg-pale-mint text-primary-green px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Buying Rate:</span>
                      <strong className="text-action-green">₦{b.ratePerDollar.toLocaleString()} / $1</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Amount:</span>
                      <strong className="text-slate-700">${b.minDenomination}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accepted:</span>
                      <span className="text-slate-600">{b.regions.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── TAB 4: TRADING GUIDE & COMPLIANCE (Phase 6 Requirement 11 & 13) ─── */}
        {activeTab === 'help' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <SectionHeader title="Gift Card Trading & Safety Guide" />

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 space-y-1">
                <span className="font-bold block">🛡️ Anti-Fraud Compliance Notice:</span>
                <p className="text-[11px]">
                  TAVI enforces strict verification against card laundering, stolen gift cards, or impersonation scams. All submissions maintain immutable audit logs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-midnight-navy text-sm mb-1">How Long Does Verification Take?</h4>
                <p>Digital e-codes typically resolve within 15–30 minutes during standard clearing hours. Physical cards requiring manual photo validation may take up to 2 hours.</p>
              </div>

              <div>
                <h4 className="font-bold text-midnight-navy text-sm mb-1">What Happens if the Balance Differs?</h4>
                <p>If the confirmed balance is less than the claimed denomination, our rate engine recalculates the payout transparently and requests your confirmation before crediting.</p>
              </div>

              <div>
                <h4 className="font-bold text-midnight-navy text-sm mb-1">Dispute Resolution</h4>
                <p>If a submission encounters an issue, our support team is available via Support & Help Center with your unique redemption reference number.</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ─── Review & Confirmation Modal (Phase 6 Requirement 8) ─── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-midnight-navy">Confirm Gift Card Submission</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            {!submissionSuccessRef ? (
              <div className="space-y-3">
                <div className="space-y-2 text-xs border-y py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Brand:</span>
                    <span className="font-bold text-midnight-navy">{currentBrand.name} ({selectedRegion})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Face Value:</span>
                    <span className="font-bold text-midnight-navy">${parsedFaceValue.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Agreed Rate:</span>
                    <span className="font-semibold text-slate-700">₦{ratePerDollar.toLocaleString()} / $1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Claim Code:</span>
                    <span className="font-mono text-slate-700">{cardCode.slice(0, 4)}••••••••</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="font-bold text-midnight-navy">Customer Payout:</span>
                    <span className="font-extrabold text-primary-green text-base">{formatNaira(payoutKobo)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Notice: Submissions enter our review queue. Your wallet will be credited once verified.
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                    onClick={handleConfirmSubmission}
                  >
                    Confirm & Submit for Review
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setShowReviewModal(false)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-2 animate-fade-in">
                <div className="w-14 h-14 bg-pale-mint rounded-full flex items-center justify-center mx-auto text-action-green text-xl font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-bold text-action-green uppercase tracking-wider block">Submission Received</span>
                  <h4 className="font-bold text-base text-midnight-navy mt-1">Ref: {submissionSuccessRef}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your {currentBrand.name} gift card is currently <strong>Under Review</strong>. You will receive an alert once verified.
                  </p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    setShowReviewModal(false);
                    setSubmissionSuccessRef(null);
                    setActiveTab('history');
                  }}
                >
                  View in My Redemptions
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
