import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { useClipboard } from '../../hooks/useClipboard';
import {
  DEMO_CRYPTO_ASSETS,
  type CryptoAssetItem,
} from '../../data/demoData';

export function FXPage() {
  const navigate = useNavigate();
  const sourceCurrencySelectId = useId();
  const targetCurrencySelectId = useId();
  const cryptoAssetSelectId = useId();
  const { multiCurrencyAccounts, showToast } = useApp();
  const { copyToClipboard } = useClipboard();

  const [activeTab, setActiveTab] = useState<'convert' | 'currencies' | 'card' | 'crypto'>('convert');

  // ─── Fiat FX State ───
  const [sourceAmount, setSourceAmount] = useState('100');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('NGN');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteConfirmed, setQuoteConfirmed] = useState(false);

  // Decimal-safe rates to NGN (1 unit of currency = X NGN)
  const ratesToNGN: Record<string, number> = {
    USD: 1600.0,
    GBP: 1987.5,
    EUR: 1714.8,
    CAD: 1180.0,
    CNY: 224.5,
    NGN: 1.0,
  };

  const calculateConversion = () => {
    const val = parseFloat(sourceAmount) || 0;
    if (sourceCurrency === targetCurrency) return val;
    if (sourceCurrency === 'NGN') {
      const rate = ratesToNGN[targetCurrency] || 1;
      return val / rate;
    } else if (targetCurrency === 'NGN') {
      const rate = ratesToNGN[sourceCurrency] || 1;
      return val * rate;
    } else {
      // Cross currency conversion via NGN base
      const ngnValue = val * (ratesToNGN[sourceCurrency] || 1);
      return ngnValue / (ratesToNGN[targetCurrency] || 1);
    }
  };

  const convertedValue = calculateConversion();
  const currentRate = (ratesToNGN[sourceCurrency] || 1) / (ratesToNGN[targetCurrency] || 1);

  const handleSwapCurrencies = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  // ─── Global Card State ───
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');

  // ─── Digital Assets State ───
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAssetItem>(DEMO_CRYPTO_ASSETS[0]);
  const [cryptoQty, setCryptoQty] = useState('0.05');

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-12">
      <PageHeader title="TAVI Global & FX" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Navigation Tabs (Phase 5 Requirement 4) */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'convert', label: '💱 Fiat Converter' },
            { id: 'currencies', label: '🌍 My Currencies' },
            { id: 'card', label: '💳 Global Card' },
            { id: 'crypto', label: '🪙 Digital Assets' },
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

        {/* ─── TAB 1: FIAT CURRENCY CONVERTER ─── */}
        {activeTab === 'convert' && (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <Card className="p-5 space-y-4 border border-border-color bg-white shadow-sm">
              <SectionHeader title="Multi-Currency FX Exchange" />

              <div className="p-2.5 bg-pale-mint/70 border border-mint rounded-xl text-xs text-slate-700 space-y-0.5">
                <span className="font-bold text-primary-green">Indicative Mid-Market Quote:</span>
                <p className="text-[11px] text-slate-500">Quotes update in real-time. Transparent fees with zero hidden markups.</p>
              </div>

              <div className="space-y-3">
                {/* Source Input */}
                <div>
                  <label htmlFor={sourceCurrencySelectId} className="text-xs font-semibold text-slate-700 mb-1 block">You Convert</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="100"
                        value={sourceAmount}
                        onChange={(e) => setSourceAmount(e.target.value)}
                      />
                    </div>
                    <select
                      id={sourceCurrencySelectId}
                      className="input-field w-32 text-xs font-bold"
                      value={sourceCurrency}
                      onChange={(e) => setSourceCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="CNY">CNY (¥)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>
                </div>

                {/* Swap Control */}
                <div className="flex justify-center -my-1">
                  <button
                    type="button"
                    onClick={handleSwapCurrencies}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-transform active:rotate-180"
                    title="Swap source and target currencies"
                  >
                    ⇅
                  </button>
                </div>

                {/* Target Output */}
                <div>
                  <label htmlFor={targetCurrencySelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Recipient Gets (Estimated)</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="input-field bg-slate-50 font-bold text-base text-midnight-navy flex items-center">
                        {convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <select
                      id={targetCurrencySelectId}
                      className="input-field w-32 text-xs font-bold"
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value)}
                    >
                      <option value="NGN">NGN (₦)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="CNY">CNY (¥)</option>
                    </select>
                  </div>
                </div>

                {/* Exchange Rate Card */}
                <div className="p-3.5 bg-pale-mint/50 rounded-2xl border border-mint text-center space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Conversion Rate</span>
                  <div className="text-xl font-extrabold text-primary-green">
                    1 {sourceCurrency} = {currentRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {targetCurrency}
                  </div>
                  <p className="text-[10px] text-slate-400">Timestamp: {new Date().toLocaleTimeString('en-NG')} · Partner Liquid Feed</p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowQuoteModal(true)}
                  disabled={!sourceAmount || parseFloat(sourceAmount) <= 0}
                >
                  Review Guaranteed FX Rate Quote
                </Button>
              </div>
            </Card>

            {/* Guaranteed Rate Quote Modal (Replacing alert) */}
            {showQuoteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
                <Card className="max-w-md w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="font-bold text-base text-midnight-navy">Lock FX Conversion Quote</h3>
                    <button
                      onClick={() => {
                        setShowQuoteModal(false);
                        setQuoteConfirmed(false);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                    >
                      ✕
                    </button>
                  </div>

                  {!quoteConfirmed ? (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-blue-50 text-blue-700 text-xs rounded-xl border border-blue-200">
                        ⏱️ Guaranteed quote locked for <strong>04:59</strong> minutes.
                      </div>

                      <div className="space-y-2 text-xs border-y py-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Source Amount:</span>
                          <span className="font-bold text-midnight-navy">{parseFloat(sourceAmount).toFixed(2)} {sourceCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Guaranteed Rate:</span>
                          <span className="font-bold text-midnight-navy">1 {sourceCurrency} = {currentRate.toFixed(2)} {targetCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transfer Fee:</span>
                          <span className="font-medium text-action-green">₦0.00 (Zero Fee Promotion)</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t">
                          <span className="font-bold text-midnight-navy">You Receive:</span>
                          <span className="font-extrabold text-primary-green text-base">
                            {convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} {targetCurrency}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={() => {
                            setQuoteConfirmed(true);
                            showToast('Conversion order executed (Simulated)', 'success');
                          }}
                        >
                          Confirm & Convert (Demo)
                        </Button>
                        <Button
                          variant="ghost"
                          fullWidth
                          onClick={() => setShowQuoteModal(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-2 animate-fade-in">
                      <div className="w-14 h-14 bg-pale-mint rounded-full flex items-center justify-center mx-auto text-action-green text-xl font-bold">
                        ✓
                      </div>
                      <h4 className="font-bold text-base text-midnight-navy">FX Conversion Complete!</h4>
                      <p className="text-xs text-slate-500">
                        {parseFloat(sourceAmount).toFixed(2)} {sourceCurrency} converted to {convertedValue.toFixed(2)} {targetCurrency}.
                      </p>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => {
                          setShowQuoteModal(false);
                          setQuoteConfirmed(false);
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: MY CURRENCIES & INTERNATIONAL ACCOUNTS (Phase 5 Part C) ─── */}
        {activeTab === 'currencies' && (
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-border-color flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-midnight-navy">Global Multi-Currency Wallets</span>
                <p className="text-slate-400 text-[11px]">Receive, hold and convert foreign currencies with native bank details.</p>
              </div>
              <span className="text-[10px] bg-pale-mint text-primary-green font-bold px-2 py-0.5 rounded-full">
                4 Active Currencies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {multiCurrencyAccounts.map((acct) => (
                <Card key={acct.currency} className="p-5 border border-border-color bg-white space-y-3 hover:shadow-xs transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {acct.symbol}
                      </div>
                      <div>
                        <h4 className="font-bold text-midnight-navy text-sm">{acct.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{acct.currency} Account</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-action-green font-bold px-2 py-0.5 rounded-full uppercase">
                      {acct.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Available Balance</span>
                    <p className="text-2xl font-extrabold text-midnight-navy mt-0.5">
                      {acct.symbol}
                      {acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {acct.accountNumber && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-border-color text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Institution:</span>
                        <span className="font-sans font-medium text-slate-700 text-right">{acct.bankOrIban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Account No / IBAN:</span>
                        <span className="font-bold text-midnight-navy">{acct.accountNumber}</span>
                      </div>
                      {acct.sortOrRouting && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Routing / Sort Code:</span>
                          <span className="font-bold text-midnight-navy">{acct.sortOrRouting}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => {
                        if (acct.accountNumber) {
                          copyToClipboard(acct.accountNumber, `${acct.currency} account details copied`);
                        }
                      }}
                    >
                      Copy Details
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setSourceCurrency(acct.currency);
                        setActiveTab('convert');
                      }}
                    >
                      Convert
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: TAVI GLOBAL CARD CONCEPT (Phase 5 Part D) ─── */}
        {activeTab === 'card' && (
          <div className="max-w-lg mx-auto w-full space-y-4">
            {/* Card Format Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCardType('virtual')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  cardType === 'virtual' ? 'bg-deep-emerald text-white border-deep-emerald' : 'bg-white text-slate-600 border-border-color'
                }`}
              >
                Virtual Card
              </button>
              <button
                type="button"
                onClick={() => setCardType('physical')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  cardType === 'physical' ? 'bg-deep-emerald text-white border-deep-emerald' : 'bg-white text-slate-600 border-border-color'
                }`}
              >
                Physical Card (Concept)
              </button>
            </div>

            {/* Card Mockup */}
            <div
              className={`p-6 rounded-hero text-white space-y-6 shadow-xl transition-all duration-300 ${
                isCardFrozen
                  ? 'bg-gradient-to-br from-slate-700 to-slate-900 opacity-75'
                  : 'bg-gradient-to-br from-deep-emerald via-emerald to-action-green'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-mint uppercase">TAVI GLOBAL</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold capitalize">
                  {cardType} Card
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-white/60 font-mono tracking-wider">CARD NUMBER</span>
                <p className="font-mono text-xl tracking-widest font-extrabold">
                  {isCardFrozen ? '•••• •••• •••• ••••' : '5399  8412  9021  4021'}
                </p>
              </div>

              <div className="flex justify-between items-end text-xs">
                <div>
                  <span className="text-[9px] text-white/60 uppercase block">Cardholder</span>
                  <p className="font-bold tracking-wide">AMARA OKONKWO</p>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 uppercase block">Expires</span>
                  <p className="font-mono font-bold">08/29</p>
                </div>
                <div className="text-xl font-bold italic tracking-tighter">Mastercard</div>
              </div>
            </div>

            {/* Controls */}
            <Card className="p-5 space-y-4 border border-border-color bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-midnight-navy">Freeze Card</h4>
                  <p className="text-xs text-slate-500">Temporarily disable all online and ATM spending</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCardFrozen(!isCardFrozen);
                    showToast(isCardFrozen ? 'Card unfrozen' : 'Card frozen for safety', 'info');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    isCardFrozen ? 'bg-red-500 justify-end' : 'bg-action-green justify-start'
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="pt-3 border-t space-y-2 text-xs text-slate-600">
                <span className="font-bold text-midnight-navy block">ATM & Global Spending Limits</span>
                <div className="flex justify-between py-1 border-b">
                  <span>Daily ATM Withdrawal Limit:</span>
                  <strong className="text-midnight-navy">$1,000.00 / ₦1,500,000</strong>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Online POS Spending Limit:</span>
                  <strong className="text-midnight-navy">$5,000.00 / ₦7,500,000</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Foreign Transaction Fee:</span>
                  <strong className="text-action-green">0% (Interbank settlement)</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                ℹ️ Card Program Concept: TAVI cards will be issued in partnership with licensed partner commercial banks and card networks.
              </div>
            </Card>
          </div>
        )}

        {/* ─── TAB 4: TAVI DIGITAL ASSETS (SEPARATE CRYPTO EXPERIENCE) ─── */}
        {activeTab === 'crypto' && (
          <div className="space-y-4">
            {/* Regulatory Notice (Phase 5 Requirement 7) */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold block">🛡️ TAVI Digital Assets Regulatory Disclaimer:</span>
              <p className="text-[11px] leading-relaxed">
                Cryptocurrency prices are indicative market rates and strictly separated from official fiat exchange operations. TAVI does not provide custodial trading services without certified regulatory licensing.
              </p>
            </div>

            {/* Crypto Tracker Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEMO_CRYPTO_ASSETS.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedCrypto(asset)}
                  className={`card p-4 border transition-all cursor-pointer ${
                    selectedCrypto.id === asset.id
                      ? 'border-action-green bg-pale-mint/30 shadow-xs'
                      : 'border-border-color bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-extrabold text-midnight-navy text-sm">{asset.symbol}</h4>
                      <p className="text-xs text-slate-500">{asset.name}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        asset.change24h >= 0 ? 'bg-green-100 text-action-green' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </span>
                  </div>

                  <p className="text-xl font-extrabold text-midnight-navy">
                    ${asset.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ≈ ₦{(asset.priceUsd * 1600).toLocaleString('en-NG', { maximumFractionDigits: 0 })} NGN
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Crypto Details & Network Deposit Workflow (Phase 5 Requirement 8) */}
            <Card className="p-5 space-y-4 border border-border-color bg-white">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Network-Aware Transfer</span>
                  <h3 className="font-extrabold text-base text-midnight-navy mt-0.5">
                    {selectedCrypto.name} ({selectedCrypto.symbol})
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-midnight-navy">
                  1 {selectedCrypto.symbol} = ${selectedCrypto.priceUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-700 mb-1.5 block">Supported Blockchain Networks:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrypto.supportedNetworks.map((net) => (
                      <span key={net} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-border-color">
                        {net}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-border-color text-xs space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Deposit Requirement</span>
                  <p className="text-slate-700 leading-relaxed">{selectedCrypto.depositNotice}</p>
                </div>

                {/* Informational Calculator */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Crypto Amount</label>
                    <Input
                      type="number"
                      value={cryptoQty}
                      onChange={(e) => setCryptoQty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={cryptoAssetSelectId} className="text-xs font-semibold text-slate-600 mb-1 block">Selected Asset</label>
                    <select
                      id={cryptoAssetSelectId}
                      className="input-field"
                      value={selectedCrypto.id}
                      onChange={(e) => {
                        const found = DEMO_CRYPTO_ASSETS.find((a) => a.id === e.target.value);
                        if (found) setSelectedCrypto(found);
                      }}
                    >
                      {DEMO_CRYPTO_ASSETS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-midnight-navy text-white rounded-xl text-center space-y-1">
                  <span className="text-slate-400 text-xs">Indicative Fiat Valuation</span>
                  <p className="text-xl font-extrabold text-mint">
                    ${((parseFloat(cryptoQty) || 0) * selectedCrypto.priceUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </p>
                  <p className="text-xs text-slate-300">
                    ≈ ₦{((parseFloat(cryptoQty) || 0) * selectedCrypto.priceUsd * 1600).toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
