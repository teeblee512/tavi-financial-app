import { useState, useMemo, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, StatusBadge, EmptyState, Card, Button } from '../../components/ui';
import { formatNaira, formatTransactionDate, CATEGORY_LABELS } from '../../services/formatters';

export function TransactionsPage() {
  const navigate = useNavigate();
  const dateRangeSelectId = useId();
  const exportScopeSelectId = useId();
  const counterpartySelectId = useId();
  const typeFilterSelectId = useId();
  const { transactions, user, account } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCounterparty, setSelectedCounterparty] = useState<string | null>(null);

  // Statement Export Modal States
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [exportScope, setExportScope] = useState<'full' | 'filtered' | 'counterparty'>('full');
  const [exportCounterparty, setExportCounterparty] = useState('Ada Chukwu');
  const [exportDateRange, setExportDateRange] = useState<'7d' | '30d' | 'this_month' | 'prev_month' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exportTypeFilter, setExportTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');

  // Extract list of all unique counterparties
  const allCounterparties = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.counterpartyName));
    return Array.from(set).sort();
  }, [transactions]);

  // Main Page Filtered Transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const q = search.toLowerCase();
      const matchesSearch =
        tx.counterpartyName.toLowerCase().includes(q) ||
        tx.narration.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q);

      const matchesType = filterType === 'all' ? true : tx.direction === filterType;
      const matchesStatus = selectedStatus === 'all' ? true : tx.status === selectedStatus;
      const matchesCP = selectedCounterparty
        ? tx.counterpartyName.toLowerCase() === selectedCounterparty.toLowerCase()
        : true;

      return matchesSearch && matchesType && matchesStatus && matchesCP;
    });
  }, [transactions, search, filterType, selectedStatus, selectedCounterparty]);

  // Peer Analysis for Counterparty
  const counterpartyStats = useMemo(() => {
    if (!selectedCounterparty) return null;
    const cpTx = transactions.filter(
      (t) => t.counterpartyName.toLowerCase() === selectedCounterparty.toLowerCase()
    );
    let totalSentKobo = 0;
    let totalReceivedKobo = 0;
    let debitsCount = 0;
    let creditsCount = 0;

    cpTx.forEach((t) => {
      if (t.direction === 'debit') {
        totalSentKobo += t.amountKobo;
        debitsCount++;
      } else {
        totalReceivedKobo += t.amountKobo;
        creditsCount++;
      }
    });

    return {
      name: selectedCounterparty,
      totalSentKobo,
      totalReceivedKobo,
      netFlowKobo: totalReceivedKobo - totalSentKobo,
      debitsCount,
      creditsCount,
      totalCount: cpTx.length,
    };
  }, [transactions, selectedCounterparty]);

  // Calculate matching transactions for Statement Export Preview
  const exportMatchingTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (exportDateRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (exportDateRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (exportDateRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (exportDateRange === 'prev_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else {
      startDate = customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = customEndDate ? new Date(customEndDate) : now;
    }

    return transactions.filter((t) => {
      const tDate = new Date(t.timestamp);
      const withinDate = tDate >= startDate && tDate <= endDate;
      if (!withinDate) return false;

      if (exportScope === 'counterparty') {
        if (t.counterpartyName.toLowerCase() !== exportCounterparty.toLowerCase()) return false;
      } else if (exportScope === 'filtered') {
        // apply active page filters
        if (selectedCounterparty && t.counterpartyName.toLowerCase() !== selectedCounterparty.toLowerCase()) return false;
        if (filterType !== 'all' && t.direction !== filterType) return false;
        if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      }

      if (exportTypeFilter !== 'all' && t.direction !== exportTypeFilter) return false;

      return true;
    });
  }, [transactions, exportScope, exportCounterparty, exportDateRange, customStartDate, customEndDate, exportTypeFilter, selectedCounterparty, filterType, selectedStatus]);

  const exportTotals = useMemo(() => {
    let debits = 0;
    let credits = 0;
    exportMatchingTransactions.forEach((t) => {
      if (t.direction === 'debit') debits += t.amountKobo;
      else credits += t.amountKobo;
    });
    return { debits, credits, count: exportMatchingTransactions.length };
  }, [exportMatchingTransactions]);

  // Handle CSV Download
  const handleDownloadCSV = () => {
    const headers = [
      'Transaction Date',
      'Transaction Reference',
      'Counterparty',
      'Description',
      'Category',
      'Direction',
      'Debit (NGN)',
      'Credit (NGN)',
      'Currency',
      'Status',
    ];

    const rows = exportMatchingTransactions.map((t) => {
      const debitStr = t.direction === 'debit' ? (t.amountKobo / 100).toFixed(2) : '0.00';
      const creditStr = t.direction === 'credit' ? (t.amountKobo / 100).toFixed(2) : '0.00';
      return [
        `"${new Date(t.timestamp).toISOString()}"`,
        `"${t.reference}"`,
        `"${t.counterpartyName.replace(/"/g, '""')}"`,
        `"${t.narration.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.direction.toUpperCase()}"`,
        debitStr,
        creditStr,
        `"${t.currency}"`,
        `"${t.status.toUpperCase()}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const cleanScope = exportScope === 'counterparty' ? exportCounterparty.replace(/\s+/g, '_') : 'Statement';
    link.href = url;
    link.download = `TAVI_${cleanScope}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowStatementModal(false);
  };

  // Handle PDF / Printable HTML Statement
  const handlePrintOrDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate statement preview.');
      return;
    }

    const title =
      exportScope === 'counterparty'
        ? `TAVI Counterparty Statement — ${exportCounterparty}`
        : exportScope === 'filtered'
        ? `TAVI Filtered Transaction Statement`
        : `TAVI Official Account Statement`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 40px; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #064E3B; padding-bottom: 20px; }
            .brand { font-size: 28px; font-weight: 800; color: #064E3B; letter-spacing: -0.5px; }
            .tagline { font-size: 11px; color: #059669; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .watermark { position: fixed; top: 40%; left: 20%; font-size: 80px; color: rgba(226, 232, 240, 0.5); transform: rotate(-30deg); font-weight: 900; pointer-events: none; z-index: -1; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0; background: #F8FAFC; padding: 18px; border-radius: 10px; border: 1px solid #E2E8F0; }
            .summary-box span { font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 600; display: block; }
            .summary-box strong { font-size: 14px; color: #0F172A; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background: #064E3B; color: white; text-align: left; padding: 10px; font-weight: 600; }
            td { padding: 9px 10px; border-bottom: 1px solid #E2E8F0; }
            tr:nth-child(even) { background: #F8FAFC; }
            .debit { color: #DC2626; font-weight: 600; }
            .credit { color: #059669; font-weight: 600; }
            .footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 15px; font-size: 11px; color: #64748B; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="watermark">DEMO STATEMENT</div>
          <div class="header">
            <div>
              <div class="brand">TAVI</div>
              <div class="tagline">Move. Manage. Grow.</div>
              <p style="margin: 8px 0 0; font-size: 12px; color: #475569;">${account?.providerName || 'TAVI Demo Bank'} · CBN / NDIC Demo License</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 16px; color: #064E3B;">${title}</h2>
              <p style="margin: 4px 0 0; font-size: 11px; color: #64748B;">Generated: ${new Date().toLocaleString('en-NG')}</p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #64748B;">Scope: ${exportScope.toUpperCase()}</p>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-box">
              <span>Account Holder</span>
              <strong>${account?.accountName || user?.firstName + ' ' + user?.lastName}</strong>
            </div>
            <div class="summary-box">
              <span>Account Number</span>
              <strong style="font-family: monospace;">${account?.providerAccountNumber || '7074100290'}</strong>
            </div>
            <div class="summary-box">
              <span>Total Debits (${exportMatchingTransactions.filter((t) => t.direction === 'debit').length})</span>
              <strong class="debit">-${formatNaira(exportTotals.debits)}</strong>
            </div>
            <div class="summary-box">
              <span>Total Credits (${exportMatchingTransactions.filter((t) => t.direction === 'credit').length})</span>
              <strong class="credit">+${formatNaira(exportTotals.credits)}</strong>
            </div>
          </div>

          ${
            exportScope === 'counterparty'
              ? `<p style="font-size: 12px; color: #064E3B; background: #D1FAE5; padding: 10px; border-radius: 6px; font-weight: 500;">
                  Showing qualifying transactions specifically involving <strong>${exportCounterparty}</strong>. This statement does not reflect full account opening or closing balances.
                 </p>`
              : ''
          }

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Counterparty / Description</th>
                <th>Debit (NGN)</th>
                <th>Credit (NGN)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${exportMatchingTransactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.timestamp).toLocaleDateString('en-NG')}</td>
                  <td style="font-family: monospace; font-size: 11px;">${t.reference}</td>
                  <td><strong>${t.counterpartyName}</strong><br/><span style="color: #64748B; font-size: 10px;">${t.narration}</span></td>
                  <td class="debit">${t.direction === 'debit' ? formatNaira(t.amountKobo) : '-'}</td>
                  <td class="credit">${t.direction === 'credit' ? formatNaira(t.amountKobo) : '-'}</td>
                  <td><span style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${t.status}</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>TAVI Financial Technologies Prototype — Move. Manage. Grow. Simulated evaluation document.</p>
            <p>For inquiries regarding this statement, contact support@tavi.app</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setShowStatementModal(false);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full pb-10">
      <PageHeader
        title="Transaction History"
        onBack={() => navigate(-1)}
        rightAction={
          <button
            onClick={() => setShowStatementModal(true)}
            className="text-xs font-semibold text-action-green bg-pale-mint px-3.5 py-1.5 rounded-full hover:bg-mint transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Statement
          </button>
        }
      />

      <div className="p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {/* Search */}
        <Input
          placeholder="Search by counterparty, reference, or narration..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filter Pills and Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'debit', 'credit'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                filterType === type
                  ? 'bg-action-green text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-border-color hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}

          {/* Counterparty filter selector */}
          <select
            value={selectedCounterparty || 'all'}
            onChange={(e) => setSelectedCounterparty(e.target.value === 'all' ? null : e.target.value)}
            className="text-xs bg-white border border-border-color rounded-full px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-action-green ml-auto"
          >
            <option value="all">All Counterparties</option>
            {allCounterparties.map((cp) => (
              <option key={cp} value={cp}>
                {cp}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-border-color rounded-full px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-action-green"
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending_confirmation">Pending</option>
            <option value="reversed">Reversed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Peer Analysis Card for Ada Chukwu or selected counterparty (Phase 3 Requirement D1) */}
        {counterpartyStats && (
          <Card className="p-4 bg-gradient-to-br from-pale-mint/80 to-white border-mint shadow-xs space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-wider block">
                  Peer Statement View
                </span>
                <h4 className="text-base font-extrabold text-midnight-navy">{counterpartyStats.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setExportScope('counterparty');
                    setExportCounterparty(counterpartyStats.name);
                    setShowStatementModal(true);
                  }}
                  className="text-xs font-bold bg-action-green text-white px-3 py-1 rounded-full shadow-2xs hover:opacity-90"
                >
                  Export {counterpartyStats.name.split(' ')[0]}'s Statement
                </button>
                <button
                  onClick={() => setSelectedCounterparty(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 p-1"
                  aria-label="Clear counterparty filter"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-mint text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase">Money Sent</span>
                <p className="font-bold text-red-600 mt-0.5">-{formatNaira(counterpartyStats.totalSentKobo)}</p>
                <span className="text-[10px] text-slate-400">({counterpartyStats.debitsCount} debits)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase">Money Received</span>
                <p className="font-bold text-action-green mt-0.5">+{formatNaira(counterpartyStats.totalReceivedKobo)}</p>
                <span className="text-[10px] text-slate-400">({counterpartyStats.creditsCount} credits)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase">Net Cash Flow</span>
                <p className={`font-bold mt-0.5 ${counterpartyStats.netFlowKobo >= 0 ? 'text-action-green' : 'text-red-600'}`}>
                  {counterpartyStats.netFlowKobo >= 0 ? '+' : ''}{formatNaira(counterpartyStats.netFlowKobo)}
                </p>
                <span className="text-[10px] text-slate-400">{counterpartyStats.totalCount} total txns</span>
              </div>
            </div>
          </Card>
        )}

        {/* Transaction Count Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {filtered.length} matching transactions</span>
          {(selectedCounterparty || filterType !== 'all' || selectedStatus !== 'all' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
                setSelectedStatus('all');
                setSelectedCounterparty(null);
              }}
              className="text-action-green font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="card overflow-hidden divide-y divide-border-color bg-white border border-border-color">
          {filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Try adjusting your counterparty search or filter parameters."
            />
          ) : (
            filtered.map((tx) => (
              <button
                key={tx.id}
                className="tx-row w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3"
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                <div
                  className={`w-9 h-9 rounded-icon flex items-center justify-center flex-shrink-0 ${
                    tx.direction === 'credit' ? 'bg-green-100 text-action-green' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tx.direction === 'credit' ? '↓' : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-midnight-navy truncate">{tx.counterpartyName}</p>
                    {tx.counterpartyName.toLowerCase() === 'ada chukwu' && (
                      <span className="text-[9px] bg-pale-mint text-primary-green px-1.5 py-0.2 rounded font-bold uppercase">
                        Ada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {CATEGORY_LABELS[tx.category]} · {formatTransactionDate(tx.timestamp)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      tx.direction === 'debit' ? 'amount-debit text-midnight-navy' : 'amount-credit text-action-green'
                    }`}
                  >
                    {tx.direction === 'debit' ? '-' : '+'}{formatNaira(tx.amountKobo)}
                  </p>
                  {tx.status !== 'successful' && (
                    <div className="mt-0.5">
                      <StatusBadge status={tx.status} />
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Advanced Statement Export Modal (Phase 3 Requirement E) ─── */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-lg w-full p-5 space-y-4 border border-border-color bg-white animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-extrabold text-base text-midnight-navy">Export Financial Statement</h3>
                <p className="text-xs text-slate-500">Download official statements in formatted PDF or CSV</p>
              </div>
              <button
                onClick={() => setShowStatementModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Option Selection (E1) */}
              <div>
                <label htmlFor={exportScopeSelectId} className="text-xs font-bold text-slate-700 mb-1.5 block">1. Statement Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'full', label: 'Full Account' },
                    { id: 'filtered', label: 'Filtered Results' },
                    { id: 'counterparty', label: 'Specific Person' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExportScope(opt.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        exportScope === opt.id
                          ? 'bg-pale-mint text-primary-green border-action-green shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-border-color hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Counterparty Scope is Selected */}
              {exportScope === 'counterparty' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-2">
                  <label htmlFor={counterpartySelectId} className="text-xs font-semibold text-slate-700 block">Select Person or Business</label>
                  <select
                    id={counterpartySelectId}
                    value={exportCounterparty}
                    onChange={(e) => setExportCounterparty(e.target.value)}
                    className="input-field"
                  >
                    {allCounterparties.map((cp) => (
                      <option key={cp} value={cp}>
                        {cp}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    Statement will only contain qualifying transactions with {exportCounterparty}.
                  </p>
                </div>
              )}

              {/* Date Range Selection (E4) */}
              <div>
                <label htmlFor={dateRangeSelectId} className="text-xs font-bold text-slate-700 mb-1.5 block">2. Select Date Range</label>
                <select
                  id={dateRangeSelectId}
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value as any)}
                  className="input-field"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="this_month">This month</option>
                  <option value="prev_month">Previous month</option>
                  <option value="custom">Custom date range</option>
                </select>

                {exportDateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      label="Start Date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label htmlFor={typeFilterSelectId} className="text-xs font-bold text-slate-700 mb-1.5 block">3. Transaction Type</label>
                <div className="flex gap-2">
                  {(['all', 'debit', 'credit'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setExportTypeFilter(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize border transition-colors ${
                        exportTypeFilter === t
                          ? 'bg-action-green text-white border-action-green'
                          : 'bg-white text-slate-600 border-border-color hover:bg-slate-50'
                      }`}
                    >
                      {t === 'all' ? 'All Transactions' : t === 'debit' ? 'Debits Only' : 'Credits Only'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Preview (E2) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-border-color space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Statement Preview</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-semibold text-midnight-navy">{account?.accountName || user?.firstName + ' ' + user?.lastName}</span>
                </div>
                {exportScope === 'counterparty' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Counterparty:</span>
                    <span className="font-semibold text-action-green">{exportCounterparty}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Matching Records:</span>
                  <span className="font-bold text-midnight-navy">{exportTotals.count} transactions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Debits:</span>
                  <span className="font-bold text-red-600">-{formatNaira(exportTotals.debits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Credits:</span>
                  <span className="font-bold text-action-green">+{formatNaira(exportTotals.credits)}</span>
                </div>
              </div>

              {exportTotals.count === 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  ⚠️ No transactions found matching this exact date range and filter criteria.
                </div>
              )}

              {/* Actions: Download CSV or Print/PDF */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={exportTotals.count === 0}
                  onClick={handlePrintOrDownloadPDF}
                >
                  View & Print PDF
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={exportTotals.count === 0}
                  onClick={handleDownloadCSV}
                >
                  Download CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
