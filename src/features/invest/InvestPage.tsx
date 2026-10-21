import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, SectionHeader, Button } from '../../components/ui';
import { formatNaira } from '../../services/formatters';

export function InvestPage() {
  const navigate = useNavigate();
  const { investmentAccount, holdings } = useApp();

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Investments & Wealth" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        {/* Portfolio Summary */}
        <div className="bg-midnight-navy text-white p-6 rounded-hero space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Portfolio Value</span>
              <h2 className="text-3xl font-extrabold text-mint mt-1">
                {formatNaira(investmentAccount?.portfolioValueKobo || 0)}
              </h2>
            </div>
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-mint">
              +12.4% All-time
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400">Total Invested</span>
              <p className="font-semibold text-white text-sm">{formatNaira(investmentAccount?.investedAmountKobo || 0)}</p>
            </div>
            <div>
              <span className="text-slate-400">Cash Available</span>
              <p className="font-semibold text-white text-sm">{formatNaira(investmentAccount?.cashAvailableKobo || 0)}</p>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <SectionHeader title="Your Holdings (Equities & Funds)" />
        <div className="space-y-3">
          {holdings.map((h) => (
            <Card key={h.id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-midnight-navy">{h.ticker}</h4>
                <p className="text-xs text-slate-500">{h.companyName}</p>
                <p className="text-xs text-slate-400 mt-1">{h.quantity} units • Avg ₦{(h.averagePriceKobo / 100).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-midnight-navy">{formatNaira(h.quantity * h.currentPriceKobo)}</p>
                <p className="text-xs text-success font-semibold">
                  ₦{(h.currentPriceKobo / 100).toFixed(2)} / unit
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="primary" fullWidth onClick={() => alert('Investment market order simulated.')}>
          Explore Nigerian Stocks & Eurobonds
        </Button>
      </div>
    </div>
  );
}
