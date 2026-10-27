import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button } from '../../components/ui';
import { formatNaira } from '../../services/formatters';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'nav' | 'draft_transfer' | 'counterparty_summary';
    title: string;
    description: string;
    route?: string;
    details?: Record<string, string>;
  };
}

export function AskAIPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, balance, user, account } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([
    'Transactions with Ada Chukwu',
    'Monthly spending breakdown',
    'How to sell a gift card',
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: `Hello ${user?.firstName || 'there'}! I am TAVI AI, your personal financial copilot and super app guide. I can help you analyze your spending, look up peer transactions (such as Ada Chukwu), prepare transfers, or guide you through investments and currency tools.`,
      timestamp: 'Just now',
    },
  ]);

  // Handle incoming prompt passed from HomePage
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null;
    if (state?.initialPrompt) {
      handleUserSubmit(state.initialPrompt);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleUserSubmit = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const q = trimmed.toLowerCase();
      let replyText = '';
      let actionCard: Message['actionCard'];

      // Intent 1: Ada Chukwu / Counterparty breakdown (Phase 3 & 7)
      if (q.includes('ada') || q.includes('chukwu') || q.includes('peer')) {
        const adaTx = transactions.filter((t) => t.counterpartyName.toLowerCase().includes('ada'));
        let sent = 0;
        let received = 0;
        adaTx.forEach((t) => {
          if (t.direction === 'debit') sent += t.amountKobo;
          else received += t.amountKobo;
        });

        replyText = `You have ${adaTx.length} recorded transactions with Ada Chukwu. You have sent ₦${(sent / 100).toLocaleString()} and received ₦${(received / 100).toLocaleString()}. Would you like to review or export Ada's counterparty statement?`;
        actionCard = {
          type: 'counterparty_summary',
          title: 'Ada Chukwu Peer Statement',
          description: `Net flow: ₦${((received - sent) / 100).toLocaleString()} · ${adaTx.length} transactions recorded`,
          route: '/transactions',
          details: {
            'Total Sent': `-${formatNaira(sent)}`,
            'Total Received': `+${formatNaira(received)}`,
            'Recent Txn': 'Rent contribution (₦50,000)',
          },
        };
      }
      // Intent 2: Balance enquiry
      else if (q.includes('balance') || q.includes('how much do i have') || q.includes('wallet')) {
        replyText = `Your available TAVI balance is ${formatNaira(balance?.available || 0)}, with ${formatNaira(balance?.pending || 0)} currently pending clearing.`;
        actionCard = {
          type: 'nav',
          title: 'View Account Details',
          description: `Account: ${account?.providerAccountNumber || '7074100290'} (${account?.providerName})`,
          route: '/account-details',
        };
      }
      // Intent 3: Spending breakdown / Budget
      else if (q.includes('spend') || q.includes('spent') || q.includes('month') || q.includes('budget')) {
        replyText = `This month, your recorded debits total ₦251,100 across transfers, utilities, and airtime. You are currently 21% below last month's spending pace!`;
        actionCard = {
          type: 'nav',
          title: 'Explore Budget & Analytics',
          description: 'Review category spending caps and limits',
          route: '/budget',
        };
      }
      // Intent 4: Send money / Payment preparation (Phase 7 Safe Action Prep)
      else if (q.includes('send') || q.includes('transfer') || q.includes('pay')) {
        replyText = `I can help you prepare a transfer! Financial safety rule: TAVI AI will never execute transactions automatically without your explicit review and 4-digit PIN confirmation.`;
        actionCard = {
          type: 'draft_transfer',
          title: 'Draft Bank Transfer',
          description: 'Continue to Payments to select recipient and authorize with PIN.',
          route: '/payments/send',
        };
      }
      // Intent 5: Gift cards
      else if (q.includes('gift card') || q.includes('redeem') || q.includes('sell card')) {
        replyText = `TAVI allows you to sell verified international gift cards (Amazon, Apple, Steam, etc.) for prompt Naira credit with zero hidden fees. Submissions undergo digital code verification.`;
        actionCard = {
          type: 'nav',
          title: 'Gift Card Trading Desk',
          description: 'View live buying rates and submit card codes',
          route: '/gift-cards',
        };
      }
      // Intent 6: Investments / NGX / Brokerage
      else if (q.includes('invest') || q.includes('stock') || q.includes('ngx') || q.includes('shares') || q.includes('indices')) {
        replyText = `TAVI Invest provides a dedicated, PIN-protected brokerage workspace tracking Nigerian Exchange (NGX) equities, level-2 order books, and our proprietary TAVI Index family (TAVI 15, TAVI 30, DIV30, etc.).`;
        actionCard = {
          type: 'nav',
          title: 'Open TAVI Invest Workspace',
          description: 'Unlock portfolio and explore NGX stocks',
          route: '/invest',
        };
      }
      // Intent 7: Currency conversion / FX
      else if (q.includes('dollar') || q.includes('fx') || q.includes('exchange') || q.includes('convert') || q.includes('currency')) {
        replyText = `TAVI Global supports multi-currency accounts in NGN, USD, GBP, and EUR with native receiving details, as well as guaranteed mid-market FX conversions.`;
        actionCard = {
          type: 'nav',
          title: 'TAVI Global & FX Tools',
          description: 'Convert currencies and view multi-currency accounts',
          route: '/fx',
        };
      }
      // Intent 8: Security, PIN & 2FA
      else if (q.includes('pin') || q.includes('security') || q.includes('password') || q.includes('2fa') || q.includes('limits')) {
        replyText = `You can manage your transaction PIN, biometric sign-in, two-factor authentication, active sessions, and KYC tier limits in Security & Settings.`;
        actionCard = {
          type: 'nav',
          title: 'Security & Settings Center',
          description: 'Manage authentication, PIN, and view 40 FAQs',
          route: '/settings',
        };
      }
      // Fallback: Knowledge Base Search
      else {
        replyText = `I am trained on TAVI's verified documentation. You can ask me to:
• "Show my transactions with Ada Chukwu"
• "What is my current available balance?"
• "How much did I spend this month?"
• "How do I sell an Amazon gift card?"
• "Tell me about TAVI 30 index and NGX equities"
• "How do I change my transaction PIN?"`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard,
        },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-6">
      <PageHeader title="TAVI AI Assistant" onBack={() => navigate(-1)} />

      <div className="p-4 sm:p-5 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-start">
          {/* Conversation Sidebar (Phase 7 Requirement 2) */}
          <div className="hidden md:block md:col-span-4 space-y-3">
            <Card className="p-4 border border-border-color bg-white space-y-3 shadow-xs">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setMessages([
                    {
                      id: `m-new-${Date.now()}`,
                      sender: 'assistant',
                      text: `New conversation started. How can I help you manage or grow your money today?`,
                      timestamp: 'Just now',
                    },
                  ]);
                }}
              >
                + New Chat Session
              </Button>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                  Suggested Prompts
                </span>
                <div className="space-y-1.5">
                  {[
                    'Show transactions with Ada Chukwu',
                    'What is my available balance?',
                    'How much did I spend this month?',
                    'Explain TAVI 30 index methodology',
                    'How do I sell a gift card?',
                    'Prepare a transfer to Babajide',
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleUserSubmit(p)}
                      className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-pale-mint text-slate-700 hover:text-primary-green transition-colors truncate"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t text-[11px] text-slate-400">
                🔒 TAVI Financial Copilot: Grounded RAG knowledge base. Sensitive credentials are never logged.
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="md:col-span-8 flex flex-col h-[72vh] bg-white rounded-2xl border border-border-color shadow-sm overflow-hidden">
            {/* Messages stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {m.sender === 'user' ? 'You' : 'TAVI AI'}
                    </span>
                    <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-action-green text-white rounded-tr-none shadow-2xs'
                        : 'bg-white border border-border-color text-midnight-navy rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Contextual Action Card */}
                    {m.actionCard && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-border-color text-slate-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-midnight-navy text-xs">{m.actionCard.title}</span>
                          <span className="text-[10px] bg-pale-mint text-primary-green font-bold px-1.5 py-0.2 rounded">
                            Action
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{m.actionCard.description}</p>

                        {m.actionCard.details && (
                          <div className="space-y-0.5 text-[10px] font-mono border-t pt-1">
                            {Object.entries(m.actionCard.details).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-slate-400">{k}:</span>
                                <span className="font-bold text-midnight-navy">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {m.actionCard.route && (
                          <button
                            onClick={() => navigate(m.actionCard!.route!)}
                            className="w-full py-1.5 bg-action-green hover:bg-emerald text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            Open in TAVI <span>→</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white border border-border-color rounded-2xl max-w-[120px] text-slate-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-action-green rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-action-green rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-action-green rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px]">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="p-3 bg-white border-t border-border-color">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUserSubmit(input);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask TAVI about spending, peers (Ada), transfers, or investments..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 input-field text-xs py-2.5"
                />
                <Button variant="primary" type="submit" disabled={!input.trim()}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
