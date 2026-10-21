import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, SectionHeader } from '../../components/ui';

export function PaymentsPage() {
  const navigate = useNavigate();

  const services = [
    { label: 'Send Money', desc: 'Bank transfer or TAVI-to-TAVI', path: '/payments/send', icon: '💸' },
    { label: 'Add Money', desc: 'Top up your account via card or transfer', path: '/payments/add', icon: '💳' },
    { label: 'Request Money', desc: 'Create and share payment links', path: '/payments/request', icon: '📥' },
    { label: 'Pay Bills & Utilities', desc: 'Airtime, Data, Electricity, Cable TV', path: '/payments/bills', icon: '⚡' },
  ];

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Payments & Transfers" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4">
        <SectionHeader title="Transfers & Actions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((s) => (
            <Card key={s.label} onClick={() => navigate(s.path)} className="flex items-center gap-4 p-4 cursor-pointer hover:border-action-green">
              <div className="text-3xl p-2 bg-pale-mint rounded-xl">{s.icon}</div>
              <div>
                <h3 className="font-semibold text-midnight-navy">{s.label}</h3>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
