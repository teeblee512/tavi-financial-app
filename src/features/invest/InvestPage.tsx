import { useState, useEffect, useMemo, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, SectionHeader, Button, Input } from '../../components/ui';
import { formatNaira } from '../../services/formatters';
import {
  DEMO_NGX_STOCKS,
  DEMO_TAVI_INDICES,
  DEMO_ORDER_BOOK,
  type NGXStock,
  type TAVIIndex,
} from '../../data/demoData';

export function InvestPage() {
  const navigate = useNavigate();
  const searchInputId = useId();
  const sectorSelectId = useId();
  const orderTypeSelectId = useId();
  const {
    investmentAccount,
    holdings,
    placeTrade,
    showToast,
    isInvestUnlocked,
    unlockInvest,
    lockInvest,
    watchlist,
    toggleWatchlist,
  } = useApp();

  // Authentication State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Tabs inside Invest
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'indices' | 'orders'>('overview');

  // Markets Search & Filters
  const [stockSearch, setStockSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStock, setSelectedStock] = useState<NGXStock | null>(null);

  // Selected Index Detail Modal
  const [selectedIndex, setSelectedIndex] = useState<TAVIIndex | null>(null);

  // Trade Modal
  const [tradeStock, setTradeStock] = useState<NGXStock | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeQuantity, setTradeQuantity] = useState('100');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [tradeReviewStep, setTradeReviewStep] = useState(false);

  // Dynamic NGX Market Session & Countdown (WAT: Africa/Lagos UTC+1)
  const [marketStatus, setMarketStatus] = useState<{
    isOpen: boolean;
    label: string;
    countdown: string;
    sessionText: string;
  }>({
    isOpen: false,
    label: 'Market Closed',
    countdown: '00:00:00',
    sessionText: 'Opens 9:30 AM WAT',
  });

  useEffect(() => {
    const updateMarketTime = () => {
      // Calculate current Lagos / WAT time (UTC + 1 hour)
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const watTime = new Date(utcMs + 3600000);

      const day = watTime.getDay(); // 0 = Sunday, 6 = Saturday
      const hours = watTime.getHours();
      const minutes = watTime.getMinutes();
      const seconds = watTime.getSeconds();
      const currentSeconds = hours * 3600 + minutes * 60 + seconds;

      const openSeconds = 9 * 3600 + 30 * 60; // 09:30:00 AM
      const closeSeconds = 16 * 3600; // 04:00:00 PM

      const isWeekday = day >= 1 && day <= 5;
      const isTradingHours = currentSeconds >= openSeconds && currentSeconds < closeSeconds;

      if (isWeekday && isTradingHours) {
        // Market is Open
        const remaining = closeSeconds - currentSeconds;
        const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
        const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        setMarketStatus({
          isOpen: true,
          label: 'Market Open',
          countdown: `${h}:${m}:${s} until close`,
          sessionText: 'Regular NGX Trading Session (9:30 AM – 4:00 PM WAT)',
        });
      } else {
        // Market is Closed: calculate time until next open
        let daysUntilOpen = 0;
        if (!isWeekday) {
          daysUntilOpen = day === 6 ? 2 : 1; // Sat -> Mon or Sun -> Mon
        } else if (currentSeconds >= closeSeconds) {
          daysUntilOpen = day === 5 ? 3 : 1; // Fri after close -> Mon, else tomorrow
        }

        const targetSeconds = daysUntilOpen * 86400 + openSeconds - currentSeconds;
        const targetH = Math.floor(targetSeconds / 3600).toString().padStart(2, '0');
        const targetM = Math.floor((targetSeconds % 3600) / 60).toString().padStart(2, '0');

        setMarketStatus({
          isOpen: false,
          label: 'Market Closed',
          countdown: `Opens in ${targetH}h ${targetM}m`,
          sessionText: isWeekday ? 'Next Session: 9:30 AM WAT' : 'Weekend Break (Opens Monday 9:30 AM WAT)',
        });
      }
    };

    updateMarketTime();
    const interval = setInterval(updateMarketTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered NGX Stocks
  const filteredStocks = useMemo(() => {
    return DEMO_NGX_STOCKS.filter((stock) => {
      const q = stockSearch.toLowerCase();
      const matchesSearch = stock.ticker.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q);
      const matchesSector = selectedSector === 'All' ? true : stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [stockSearch, selectedSector]);

  // Handle Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setPinError('Please enter a 4-digit PIN.');
      return;
    }
    const success = unlockInvest(pinInput);
    if (success) {
      setPinInput('');
      setPinError('');
      showToast('Brokerage workspace unlocked', 'success');
    } else {
      setPinError('Invalid PIN. Please try again.');
    }
  };

  // Trade Execution
  const handleExecuteTrade = () => {
    if (!tradeStock) return;
    const qty = parseInt(tradeQuantity, 10);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid share quantity', 'error');
      return;
    }

    const success = placeTrade(tradeStock.ticker, qty, tradeType);
    if (success) {
      showToast(
        `Successfully placed ${tradeType.toUpperCase()} order for ${qty} units of ${tradeStock.ticker} (Simulated)`,
        'success'
      );
      setTradeStock(null);
      setTradeReviewStep(false);
    } else {
      showToast(
        tradeType === 'buy'
          ? 'Insufficient available cash in investment balance'
          : 'You do not hold enough shares of this stock to sell',
        'error'
      );
    }
  };

  const tradeCostKobo = tradeStock ? (parseInt(tradeQuantity, 10) || 0) * tradeStock.priceKobo : 0;
  const statutoryFeeKobo = Math.round(tradeCostKobo * 0.0135); // 1.35% CSCS, SEC & NGX statutory charges
  const totalTradeKobo = tradeType === 'buy' ? tradeCostKobo + statutoryFeeKobo : tradeCostKobo - statutoryFeeKobo;

  // ─── Security Boundary: Locked State Screen (Phase 4 Requirement 3) ───
  if (!isInvestUnlocked) {
    return (
      <div className="flex flex-col bg-app-bg min-h-full pb-10">
        <PageHeader title="TAVI Invest" onBack={() => navigate(-1)} />
        <div className="p-5 flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full">
          <Card className="p-6 text-center space-y-4 border border-border-color bg-white shadow-sm w-full">
            <div className="w-14 h-14 bg-midnight-navy text-mint rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold text-action-green uppercase tracking-wider block">
                Protected Brokerage Boundary
              </span>
              <h3 className="text-xl font-extrabold text-midnight-navy mt-1">Unlock TAVI Invest</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Securities holdings, CSCS accounts, and portfolio valuations are protected behind dedicated authentication.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Enter 4-Digit Investment PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setPinError('');
                  }}
                  className="w-full text-center text-2xl tracking-widest py-2.5 rounded-xl bg-input-bg border border-border-color text-midnight-navy focus:outline-none focus:ring-2 focus:ring-action-green"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg font-medium">
                  {pinError}
                </div>
              )}

              <Button variant="primary" fullWidth type="submit" disabled={pinInput.length !== 4}>
                Unlock Brokerage Workspace
              </Button>
            </form>

            <p className="text-[11px] text-slate-400">
              Demo Environment: Enter any 4 digits (e.g. <strong>1234</strong>) to unlock.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Unlocked Brokerage Workspace ───
  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-12">
      <PageHeader
        title="TAVI Invest"
        onBack={() => navigate(-1)}
        rightAction={
          <button
            onClick={lockInvest}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 bg-white border border-border-color px-3 py-1.5 rounded-full transition-colors"
            title="Lock Brokerage Workspace"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Lock
          </button>
        }
      />

      <div className="p-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Subtle Market Movers Ticker (Phase 4 Requirement 12) */}
        <div className="bg-white border border-border-color rounded-xl p-2.5 shadow-2xs overflow-hidden flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 font-bold text-[10px] uppercase tracking-wider pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-action-green animate-pulse" />
            NGX Movers:
          </div>
          <div className="flex-1 overflow-x-auto flex gap-4 text-xs font-mono no-scrollbar">
            {DEMO_NGX_STOCKS.map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => setSelectedStock(stock)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <span className="font-bold text-midnight-navy">{stock.ticker}</span>
                <span className="text-slate-500">₦{(stock.priceKobo / 100).toFixed(2)}</span>
                <span className={stock.changePercent >= 0 ? 'text-action-green font-bold' : 'text-red-500 font-bold'}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* NGX Market Status & Trading Countdown Header (Phase 4 Requirement 11) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-border-color text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${marketStatus.isOpen ? 'bg-action-green' : 'bg-amber-500 animate-pulse'}`} />
            <span className="font-bold text-midnight-navy">{marketStatus.label}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{marketStatus.sessionText}</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {marketStatus.countdown}
          </div>
        </div>

        {/* Portfolio Summary Card (Phase 4 Requirement 5) */}
        <div className="bg-gradient-to-br from-midnight-navy to-slate-900 text-white p-6 rounded-hero space-y-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Total Brokerage Portfolio Value
              </span>
              <h2 className="text-3xl font-extrabold text-mint mt-1">
                {formatNaira(investmentAccount?.portfolioValueKobo || 0)}
              </h2>
            </div>
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-mint font-semibold">
              +12.4% Overall Return
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
              <span className="text-slate-400">Unrealised Gain</span>
              <p className="font-semibold text-green-400 text-sm mt-0.5">
                +{formatNaira(investmentAccount?.unrealisedGainKobo || 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Available Cash</span>
              <p className="font-semibold text-mint text-sm mt-0.5">
                {formatNaira(investmentAccount?.cashAvailableKobo || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'overview', label: 'Holdings & Portfolio' },
            { id: 'markets', label: 'NGX Equities Market' },
            { id: 'indices', label: 'TAVI Index Family' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

        {/* TAB 1: OVERVIEW & HOLDINGS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <SectionHeader
              title="Your Nigerian Equities Portfolio"
              action={
                <span className="text-xs text-slate-400 font-mono">
                  CSCS: 009284102 | CHN: C184920
                </span>
              }
            />

            <div className="space-y-3">
              {holdings.map((h) => {
                const holdingValue = h.quantity * h.currentPriceKobo;
                const pnl = holdingValue - h.quantity * h.averagePriceKobo;
                const isWatching = watchlist.includes(h.ticker);

                return (
                  <Card key={h.id} className="p-4 space-y-3 border border-border-color bg-white hover:shadow-xs transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                          {h.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-midnight-navy text-sm">{h.ticker}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                              NGX
                            </span>
                            <button
                              onClick={() => toggleWatchlist(h.ticker)}
                              className={`text-xs ${isWatching ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                              title={isWatching ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                              ★
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">{h.companyName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {h.quantity} units · Avg ₦{(h.averagePriceKobo / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-midnight-navy text-sm">{formatNaira(holdingValue)}</p>
                        <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-action-green' : 'text-red-500'}`}>
                          {pnl >= 0 ? '+' : ''}{formatNaira(pnl)}
                        </p>
                        <p className="text-[10px] text-slate-400">₦{(h.currentPriceKobo / 100).toFixed(2)} / share</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border-color">
                      <button
                        onClick={() => {
                          const stock = DEMO_NGX_STOCKS.find((s) => s.ticker === h.ticker);
                          if (stock) {
                            setTradeStock(stock);
                            setTradeType('buy');
                          }
                        }}
                        className="flex-1 py-1.5 bg-pale-mint text-primary-green hover:bg-mint text-xs font-bold rounded-lg transition-colors"
                      >
                        Buy More
                      </button>
                      <button
                        onClick={() => {
                          const stock = DEMO_NGX_STOCKS.find((s) => s.ticker === h.ticker);
                          if (stock) {
                            setTradeStock(stock);
                            setTradeType('sell');
                          }
                        }}
                        className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
                      >
                        Sell Shares
                      </button>
                      <button
                        onClick={() => {
                          const stock = DEMO_NGX_STOCKS.find((s) => s.ticker === h.ticker);
                          if (stock) setSelectedStock(stock);
                        }}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-border-color"
                      >
                        Order Book & Details →
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: NGX EQUITIES MARKET */}
        {activeTab === 'markets' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  id={searchInputId}
                  placeholder="Search ticker (e.g. DANGCEM) or company..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                />
              </div>
              <select
                id={sectorSelectId}
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="input-field max-w-[180px] text-xs"
              >
                <option value="All">All Sectors</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Industrial Goods">Industrial Goods</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Oil & Gas">Oil & Gas</option>
                <option value="Consumer Goods">Consumer Goods</option>
              </select>
            </div>

            <div className="card overflow-hidden divide-y divide-border-color bg-white border border-border-color">
              {filteredStocks.map((stock) => {
                const isWatching = watchlist.includes(stock.ticker);
                return (
                  <div key={stock.ticker} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs"
                        style={{ backgroundColor: stock.logoBg }}
                      >
                        {stock.logoText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-midnight-navy text-sm">{stock.ticker}</h4>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">{stock.sector}</span>
                          <button
                            onClick={() => toggleWatchlist(stock.ticker)}
                            className={`text-xs ml-1 ${isWatching ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                          >
                            ★
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">{stock.name}</p>
                        <p className="text-[10px] text-slate-400">Vol: {stock.volume} · MktCap: {stock.mktCap}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-midnight-navy text-sm">₦{(stock.priceKobo / 100).toFixed(2)}</p>
                        <p className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-action-green' : 'text-red-500'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="primary"
                          onClick={() => {
                            setTradeStock(stock);
                            setTradeType('buy');
                          }}
                        >
                          Trade
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedStock(stock)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TAVI INDEX FAMILY (Phase 4 Requirement 10) */}
        {activeTab === 'indices' && (
          <div className="space-y-4">
            <div className="p-3 bg-pale-mint/70 rounded-xl border border-mint text-xs text-slate-700">
              <span className="font-bold text-primary-green">TAVI Proprietary Index Family:</span> Benchmark indicators tracking Nigerian equities liquidity, factors, and market capitalization segments.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEMO_TAVI_INDICES.map((idx) => (
                <div
                  key={idx.code}
                  className="card p-4 flex flex-col justify-between border border-border-color bg-white hover:border-action-green transition-colors cursor-pointer"
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-extrabold text-midnight-navy">{idx.code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${idx.changePercent >= 0 ? 'bg-green-100 text-action-green' : 'bg-red-100 text-red-600'}`}>
                        {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 truncate">{idx.name}</p>
                    <p className="text-xl font-extrabold text-midnight-navy mt-2">
                      {idx.level.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border-color mt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span>{idx.constituentsCount} Stocks</span>
                    <span className="text-action-green font-semibold">View Methodology →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Company Details & Order Book Modal (Phase 4 Requirement 6 & 13) ─── */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-xl w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-2 border-b">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm"
                  style={{ backgroundColor: selectedStock.logoBg }}
                >
                  {selectedStock.logoText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-midnight-navy">{selectedStock.ticker}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">NGX</span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedStock.name} · {selectedStock.sector}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* Price & Returns */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-border-color text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">LATEST PRICE</span>
                <strong className="text-midnight-navy text-sm">₦{(selectedStock.priceKobo / 100).toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DAILY CHANGE</span>
                <strong className={selectedStock.changePercent >= 0 ? 'text-action-green text-sm' : 'text-red-600 text-sm'}>
                  {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">P/E RATIO</span>
                <strong className="text-slate-800 text-sm">{selectedStock.peRatio || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DIVIDEND YIELD</span>
                <strong className="text-action-green text-sm">{selectedStock.dividendYield || 'N/A'}</strong>
              </div>
            </div>

            {/* Order Book Section (Phase 4 Requirement 13) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-midnight-navy uppercase tracking-wider">
                  Level 2 NGX Order Book (Live Depth)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Spread: ₦{(DEMO_ORDER_BOOK.spreadKobo / 100).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Bids */}
                <div className="bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                  <div className="flex justify-between text-[10px] font-bold text-primary-green uppercase mb-1">
                    <span>Qty (Bids)</span>
                    <span>Bid Price</span>
                  </div>
                  {DEMO_ORDER_BOOK.bids.map((b, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-slate-700">
                      <span>{b.quantity.toLocaleString()}</span>
                      <span className="font-bold text-action-green">₦{(b.priceKobo / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Offers */}
                <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                  <div className="flex justify-between text-[10px] font-bold text-red-600 uppercase mb-1">
                    <span>Offer Price</span>
                    <span>Qty (Offers)</span>
                  </div>
                  {DEMO_ORDER_BOOK.offers.map((o, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-slate-700">
                      <span className="font-bold text-red-600">₦{(o.priceKobo / 100).toFixed(2)}</span>
                      <span>{o.quantity.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Educational: <strong>Bid</strong> is what buyers are offering; <strong>Offer</strong> is what sellers ask. Trades execute when matched.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setTradeStock(selectedStock);
                  setTradeType('buy');
                  setSelectedStock(null);
                }}
              >
                Place Buy Order
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setTradeStock(selectedStock);
                  setTradeType('sell');
                  setSelectedStock(null);
                }}
              >
                Place Sell Order
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Index Methodology Detail Modal (Phase 4 Requirement 10.2) ─── */}
      {selectedIndex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-lg w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">Index Governance</span>
                <h3 className="text-base font-extrabold text-midnight-navy mt-0.5">{selectedIndex.name} ({selectedIndex.code})</h3>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">{selectedIndex.description}</p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-border-color">
                <div className="flex justify-between">
                  <span className="text-slate-400">Weighting Methodology:</span>
                  <span className="font-bold text-midnight-navy">{selectedIndex.weighting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Constituents Count:</span>
                  <span className="font-bold text-midnight-navy">{selectedIndex.constituentsCount} NGX Equities</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rebalancing Schedule:</span>
                  <span className="font-medium text-slate-700">Semi-annual (June & December)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculation Engine:</span>
                  <span className="font-medium text-slate-700">TAVI Quantitative Index Analytics (Simulated)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Notice: TAVI indices are benchmark indicators. Direct purchasing of index portfolios requires separate regulated asset management products.
              </p>
            </div>

            <Button variant="outline" fullWidth onClick={() => setSelectedIndex(null)}>
              Close Index Details
            </Button>
          </Card>
        </div>
      )}

      {/* ─── Order Placement & Trade Modal (Phase 4 Requirement 9) ─── */}
      {tradeStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-primary-green">
                  {tradeType.toUpperCase()} ORDER
                </span>
                <h3 className="font-extrabold text-base text-midnight-navy mt-0.5">
                  {tradeStock.ticker} — {tradeStock.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setTradeStock(null);
                  setTradeReviewStep(false);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            {!tradeReviewStep ? (
              <div className="space-y-3">
                {/* Buy / Sell direction */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      tradeType === 'buy' ? 'bg-action-green text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Buy Shares
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      tradeType === 'sell' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Sell Shares
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label htmlFor={orderTypeSelectId} className="text-slate-600 font-semibold mb-1 block">Order Type</label>
                    <select
                      id={orderTypeSelectId}
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as any)}
                      className="input-field"
                    >
                      <option value="market">Market Order</option>
                      <option value="limit">Limit Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold mb-1 block">Units / Quantity</label>
                    <input
                      type="number"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      className="input-field"
                      placeholder="100"
                    />
                  </div>
                </div>

                {orderType === 'limit' && (
                  <Input
                    label="Limit Price (NGN per share)"
                    type="number"
                    placeholder={(tradeStock.priceKobo / 100).toFixed(2)}
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                )}

                {/* Calculation breakdown */}
                <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Share Price:</span>
                    <span className="font-semibold text-midnight-navy">₦{(tradeStock.priceKobo / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Value:</span>
                    <span className="font-bold text-midnight-navy">{formatNaira(tradeCostKobo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SEC / NGX / CSCS Fee (1.35%):</span>
                    <span className="font-medium text-slate-600">{formatNaira(statutoryFeeKobo)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border-color">
                    <span className="font-bold text-midnight-navy">Estimated Total:</span>
                    <span className="font-extrabold text-primary-green">{formatNaira(totalTradeKobo)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  disabled={!tradeQuantity || parseInt(tradeQuantity, 10) <= 0}
                  onClick={() => setTradeReviewStep(true)}
                >
                  Review {tradeType.toUpperCase()} Order
                </Button>
              </div>
            ) : (
              /* Review step */
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <span className="font-bold">⚠️ Order Execution Review</span>
                  <p className="text-[11px] leading-relaxed">
                    Confirm that you wish to submit this {orderType.toUpperCase()} order for {tradeQuantity} units of {tradeStock.ticker}. Trades are recorded in demo simulation mode.
                  </p>
                </div>

                <div className="space-y-2 text-xs border-y py-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direction:</span>
                    <span className="font-bold uppercase text-midnight-navy">{tradeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stock:</span>
                    <span className="font-bold text-midnight-navy">{tradeStock.ticker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-bold text-midnight-navy">{tradeQuantity} Shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Settlement:</span>
                    <span className="font-extrabold text-primary-green text-sm">{formatNaira(totalTradeKobo)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" fullWidth onClick={handleExecuteTrade}>
                    Confirm & Submit Order
                  </Button>
                  <Button variant="ghost" fullWidth onClick={() => setTradeReviewStep(false)}>
                    Back
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
