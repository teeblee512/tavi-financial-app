import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { formatNaira, formatTransactionDate } from '../../services/formatters';

export function SupportPage() {
  const navigate = useNavigate();
  const searchInputId = useId();
  const selectTransactionId = useId();
  const issueTypeId = useId();
  const { supportCases, createSupportCase, transactions, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'report_tx' | 'cases' | 'security'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Transaction Issue Form
  const [selectedTxId, setSelectedTxId] = useState(transactions[0]?.id || '');
  const [issueType, setIssueType] = useState('Pending transfer not received by recipient');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);
  const [newCaseRef, setNewCaseRef] = useState<string | null>(null);

  const selectedTx = transactions.find((t) => t.id === selectedTxId);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCase(true);
    setTimeout(() => {
      const created = createSupportCase(
        'Transaction Dispute',
        issueType,
        issueDescription.trim() || `Dispute logged for transaction ${selectedTx?.reference || 'N/A'}.`,
        selectedTx?.reference
      );
      setIsSubmittingCase(false);
      setNewCaseRef(created.reference);
      showToast(`Support case logged (Ref: ${created.reference})`, 'success');
    }, 600);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-12">
      <PageHeader title="Support & Help Center" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Support Header & Search Field (Phase 8 Requirement 2) */}
        <div className="bg-gradient-to-br from-deep-emerald to-emerald text-white p-6 rounded-hero space-y-3 shadow-md">
          <div>
            <span className="text-[10px] text-mint uppercase font-bold tracking-wider block">Customer Support</span>
            <h2 className="text-2xl font-extrabold mt-0.5">How can we help you today?</h2>
            <p className="text-xs text-white/70 mt-1">
              Search approved guidance, report transaction delays, track cases, or contact our security desk.
            </p>
          </div>

          <div className="relative">
            <Input
              id={searchInputId}
              placeholder="Describe your issue or search for help (e.g. transfer pending)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'home', label: 'Support Hub' },
            { id: 'report_tx', label: 'Report Transaction Issue' },
            { id: 'cases', label: `My Cases (${supportCases.length})` },
            { id: 'security', label: '🛡️ Security & Fraud' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setNewCaseRef(null);
              }}
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

        {/* ─── TAB 1: SUPPORT HUB LANDING ─── */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1 */}
              <div
                onClick={() => setActiveTab('report_tx')}
                className="card p-4 border border-border-color bg-white hover:border-action-green transition-all cursor-pointer space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-pale-mint text-primary-green flex items-center justify-center font-bold text-base">
                  ⚡
                </div>
                <h4 className="font-bold text-midnight-navy text-sm">Report a Transaction Issue</h4>
                <p className="text-xs text-slate-500">
                  Select a pending or disputed payment directly from your history to open a verified trace.
                </p>
                <span className="text-xs text-action-green font-bold block pt-1">Open Guided Form →</span>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => setActiveTab('cases')}
                className="card p-4 border border-border-color bg-white hover:border-action-green transition-all cursor-pointer space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
                  📋
                </div>
                <h4 className="font-bold text-midnight-navy text-sm">My Support Cases</h4>
                <p className="text-xs text-slate-500">
                  Track open disputes, resolution timelines, and communications with compliance officers.
                </p>
                <span className="text-xs text-action-green font-bold block pt-1">View {supportCases.length} Cases →</span>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => setActiveTab('security')}
                className="card p-4 border border-border-color bg-white hover:border-action-green transition-all cursor-pointer space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-base">
                  🛡️
                </div>
                <h4 className="font-bold text-midnight-navy text-sm">Security & Fraud Escalation</h4>
                <p className="text-xs text-slate-500">
                  Urgent guidance to lock sessions, freeze cards, and report unrecognised account access.
                </p>
                <span className="text-xs text-red-600 font-bold block pt-1">Emergency Protocols →</span>
              </div>
            </div>

            {/* Official Contact Channels */}
            <Card className="p-5 space-y-4 border border-border-color bg-white">
              <SectionHeader title="Verified Contact Channels" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">AI Assistance</span>
                  <p className="font-bold text-midnight-navy">TAVI AI Financial Copilot</p>
                  <p className="text-slate-500 text-[11px]">Instant answers to product and transaction questions.</p>
                  <button
                    onClick={() => navigate('/ask-ai')}
                    className="text-xs font-bold text-action-green hover:underline block pt-1"
                  >
                    Chat with AI →
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Support</span>
                  <p className="font-bold text-midnight-navy">support@tavi.app</p>
                  <p className="text-slate-500 text-[11px]">Response target: within 1 business day.</p>
                  <span className="text-slate-400 text-[10px]">Verified official mailbox</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Telephone Desk</span>
                  <p className="font-bold text-midnight-navy">+234 1 800 TAVI (8284)</p>
                  <p className="text-slate-500 text-[11px]">Operating hours: Mon–Fri 8:00 AM – 6:00 PM WAT.</p>
                  <span className="text-slate-400 text-[10px]">Customer care line</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─── TAB 2: TRANSACTION ISSUE REPORTING (Phase 8 Requirement 7) ─── */}
        {activeTab === 'report_tx' && (
          <div className="max-w-lg mx-auto w-full space-y-4">
            <Card className="p-5 space-y-4 border border-border-color bg-white shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">
                  Guided Resolution
                </span>
                <h3 className="font-extrabold text-base text-midnight-navy mt-0.5">Report a Transaction Issue</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select the transaction in question. Our settlement desk will trace the interbank switch.
                </p>
              </div>

              {!newCaseRef ? (
                <form onSubmit={handleCreateCase} className="space-y-3">
                  {/* Select transaction from history */}
                  <div>
                    <label htmlFor={selectTransactionId} className="text-xs font-semibold text-slate-700 mb-1 block">
                      Select Transaction to Dispute
                    </label>
                    <select
                      id={selectTransactionId}
                      className="input-field"
                      value={selectedTxId}
                      onChange={(e) => setSelectedTxId(e.target.value)}
                    >
                      {transactions.slice(0, 10).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.counterpartyName} · {formatNaira(t.amountKobo)} ({formatTransactionDate(t.timestamp)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTx && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-border-color text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Reference:</span>
                        <span className="font-bold text-midnight-navy">{selectedTx.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Current Status:</span>
                        <span className="font-bold text-amber-600 uppercase font-sans">{selectedTx.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Amount:</span>
                        <span className="font-bold text-midnight-navy">{formatNaira(selectedTx.amountKobo)}</span>
                      </div>
                    </div>
                  )}

                  {/* Issue Type */}
                  <div>
                    <label htmlFor={issueTypeId} className="text-xs font-semibold text-slate-700 mb-1 block">Issue Type</label>
                    <select
                      id={issueTypeId}
                      className="input-field"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="Transfer pending not received by recipient">Transfer pending not received by recipient</option>
                      <option value="Failed transfer but funds debited">Failed transfer but funds debited</option>
                      <option value="Duplicate payment detected">Duplicate payment detected</option>
                      <option value="Incorrect debit amount">Incorrect debit amount</option>
                      <option value="Unrecognised transaction">Unrecognised transaction</option>
                    </select>
                  </div>

                  {/* Details */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Additional Details</label>
                    <textarea
                      rows={3}
                      placeholder="Provide any additional context (e.g. beneficiary claims funds didn't reflect)..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-input-bg border border-border-color text-midnight-navy focus:outline-none focus:ring-2 focus:ring-action-green"
                    />
                  </div>

                  <Button variant="primary" fullWidth type="submit" loading={isSubmittingCase}>
                    Submit Support Case
                  </Button>
                </form>
              ) : (
                <div className="p-4 bg-pale-mint/70 border border-mint rounded-2xl space-y-3 text-center animate-slide-up">
                  <div className="w-12 h-12 bg-pale-mint rounded-full flex items-center justify-center mx-auto text-action-green font-bold text-xl">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-action-green uppercase tracking-wider block">Case Received</span>
                    <h4 className="font-bold text-base text-midnight-navy mt-1">Ref: {newCaseRef}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Our settlement operations team has initiated an automated trace with NIBSS. You can track this in <strong>My Cases</strong>.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setNewCaseRef(null);
                      setActiveTab('cases');
                    }}
                  >
                    View in My Support Cases
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ─── TAB 3: MY SUPPORT CASES (Phase 8 Requirement 6) ─── */}
        {activeTab === 'cases' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <div className="flex justify-between items-center pb-2 border-b">
              <SectionHeader title="Your Active Support Cases" />
              <span className="text-xs text-slate-400 font-mono">{supportCases.length} Registered</span>
            </div>

            <div className="space-y-3">
              {supportCases.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-border-color space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{c.category}</span>
                      <h4 className="font-bold text-midnight-navy text-sm mt-0.5">{c.subject}</h4>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                        Case ID: {c.reference} {c.relatedTxReference ? `· Linked Tx: ${c.relatedTxReference}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        c.status === 'resolved'
                          ? 'bg-green-100 text-action-green border-green-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs">{c.description}</p>

                  {/* Updates Timeline */}
                  <div className="pt-2 border-t border-border-color space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Activity Log
                    </span>
                    {c.updates.map((u, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <span className="text-action-green font-bold">●</span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800">{u.author}: </span>
                          <span>{u.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── TAB 4: SECURITY & FRAUD ESCALATION (Phase 8 Requirement 8) ─── */}
        {activeTab === 'security' && (
          <div className="max-w-xl mx-auto w-full space-y-4">
            <Card className="p-5 space-y-4 border border-red-200 bg-red-50/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                  🚨
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-midnight-navy">Security & Fraud Reporting</h3>
                  <p className="text-xs text-slate-500">Immediate protective guidance for suspected account compromise.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 bg-white rounded-xl border border-red-100 space-y-1">
                  <span className="font-bold text-red-600 block">1. Revoke Active Sessions</span>
                  <p className="text-[11px]">
                    If you see unfamiliar devices, open Settings &gt; Devices & Active Sessions immediately to sign out all remote sessions.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    Go to Active Sessions →
                  </Button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-red-100 space-y-1">
                  <span className="font-bold text-red-600 block">2. Reset Transaction PIN</span>
                  <p className="text-[11px]">
                    Ensure no unauthorized transfers can occur by immediately changing your 4-digit PIN.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    Update Transaction PIN →
                  </Button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-red-100 space-y-1">
                  <span className="font-bold text-red-600 block">3. Never Share OTPs or Passwords</span>
                  <p className="text-[11px]">
                    TAVI staff will <strong>never</strong> ask for your password, transaction PIN, or SMS/authenticator OTP.
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
