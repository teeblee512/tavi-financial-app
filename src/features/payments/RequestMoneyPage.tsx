import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { useClipboard } from '../../hooks/useClipboard';
import { formatNaira, parseNairaToKobo } from '../../services/formatters';

export function RequestMoneyPage() {
  const navigate = useNavigate();
  const networkSelectId = useId();
  const dataPackageSelectId = useId();
  const { copyToClipboard } = useClipboard();
  const { moneyRequests, createMoneyRequest, beneficiaries, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'tavi_user' | 'payment_link'>('tavi_user');
  const [requestType, setRequestType] = useState<'money' | 'airtime' | 'data'>('money');

  // Form states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('5000');
  const [note, setNote] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [dataPackage, setDataPackage] = useState('3GB Monthly (₦1,500)');

  // Step flow
  const [isReviewing, setIsReviewing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const DATA_PACKAGES: Record<string, string[]> = {
    MTN: ['1.5GB Monthly (₦1,000)', '3GB Monthly (₦1,500)', '10GB Monthly (₦3,500)', '20GB Monthly (₦6,000)'],
    Airtel: ['1.5GB Monthly (₦1,000)', '3GB Monthly (₦1,500)', '10GB Monthly (₦3,000)', '25GB Monthly (₦6,500)'],
    Glo: ['2.5GB Monthly (₦1,000)', '5.8GB Monthly (₦2,000)', '14GB Monthly (₦4,000)'],
    '9mobile': ['2GB Monthly (₦1,200)', '4.5GB Monthly (₦2,000)', '11GB Monthly (₦4,000)'],
  };

  const handleSelectContact = (name: string, phone: string) => {
    setRecipient(`${name} (${phone})`);
  };

  const handleSubmitRequest = () => {
    const kobo = parseNairaToKobo(amount) || 0;
    const req = createMoneyRequest({
      type: requestType,
      recipientIdentifier: recipient || '0123456789',
      recipientName: recipient ? recipient.split(' (')[0] : 'TAVI User',
      amountKobo: requestType === 'money' ? kobo : undefined,
      network: requestType !== 'money' ? network : undefined,
      dataPackage: requestType === 'data' ? dataPackage : undefined,
      note: note.trim() || undefined,
      status: 'pending',
    });

    setIsReviewing(false);
    showToast(`Request sent to ${req.recipientName} (Simulated)`, 'success');
  };

  const handleGenerateLink = () => {
    if (!amount) return;
    const link = `https://tavi.app/pay/req_${Math.random().toString(36).substring(2, 8)}?amt=${amount}`;
    setGeneratedLink(link);
    showToast('Payment request link generated', 'info');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-10">
      <PageHeader title="Request & Receive" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('tavi_user');
              setGeneratedLink('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tavi_user'
                ? 'bg-white text-midnight-navy shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Request from TAVI User
          </button>
          <button
            onClick={() => setActiveTab('payment_link')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'payment_link'
                ? 'bg-white text-midnight-navy shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Shareable Link
          </button>
        </div>

        {activeTab === 'tavi_user' ? (
          <>
            {/* Request Type Selector */}
            <div className="flex gap-2">
              {(['money', 'airtime', 'data'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRequestType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    requestType === t
                      ? 'bg-pale-mint text-primary-green border-action-green shadow-xs'
                      : 'bg-white text-slate-600 border-border-color hover:bg-slate-50'
                  }`}
                >
                  {t === 'money' ? '💵 Money' : t === 'airtime' ? '📱 Airtime' : '🌐 Data'}
                </button>
              ))}
            </div>

            {/* Form */}
            {!isReviewing ? (
              <Card className="p-5 space-y-4 border border-border-color bg-white">
                <SectionHeader
                  title={
                    requestType === 'money'
                      ? 'Request Money from TAVI User'
                      : requestType === 'airtime'
                      ? 'Request Airtime Top-up'
                      : 'Request Data Package'
                  }
                />

                {/* Recipient Selection */}
                <div>
                  <Input
                    label="Recipient (TAVI Username, Phone, or Name)"
                    placeholder="e.g. Ada Chukwu or 08074100290"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                  {beneficiaries.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Suggest:</span>
                      {beneficiaries.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectContact(b.name, b.accountNumber)}
                          className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {requestType === 'money' && (
                  <div>
                    <Input
                      label="Amount to Request (NGN)"
                      placeholder="5,000"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                )}

                {requestType === 'airtime' && (
                  <>
                    <div>
                      <label htmlFor={networkSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Network Provider</label>
                      <select
                        id={networkSelectId}
                        className="input-field"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                      >
                        <option value="MTN">MTN Nigeria</option>
                        <option value="Airtel">Airtel Nigeria</option>
                        <option value="Glo">Glo Mobile</option>
                        <option value="9mobile">9mobile</option>
                      </select>
                    </div>
                    <Input
                      label="Airtime Amount (NGN)"
                      placeholder="1,000"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </>
                )}

                {requestType === 'data' && (
                  <>
                    <div>
                      <label htmlFor={networkSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Network Provider</label>
                      <select
                        id={networkSelectId}
                        className="input-field"
                        value={network}
                        onChange={(e) => {
                          setNetwork(e.target.value);
                          setDataPackage(DATA_PACKAGES[e.target.value][0]);
                        }}
                      >
                        <option value="MTN">MTN Nigeria</option>
                        <option value="Airtel">Airtel Nigeria</option>
                        <option value="Glo">Glo Mobile</option>
                        <option value="9mobile">9mobile</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={dataPackageSelectId} className="text-xs font-semibold text-slate-700 mb-1 block">Select Data Package</label>
                      <select
                        id={dataPackageSelectId}
                        className="input-field"
                        value={dataPackage}
                        onChange={(e) => setDataPackage(e.target.value)}
                      >
                        {(DATA_PACKAGES[network] || DATA_PACKAGES['MTN']).map((pkg) => (
                          <option key={pkg} value={pkg}>
                            {pkg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <Input
                  label="Purpose / Note (Optional)"
                  placeholder="e.g. Lunch contribution or project split"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <Button
                  variant="primary"
                  fullWidth
                  disabled={!recipient}
                  onClick={() => setIsReviewing(true)}
                >
                  Review Request
                </Button>
              </Card>
            ) : (
              /* Review Step */
              <Card className="p-5 space-y-4 border border-border-color bg-white animate-fade-in">
                <h3 className="font-bold text-base text-midnight-navy">Review Payment Request</h3>

                <div className="space-y-2 text-xs text-slate-600 border-y py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Request Type</span>
                    <span className="font-bold uppercase text-midnight-navy">{requestType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient</span>
                    <span className="font-semibold text-midnight-navy">{recipient}</span>
                  </div>
                  {requestType === 'money' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Requested Amount</span>
                      <span className="font-bold text-primary-green text-sm">{formatNaira(parseNairaToKobo(amount) || 0)}</span>
                    </div>
                  )}
                  {requestType === 'airtime' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Network</span>
                        <span className="font-medium text-slate-800">{network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Airtime Value</span>
                        <span className="font-bold text-midnight-navy">₦{amount}</span>
                      </div>
                    </>
                  )}
                  {requestType === 'data' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Network</span>
                        <span className="font-medium text-slate-800">{network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Selected Bundle</span>
                        <span className="font-bold text-midnight-navy">{dataPackage}</span>
                      </div>
                    </>
                  )}
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Note</span>
                      <span className="italic text-slate-700">"{note}"</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expiry</span>
                    <span className="text-slate-600">7 days from issue</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  ℹ️ The recipient will receive an in-app notification and must explicitly review & authorize any funds transfer.
                </div>

                <div className="space-y-2 pt-1">
                  <Button variant="primary" fullWidth onClick={handleSubmitRequest}>
                    Send Request to Recipient
                  </Button>
                  <Button variant="ghost" fullWidth onClick={() => setIsReviewing(false)}>
                    Back to Edit
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          /* Payment Link Tab */
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <SectionHeader title="Create Shareable Payment Link" />
            <p className="text-xs text-slate-500">
              Generate a shareable payment request link that anyone can open to review and settle.
            </p>

            <Input
              label="Amount in NGN"
              placeholder="10,000"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Input
              label="Purpose / Memo"
              placeholder="e.g. Freelance invoice or group split"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {!generatedLink ? (
              <Button variant="primary" fullWidth onClick={handleGenerateLink} disabled={!amount}>
                Generate Link
              </Button>
            ) : (
              <div className="p-4 bg-pale-mint/70 border border-mint rounded-2xl space-y-3 text-center animate-slide-up">
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">Link Ready</span>
                <p className="text-xs font-mono text-slate-800 break-all bg-white p-2.5 rounded-xl border border-mint">
                  {generatedLink}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => copyToClipboard(generatedLink, 'Payment request link copied')}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setGeneratedLink('')}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Recent Requests Lifecycle History */}
        {moneyRequests.length > 0 && (
          <Card className="p-5 space-y-3 border border-border-color bg-white">
            <SectionHeader title="Your Requests Lifecycle" />
            <div className="space-y-2">
              {moneyRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-midnight-navy">{req.recipientName}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase font-semibold">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Ref: {req.reference} {req.note ? `· "${req.note}"` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {req.amountKobo && (
                      <p className="font-extrabold text-midnight-navy">{formatNaira(req.amountKobo)}</p>
                    )}
                    <span className="text-[9px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
