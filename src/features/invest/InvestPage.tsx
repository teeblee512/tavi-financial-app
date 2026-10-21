import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, SectionHeader, Button, Input } from '../../components/ui';
import { formatNaira } from '../../services/formatters';
import type { Holding } from '../../types';

export function InvestPage() {
  const navigate = useNavigate();
  const { investmentAccount, holdings, placeTrade, showToast } = useApp();

  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('100');

  const handleOpenTrade = (holding: Holding, type: 'buy' | 'sell') => {
    setSelectedHolding(holding);
    setTradeType(type);
    setQuantity('100');
  };

  const handleExecuteTrade = () => {
    if (!selectedHolding) return;
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid share quantity', 'error');
      return;
    }

    const success = placeTrade(selectedHolding.ticker, qty, tradeType);
    if (success) {
      showToast(
        `Successfully placed ${tradeType.toUpperCase()} order for ${qty} units of ${selectedHolding.ticker} (Simulated)`,
        'success'
      );
      setSelectedHolding(null);
    } else {
      showToast(
        tradeType === 'buy'
          ? 'Insufficient available cash in brokerage balance'
          : 'You do not own enough units of this stock',
        'error'
      );
    }
  };

  const tradeCostKobo = selectedHolding ? (parseInt(quantity, 10) || 0) * selectedHolding.currentPriceKobo : 0;
  const estimatedFeeKobo = Math.round(tradeCostKobo * 0.0135); // 1.35% SEC/NGX/CSCS brokerage fee

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Investments & Brokerage" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        {/* Portfolio Summary Card (Section 12.1) */}
        <div className="bg-midnight-navy text-white p-6 rounded-hero space-y-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Total Portfolio Value
              </span>
              <h2 className="text-3xl font-extrabold text-mint mt-1">
                {formatNaira(investmentAccount?.portfolioValueKobo || 0)}
              </h2>
            </div>
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-mint font-semibold">
              +12.4% All-time (NGX)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400">Invested Capital</span>
              <p className="font-semibold text-white text-sm mt-0.5">
                {formatNaira(investmentAccount?.investedAmountKobo || 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Unrealised P&L</span>
              <p className="font-semibold text-green-400 text-sm mt-0.5">
                +{formatNaira(investmentAccount?.unrealisedGainKobo || 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Cash to Invest</span>
              <p className="font-semibold text-mint text-sm mt-0.5">
                {formatNaira(investmentAccount?.cashAvailableKobo || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800 space-y-1">
          <span className="font-bold">⚠️ Regulated Service Notice (Rule 12.3):</span>
          <p className="text-[11px] leading-relaxed">
            Investment and brokerage accounts are kept strictly separate from the everyday spending wallet. 
            All securities trades are executed in prototype demonstration mode with real NGX price quotes.
          </p>
        </div>

        {/* Holdings List with Trade Actions */}
        <SectionHeader title="Your Nigerian Equities (NGX)" />
        <div className="space-y-3">
          {holdings.map((h) => {
            const holdingValue = h.quantity * h.currentPriceKobo;
            const pnl = holdingValue - h.quantity * h.averagePriceKobo;
            return (
              <Card key={h.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-midnight-navy">{h.ticker}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {h.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{h.companyName}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {h.quantity} units · Avg ₦{(h.averagePriceKobo / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-midnight-navy">{formatNaira(holdingValue)}</p>
                    <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-success' : 'text-error'}`}>
                      {pnl >= 0 ? '+' : ''}{formatNaira(pnl)}
                    </p>
                    <p className="text-[10px] text-slate-400">₦{(h.currentPriceKobo / 100).toFixed(2)} / unit</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border-color">
                  <button
                    onClick={() => handleOpenTrade(h, 'buy')}
                    className="flex-1 py-1.5 bg-pale-mint text-primary-green hover:bg-mint text-xs font-bold rounded-btn transition-colors"
                  >
                    Buy More
                  </button>
                  <button
                    onClick={() => handleOpenTrade(h, 'sell')}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-btn transition-colors"
                  >
                    Sell Shares
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trade Modal */}
      {selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-midnight-navy">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedHolding.ticker}
              </h3>
              <button
                onClick={() => setSelectedHolding(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-input-bg rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Stock:</span>
                <span className="font-semibold text-midnight-navy">{selectedHolding.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Market Price:</span>
                <span className="font-semibold text-midnight-navy">₦{(selectedHolding.currentPriceKobo / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available Brokerage Cash:</span>
                <span className="font-semibold text-primary-green">{formatNaira(investmentAccount?.cashAvailableKobo || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currently Owned:</span>
                <span className="font-semibold text-midnight-navy">{selectedHolding.quantity} units</span>
              </div>
            </div>

            <Input
              label="Number of Shares"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div className="border-t border-border-color pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Consideration:</span>
                <span className="font-bold text-midnight-navy">{formatNaira(tradeCostKobo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statutory SEC/NGX Fees (1.35%):</span>
                <span>{formatNaira(estimatedFeeKobo)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-midnight-navy pt-1 border-t">
                <span>Total Settlement:</span>
                <span>{formatNaira(tradeCostKobo + (tradeType === 'buy' ? estimatedFeeKobo : -estimatedFeeKobo))}</span>
              </div>
            </div>

            <Button
              variant={tradeType === 'buy' ? 'primary' : 'danger'}
              fullWidth
              onClick={handleExecuteTrade}
            >
              Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'} (Simulated)
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
