import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, StatusBadge, EmptyState } from '../../components/ui';
import { formatNaira, formatTransactionDate, CATEGORY_LABELS } from '../../services/formatters';

export function TransactionsPage() {
  const navigate = useNavigate();
  const { transactions } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.counterpartyName.toLowerCase().includes(search.toLowerCase()) ||
      tx.narration.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && tx.direction === filterType;
  });

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Transaction History" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <Input 
          placeholder="Search by counterparty, narration, or ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          {(['all', 'debit', 'credit'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterType === type 
                  ? 'bg-action-green text-white' 
                  : 'bg-white text-slate-600 border border-border-color hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState title="No transactions found" description="Try a different search or filter." />
          ) : (
            filtered.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="tx-row"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-midnight-navy truncate">{tx.counterpartyName}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{tx.narration}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {CATEGORY_LABELS[tx.category] || tx.category} • {formatTransactionDate(tx.timestamp)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={tx.direction === 'credit' ? 'amount-credit' : 'amount-debit'}>
                    {tx.direction === 'credit' ? '+' : '-'}{formatNaira(tx.amountKobo)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
