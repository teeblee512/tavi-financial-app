import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { GIFT_CARD_BRANDS } from '../../data/demoData';
import { formatNaira } from '../../services/formatters';

export function GiftCardsPage() {
  const navigate = useNavigate();
  const { giftCards, redeemGiftCard, showToast } = useApp();

  const [brand, setBrand] = useState('Amazon');
  const [region, setRegion] = useState('US');
  const [denomination, setDenomination] = useState('50');
  const [cardCode, setCardCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate: ₦1,450 per $1 for gift cards
  const ratePerDollar = 1450;
  const payoutKobo = (parseFloat(denomination) || 0) * ratePerDollar * 100;

  const handleRedeem = () => {
    if (!cardCode.trim()) {
      showToast('Please enter the gift card code or claim number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      redeemGiftCard(brand, region, parseFloat(denomination) || 50, payoutKobo);
      setIsSubmitting(false);
      setCardCode('');
      showToast(`₦${(payoutKobo / 100).toLocaleString()} credited to your balance (Simulated)`, 'success');
    }, 800);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Gift Card Redemption" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-4">
          <SectionHeader title="Redeem Gift Card for Naira" />
          <p className="text-xs text-slate-500">
            Convert unused international gift cards into instant, verified Naira wallet funds.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Brand</label>
              <select className="input-field" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {GIFT_CARD_BRANDS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Country / Region</label>
                <select className="input-field" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="US">United States (USD)</option>
                  <option value="UK">United Kingdom (GBP)</option>
                  <option value="DE">Germany / EU (EUR)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Face Value ($ / £ / €)"
                  type="number"
                  placeholder="50"
                  value={denomination}
                  onChange={(e) => setDenomination(e.target.value)}
                />
              </div>
            </div>

            <Input
              label="Card Code / Claim PIN"
              placeholder="e.g. AMZN-XXXX-XXXX-XXXX"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              hint="Demonstration: Codes are not transmitted to third parties."
            />

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-hero text-center space-y-1">
              <span className="text-xs text-purple-700 font-semibold uppercase tracking-wider">
                Guaranteed Payout (NGN)
              </span>
              <div className="text-2xl font-extrabold text-purple-950">
                {formatNaira(payoutKobo)}
              </div>
              <p className="text-[11px] text-purple-600">Rate: ₦1,450 / $1 · Zero redemption fee</p>
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={isSubmitting}
              onClick={handleRedeem}
            >
              Confirm & Redeem to Wallet (Demo)
            </Button>
          </div>
        </Card>

        {/* Previous Redemptions */}
        <Card className="p-5 space-y-3">
          <SectionHeader title="Recent Redemptions" />
          <div className="space-y-2">
            {giftCards.map((gc) => (
              <div key={gc.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-midnight-navy">
                    {gc.brand} (${gc.denomination})
                  </p>
                  <p className="text-slate-400 text-[10px]">Ref: {gc.reference} · {gc.region}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+{formatNaira(gc.payoutKobo)}</p>
                  <span className="status-success text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                    {gc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
