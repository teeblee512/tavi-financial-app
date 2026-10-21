import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';

export function GiftCardsPage() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('Amazon');
  const [amount, setAmount] = useState('50');

  const payout = (parseFloat(amount) || 0) * 1450;

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Redeem Gift Cards" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-4">
          <SectionHeader title="Instant Gift Card Liquidation" />
          <p className="text-xs text-slate-500">
            Redeem supported physical and digital gift cards directly into your NGN balance.
          </p>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Select Brand</label>
            <select className="input-field" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="Amazon">Amazon Gift Card (US / UK / DE)</option>
              <option value="Apple">Apple / iTunes (US)</option>
              <option value="GooglePlay">Google Play (US)</option>
              <option value="Steam">Steam Wallet (US)</option>
            </select>

            <Input
              label="Card Value ($ USD)"
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="p-4 bg-purple-50 rounded-xl text-center space-y-1">
              <span className="text-xs text-purple-700 font-medium">Estimated Naira Payout</span>
              <div className="text-2xl font-extrabold text-purple-900">
                ₦{payout.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-purple-600">Rate: ₦1,450 / $1</p>
            </div>

            <Button variant="primary" fullWidth onClick={() => alert('Gift card code submission simulated.')}>
              Proceed to Upload Card Code (Demo)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
