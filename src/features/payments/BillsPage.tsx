import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { parseNairaToKobo } from '../../services/formatters';

export function BillsPage() {
  const navigate = useNavigate();
  const { addDemoTransaction, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'airtime' | 'data' | 'electricity' | 'cable_tv'>('airtime');
  const [provider, setProvider] = useState('MTN');
  const [phoneOrMeter, setPhoneOrMeter] = useState('');
  const [amount, setAmount] = useState('2000');

  const handlePay = () => {
    const kobo = parseNairaToKobo(amount) || 200000;
    addDemoTransaction({
      direction: 'debit',
      amountKobo: kobo,
      feeKobo: 0,
      currency: 'NGN',
      status: 'successful',
      category: selectedCategory,
      counterpartyName: `${provider} ${selectedCategory.toUpperCase()}`,
      narration: `Bill payment for ${phoneOrMeter || '08012345678'}`,
      reference: `BIL${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    showToast('Bill paid successfully (Demo)', 'success');
    navigate('/transactions');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Bills & Utilities" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'airtime', label: 'Airtime', icon: '📱' },
            { id: 'data', label: 'Data', icon: '🌐' },
            { id: 'electricity', label: 'Power', icon: '⚡' },
            { id: 'cable_tv', label: 'TV', icon: '📺' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id as any)}
              className={`p-3 rounded-card text-center flex flex-col items-center gap-1 border transition-all ${
                selectedCategory === item.id ? 'bg-pale-mint border-action-green text-primary-green font-bold' : 'bg-white border-border-color text-slate-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>

        <Card className="p-5 space-y-4">
          <SectionHeader title={`Pay ${selectedCategory.replace('_', ' ').toUpperCase()}`} />
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Provider / Network</label>
            <select className="input-field" value={provider} onChange={(e) => setProvider(e.target.value)}>
              {selectedCategory === 'airtime' || selectedCategory === 'data' ? (
                <>
                  <option value="MTN">MTN Nigeria</option>
                  <option value="Airtel">Airtel Nigeria</option>
                  <option value="Glo">Glo (Globacom)</option>
                  <option value="9mobile">9mobile</option>
                </>
              ) : selectedCategory === 'electricity' ? (
                <>
                  <option value="IKEDC">Ikeja Electric (IKEDC)</option>
                  <option value="EKEDC">Eko Electricity (EKEDC)</option>
                  <option value="AEDC">Abuja Electricity (AEDC)</option>
                  <option value="IBEDC">Ibadan Electricity (IBEDC)</option>
                </>
              ) : (
                <>
                  <option value="DSTV">DSTV MultiChoice</option>
                  <option value="GOTV">GOTV</option>
                  <option value="Startimes">Startimes</option>
                </>
              )}
            </select>

            <Input 
              label={selectedCategory === 'electricity' ? 'Meter Number' : selectedCategory === 'cable_tv' ? 'Smartcard / IUC' : 'Phone Number'}
              placeholder="080 0000 0000"
              value={phoneOrMeter}
              onChange={(e) => setPhoneOrMeter(e.target.value)}
            />

            <Input 
              label="Amount (NGN)"
              placeholder="2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Button variant="primary" fullWidth onClick={handlePay}>
              Pay Bill (Simulated)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
