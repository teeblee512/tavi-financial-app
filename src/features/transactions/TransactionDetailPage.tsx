import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, StatusBadge, Button } from '../../components/ui';
import { formatNaira, formatDate, CATEGORY_LABELS } from '../../services/formatters';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions } = useApp();

  const tx = transactions.find((t) => t.id === id);

  if (!tx) {
    return (
      <div className="p-5 text-center">
        <p>Transaction not found.</p>
        <Button onClick={() => navigate('/transactions')}>Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Transaction Details" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-6 text-center space-y-2">
          <div className="text-sm text-slate-500">Amount</div>
          <div className={`text-3xl font-extrabold ${tx.direction === 'credit' ? 'amount-credit' : 'amount-debit'}`}>
            {tx.direction === 'credit' ? '+' : '-'}{formatNaira(tx.amountKobo)}
          </div>
          <div>
            <StatusBadge status={tx.status} />
          </div>
        </Card>

        <Card className="p-5 space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Counterparty</span>
            <span className="font-semibold text-midnight-navy">{tx.counterpartyName}</span>
          </div>
          {tx.counterpartyAccount && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Account</span>
              <span className="font-medium">{tx.counterpartyAccount} ({tx.counterpartyBank})</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Category</span>
            <span>{CATEGORY_LABELS[tx.category] || tx.category}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Date & Time</span>
            <span>{formatDate(tx.timestamp)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Narration</span>
            <span className="font-medium">{tx.narration}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Reference</span>
            <span className="font-mono text-xs">{tx.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fee</span>
            <span>{formatNaira(tx.feeKobo)}</span>
          </div>
        </Card>

        <Button variant="secondary" fullWidth onClick={() => navigate('/support')}>
          Report an issue with this transaction
        </Button>
      </div>
    </div>
  );
}
