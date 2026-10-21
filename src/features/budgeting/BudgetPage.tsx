import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, SectionHeader } from '../../components/ui';
import { formatNaira, CATEGORY_LABELS } from '../../services/formatters';

export function BudgetPage() {
  const navigate = useNavigate();
  const { budgets } = useApp();

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Budget & Spending" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <SectionHeader title="October 2024 Budgets" />
        <div className="space-y-3">
          {budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spentKobo / b.limitKobo) * 100));
            return (
              <Card key={b.id} className="p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-midnight-navy">{CATEGORY_LABELS[b.category] || b.category}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {formatNaira(b.spentKobo)} / {formatNaira(b.limitKobo)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${pct > 90 ? 'bg-error' : pct > 75 ? 'bg-warning' : 'bg-action-green'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-right text-slate-400">{pct}% spent</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
