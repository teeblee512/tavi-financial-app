import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';

export function FXPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USD');

  const rates: Record<string, number> = {
    USD: 1600,
    GBP: 1987.5,
    EUR: 1714.8,
    CAD: 1180,
  };

  const converted = (parseFloat(amount) || 0) * (rates[currency] || 1600);

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="FX & Currency Converter" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-4">
          <SectionHeader title="Real-Time Indicative Converter" />
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg">
            ⚠️ Indicative Rate: Actual conversion requires verified partner settlement.
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="You Send"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="w-28 flex flex-col justify-end">
              <select className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-pale-mint rounded-hero text-center space-y-1">
            <span className="text-xs text-slate-500 font-medium">Estimated Naira Payout</span>
            <div className="text-2xl font-extrabold text-primary-green">
              ₦{converted.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              1 {currency} = ₦{rates[currency].toLocaleString()} NGN
            </p>
          </div>

          <Button variant="primary" fullWidth onClick={() => alert('FX order simulated.')}>
            Convert & Lock Rate (Demo)
          </Button>
        </Card>
      </div>
    </div>
  );
}
