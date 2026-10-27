import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Input, Button, SectionHeader } from '../../components/ui';
import { DEMO_FAQS } from '../../data/demoData';

export function SettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'security' | 'faq' | 'sessions' | 'privacy'>('security');

  // Security Toggles
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState([
    { id: 's-1', device: 'Chrome on Windows 11 (Current)', location: 'Lagos, Nigeria', ip: '102.89.44.12', active: true },
    { id: 's-2', device: 'TAVI Mobile App (iPhone 14 Pro)', location: 'Abuja, Nigeria', ip: '105.112.98.54', active: false },
  ]);

  // 40 FAQ State & Search
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-01');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // Extract all 12 FAQ Categories
  const faqCategories = useMemo(() => {
    const cats = new Set<string>();
    DEMO_FAQS.forEach((f) => cats.add(f.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return DEMO_FAQS.filter((f) => {
      const q = faqSearch.toLowerCase();
      const matchesSearch =
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' ? true : f.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [faqSearch, selectedCategory]);

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Session revoked successfully', 'info');
  };

  const handleFeedback = (faqId: string, helpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: helpful }));
    showToast(helpful ? 'Thank you for your feedback!' : 'We will improve this article.', 'info');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-14">
      <PageHeader title="Security, Settings & FAQs" onBack={() => navigate(-1)} />

      <div className="p-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Navigation Tabs (Phase 9 Requirement 2) */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'security', label: '🔒 Security & PIN' },
            { id: 'faq', label: `❓ 40 FAQs & Help (${DEMO_FAQS.length})` },
            { id: 'sessions', label: '📱 Active Devices' },
            { id: 'privacy', label: '🛡️ Privacy & Limits' },
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

        {/* ─── TAB 1: SECURITY & PIN ─── */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card className="p-5 space-y-4 border border-border-color bg-white shadow-sm">
              <SectionHeader title="Authentication & Transaction Security" />

              <div className="divide-y divide-border-color text-xs">
                {/* Biometrics */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-midnight-navy">Biometric Sign-in</p>
                    <p className="text-slate-500 mt-0.5">Use Face ID or Fingerprint hardware authentication to unlock app.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBiometricEnabled(!biometricEnabled);
                      showToast(biometricEnabled ? 'Biometrics disabled' : 'Biometrics enabled', 'info');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      biometricEnabled ? 'bg-action-green justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Two-Factor Authentication (2FA) */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-midnight-navy">Two-Factor Authentication (2FA)</p>
                    <p className="text-slate-500 mt-0.5">Time-based TOTP code required for new devices and high-value transfers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled with authenticator', 'info');
                    }}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      twoFactorEnabled ? 'bg-action-green justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Change Transaction PIN */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-midnight-navy">Transaction PIN</p>
                    <p className="text-slate-500 mt-0.5">4-digit PIN required to authorize all outgoing transfers and withdrawals.</p>
                  </div>
                  <Button variant="outline" onClick={() => showToast('PIN update flow initiated (Demo)', 'info')}>
                    Change PIN
                  </Button>
                </div>

                {/* Change Account Password */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-midnight-navy">Account Password</p>
                    <p className="text-slate-500 mt-0.5">Last updated 60 days ago.</p>
                  </div>
                  <Button variant="outline" onClick={() => showToast('Password reset link sent to registered email', 'info')}>
                    Update Password
                  </Button>
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="p-5 space-y-3 border border-border-color bg-white">
              <SectionHeader title="Notification Preferences" />
              <div className="divide-y divide-border-color text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Essential Transaction & Security Alerts</p>
                    <p className="text-slate-400 text-[11px]">Instant SMS and in-app alerts for transfers and sign-ins.</p>
                  </div>
                  <span className="text-action-green font-bold text-[11px] uppercase">Always Active</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">Product Announcements & Market Research</p>
                    <p className="text-slate-400 text-[11px]">Weekly NGX commentary, TAVI Index updates, and rate alerts.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyMarketing(!notifyMarketing)}
                    className={`w-11 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                      notifyMarketing ? 'bg-action-green justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─── TAB 2: DEDICATED 40 FAQS CENTRE (Phase 9 Phase 6) ─── */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {/* Search Header */}
            <Card className="p-5 border border-border-color bg-white space-y-3 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">
                  Authoritative Self-Service Knowledge
                </span>
                <h3 className="font-extrabold text-lg text-midnight-navy mt-0.5">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Search across all 40 official guidance questions covering accounts, payments, security, and cards.
                </p>
              </div>

              <Input
                placeholder="Search a question or describe your problem (e.g. transfer limit, lost phone, 2fa)..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />

              {/* Category Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                      selectedCategory === cat
                        ? 'bg-action-green text-white border-action-green shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-border-color hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>

            {/* FAQs List Accordion */}
            <div className="space-y-2.5">
              {filteredFaqs.length === 0 ? (
                <Card className="p-8 text-center space-y-2 border border-border-color bg-white">
                  <p className="text-slate-500 text-sm font-semibold">No questions match "{faqSearch}"</p>
                  <p className="text-xs text-slate-400">Try checking your spelling or reach out directly to customer support.</p>
                  <Button variant="primary" onClick={() => navigate('/support')}>
                    Contact Support Team
                  </Button>
                </Card>
              ) : (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  const feedback = helpfulFeedback[faq.id];

                  return (
                    <Card
                      key={faq.id}
                      className="border border-border-color bg-white overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full p-4 text-left flex justify-between items-center gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            {faq.category} · {faq.id.toUpperCase()}
                          </span>
                          <h4 className="font-bold text-midnight-navy text-sm mt-0.5">{faq.question}</h4>
                        </div>
                        <span className="text-slate-400 font-bold text-sm transform transition-transform duration-200">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-border-color/60 bg-slate-50/40 space-y-3 animate-fade-in">
                          <p className="leading-relaxed text-[13px] text-slate-700">{faq.answer}</p>

                          {/* Contextual Link & Feedback Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-color/80 text-[11px]">
                            {faq.relevantRoute && (
                              <button
                                onClick={() => navigate(faq.relevantRoute!)}
                                className="font-bold text-action-green hover:underline flex items-center gap-1"
                              >
                                Open Related Feature <span>→</span>
                              </button>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-slate-400">Was this helpful?</span>
                              <button
                                onClick={() => handleFeedback(faq.id, true)}
                                className={`px-2 py-0.5 rounded border transition-colors ${
                                  feedback === true ? 'bg-green-100 text-action-green border-green-300' : 'bg-white hover:bg-slate-100'
                                }`}
                              >
                                👍 Yes
                              </button>
                              <button
                                onClick={() => handleFeedback(faq.id, false)}
                                className={`px-2 py-0.5 rounded border transition-colors ${
                                  feedback === false ? 'bg-red-100 text-red-600 border-red-300' : 'bg-white hover:bg-slate-100'
                                }`}
                              >
                                👎 No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: ACTIVE DEVICES & SESSIONS (Phase 9 Section 5) ─── */}
        {activeTab === 'sessions' && (
          <Card className="p-5 space-y-4 border border-border-color bg-white">
            <div className="flex justify-between items-center pb-2 border-b">
              <SectionHeader title="Trusted Devices & Active Sessions" />
              <Button
                variant="outline"
                onClick={() => {
                  setSessions(sessions.filter((s) => s.active));
                  showToast('All other sessions signed out', 'info');
                }}
              >
                Sign Out Other Devices
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 bg-slate-50 rounded-2xl border border-border-color flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-midnight-navy text-sm">{sess.device}</span>
                      {sess.active && (
                        <span className="text-[10px] bg-pale-mint text-primary-green px-2 py-0.2 rounded-full font-bold uppercase">
                          Current Session
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px]">Location: {sess.location} · IP: {sess.ip}</p>
                  </div>
                  {!sess.active && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── TAB 4: PRIVACY & LIMITS ─── */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <Card className="p-5 space-y-4 border border-border-color bg-white">
              <SectionHeader title="Identity Verification & Transaction Limits" />

              <div className="p-4 bg-pale-mint/70 rounded-2xl border border-mint flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">Verified Status</span>
                  <h4 className="font-extrabold text-midnight-navy text-base mt-0.5">Tier 3 — Full Compliance</h4>
                  <p className="text-xs text-slate-500">BVN, National Identity (NIN), and utility address verified.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Limit</span>
                  <span className="font-mono text-xl font-extrabold text-midnight-navy">₦5,000,000</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t pt-3">
                <div className="flex justify-between">
                  <span>Single Transfer Limit:</span>
                  <strong className="text-midnight-navy">₦2,000,000.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Rolling Limit:</span>
                  <strong className="text-midnight-navy">₦50,000,000.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>International FX Daily Outflow:</span>
                  <strong className="text-midnight-navy">$10,000.00</strong>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3 border border-border-color bg-white text-xs text-slate-600">
              <SectionHeader title="Privacy, Consent & Data Governance" />
              <p className="leading-relaxed">
                TAVI complies with the Nigeria Data Protection Act (NDPA) and international safeguarding frameworks. Personal financial data is encrypted at rest and in transit.
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => showToast('Data export bundle request submitted', 'info')}>
                  Request Copy of Personal Data
                </Button>
                <Button variant="ghost" onClick={() => navigate('/support')}>
                  Contact Data Protection Officer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
