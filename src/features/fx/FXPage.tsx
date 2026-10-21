import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';

export function FXPage() {
  const navigate = useNavigate();

  // FX state
  const [amount, setAmount] = useState('100');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('NGN');

  // Rates against NGN (1 unit = X NGN)
  const ratesToNGN: Record<string, number> = {
    USD: 1600.0,
    GBP: 1987.5,
    EUR: 1714.8,
    CAD: 1180.0,
    CNY: 224.5,
    KRW: 1.18,
    NGN: 1.0,
  };

  const calculateConversion = () => {
    const val = parseFloat(amount) || 0;
    if (sourceCurrency === 'NGN') {
      const rate = ratesToNGN[targetCurrency] || 1;
      return val / rate;
    } else {
      const rate = ratesToNGN[sourceCurrency] || 1;
      return val * rate;
    }
  };

  const convertedValue = calculateConversion();

  // Section 14: Crypto Price Converter (Informational)
  const [cryptoAsset, setCryptoAsset] = useState<'BTC' | 'ETH'>('BTC');
  const [cryptoQty, setCryptoQty] = useState('0.05');

  const cryptoPricesUSD = {
    BTC: 68450,
    ETH: 2620,
  };

  const cryptoUSD = (parseFloat(cryptoQty) || 0) * cryptoPricesUSD[cryptoAsset];
  const cryptoNGN = cryptoUSD * 1600;

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="FX & Currency Tools" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* FX Calculator Card (Section 13.1) */}
        <Card className="p-5 space-y-4">
          <SectionHeader title="Multi-Currency FX Calculator" />

          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 text-xs">
            ℹ️ <span className="font-semibold">Indicative Quote:</span> Rates reflect mid-market pricing. Live conversion requires partner liquidity provider.
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="You Have"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="w-32 flex flex-col justify-end">
                <select
                  className="input-field"
                  value={sourceCurrency}
                  onChange={(e) => {
                    const newSource = e.target.value;
                    setSourceCurrency(newSource);
                    if (newSource !== 'NGN') setTargetCurrency('NGN');
                    else setTargetCurrency('USD');
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-1">
              <span className="text-slate-400 text-sm">↓</span>
            </div>

            <div className="p-4 bg-pale-mint rounded-hero text-center space-y-1 border border-mint">
              <span className="text-xs text-slate-500 font-medium">Estimated Conversion</span>
              <div className="text-2xl font-extrabold text-primary-green">
                {targetCurrency === 'NGN' ? '₦' : targetCurrency + ' '}
                {convertedValue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500">
                1 {sourceCurrency} ≈ {ratesToNGN[sourceCurrency].toLocaleString()} NGN · Decimal-safe
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={() => alert('FX Exchange order quote locked (Demo).')}>
              Request Guaranteed Rate Quote (Demo)
            </Button>
          </div>
        </Card>

        {/* Informational Crypto Price Converter (Section 14) */}
        <Card className="p-5 space-y-4">
          <SectionHeader title="Crypto Price Tracker (Informational)" />
          <div className="p-2.5 bg-blue-50 text-information text-xs rounded-xl">
            ℹ️ Informational Only: TAVI does not provide custodial crypto exchange. Indicative pricing data for market tracking.
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                value={cryptoQty}
                onChange={(e) => setCryptoQty(e.target.value)}
              />
            </div>
            <div className="w-32 flex flex-col justify-end">
              <select
                className="input-field"
                value={cryptoAsset}
                onChange={(e) => setCryptoAsset(e.target.value as any)}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-midnight-navy text-white rounded-hero space-y-1 text-center">
            <span className="text-xs text-slate-400">Indicative Market Value</span>
            <div className="text-2xl font-extrabold text-mint">
              ${cryptoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm font-semibold text-slate-300">
              ≈ ₦{cryptoNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              1 {cryptoAsset} = ${cryptoPricesUSD[cryptoAsset].toLocaleString()} USD
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
