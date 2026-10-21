import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, StatusBadge, EmptyState, Card, Button } from '../../components/ui';
import { formatNaira, formatTransactionDate, CATEGORY_LABELS } from '../../services/formatters';
import { useClipboard } from '../../hooks/useClipboard';

export function TransactionsPage() {
  const navigate = useNavigate();
  const { transactions, user, account } = useApp();
  const { copyToClipboard } = useClipboard();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCounterparty, setSelectedCounterparty] = useState<string | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.counterpartyName.toLowerCase().includes(search.toLowerCase()) ||
        tx.narration.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference.toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === 'all' ? true : tx.direction === filterType;
      const matchesStatus = selectedStatus === 'all' ? true : tx.status === selectedStatus;
      const matchesCP = selectedCounterparty
        ? tx.counterpartyName.toLowerCase() === selectedCounterparty.toLowerCase()
        : true;

      return matchesSearch && matchesType && matchesStatus && matchesCP;
    });
  }, [transactions, search, filterType, selectedStatus, selectedCounterparty]);

  // Section 10.3: Counterparty analysis
  const counterpartyStats = useMemo(() => {
    if (!selectedCounterparty) return null;
    const cpTx = transactions.filter(
      (t) => t.counterpartyName.toLowerCase() === selectedCounterparty.toLowerCase()
    );
    let totalSent = 0;
    let totalReceived = 0;
    let debitsCount = 0;
    let creditsCount = 0;

    cpTx.forEach((t) => {
      if (t.direction === 'debit') {
        totalSent += t.amountKobo;
        debitsCount++;
      } else {
        totalReceived += t.amountKobo;
        creditsCount++;
      }
    });

    return {
      name: selectedCounterparty,
      totalSent,
      totalReceived,
      netFlow: totalReceived - totalSent,
      debitsCount,
      creditsCount,
      totalCount: cpTx.length,
    };
  }, [transactions, selectedCounterparty]);

  // Statement Download Simulation
  const handleDownloadStatement = (format: 'PDF' | 'CSV') => {
    setShowStatementModal(false);
    const content = [
      `TAVI FINANCIAL STATEMENT (${format})`,
      `Account Holder: ${user?.firstName} ${user?.lastName}`,
      `Account Number: ${account?.providerAccountNumber}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Period: October 2024`,
      '----------------------------------------',
      ...filtered.map(
        (t) =>
          `${t.timestamp.slice(0, 10)} | ${t.direction.toUpperCase()} | ₦${(t.amountKobo / 100).toFixed(2)} | ${t.counterpartyName} | ${t.status} | Ref: ${t.reference}`
      ),
    ].join('\n');

    const blob = new Blob([content], { type: format === 'CSV' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAVI_Statement_Oct2024.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader 
        title="Transaction History" 
        onBack={() => navigate(-1)} 
        rightAction={
          <button
            onClick={() => setShowStatementModal(true)}
            className="text-xs font-semibold text-action-green bg-pale-mint px-3 py-1.5 rounded-full hover:bg-mint transition-colors"
          >
            Export Statement
          </button>
        }
      />

      <div className="p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {/* Search */}
        <Input
          placeholder="Search by name, reference, or narration..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'debit', 'credit'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterType === type
                  ? 'bg-action-green text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-border-color hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-border-color rounded-full px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-action-green ml-auto"
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending_confirmation">Pending</option>
            <option value="reversed">Reversed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Counterparty Analysis Card (Section 10.3) */}
        {counterpartyStats && (
          <Card className="p-4 bg-gradient-to-r from-pale-mint to-white border-action-green space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-primary-green uppercase tracking-wide">
                Peer Analysis: {counterpartyStats.name}
              </span>
              <button
                onClick={() => setSelectedCounterparty(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear Filter ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-border-color">
                <span className="text-[10px] text-slate-400">Total Sent</span>
                <p className="text-xs font-bold text-error">{formatNaira(counterpartyStats.totalSent)}</p>
                <span className="text-[9px] text-slate-400">{counterpartyStats.debitsCount} transfers</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-border-color">
                <span className="text-[10px] text-slate-400">Total Received</span>
                <p className="text-xs font-bold text-success">{formatNaira(counterpartyStats.totalReceived)}</p>
                <span className="text-[9px] text-slate-400">{counterpartyStats.creditsCount} transfers</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-border-color">
                <span className="text-[10px] text-slate-400">Net Flow</span>
                <p
                  className={`text-xs font-bold ${
                    counterpartyStats.netFlow >= 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {counterpartyStats.netFlow >= 0 ? '+' : ''}
                  {formatNaira(counterpartyStats.netFlow)}
                </p>
                <span className="text-[9px] text-slate-400">{counterpartyStats.totalCount} total</span>
              </div>
            </div>
          </Card>
        )}

        {/* Transactions List */}
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="No transaction matching the current criteria."
            />
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="tx-row flex items-center justify-between"
              >
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-midnight-navy truncate">
                      {tx.counterpartyName}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{tx.narration}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {CATEGORY_LABELS[tx.category] || tx.category} • {formatTransactionDate(tx.timestamp)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  <span
                    className={tx.direction === 'credit' ? 'amount-credit text-sm' : 'amount-debit text-sm'}
                  >
                    {tx.direction === 'credit' ? '+' : '-'}
                    {formatNaira(tx.amountKobo)}
                  </span>

                  {/* Filter by this peer */}
                  <button
                    onClick={() => setSelectedCounterparty(tx.counterpartyName)}
                    title={`Analyze flow with ${tx.counterpartyName}`}
                    className="p-1.5 text-slate-400 hover:text-action-green hover:bg-pale-mint rounded-lg text-xs"
                  >
                    📊
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 space-y-4 animate-slide-up">
            <h3 className="font-bold text-lg text-midnight-navy">Download Statement</h3>
            <p className="text-xs text-slate-500">
              Generate an official statement preview for your TAVI account details and verified transactions.
            </p>
            <div className="p-3 bg-input-bg rounded-xl space-y-1 text-xs">
              <div><span className="text-slate-400">Account:</span> {account?.accountName} ({account?.providerAccountNumber})</div>
              <div><span className="text-slate-400">Period:</span> Last 30 Days</div>
              <div><span className="text-slate-400">Records:</span> {filtered.length} transactions included</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="primary" onClick={() => handleDownloadStatement('PDF')}>
                📄 Download PDF
              </Button>
              <Button variant="secondary" onClick={() => handleDownloadStatement('CSV')}>
                📊 Download CSV
              </Button>
            </div>
            <Button variant="ghost" fullWidth onClick={() => setShowStatementModal(false)}>
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
