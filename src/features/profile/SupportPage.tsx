import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button } from '../../components/ui';

export function SupportPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Support & Help" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-3">
          <h3 className="font-bold text-midnight-navy">How can we help?</h3>
          <p className="text-xs text-slate-500">
            For demo inquiries, feedback, or simulated reversals:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-input-bg rounded-xl font-medium">💬 Live Chat with Agent (24/7)</div>
            <div className="p-3 bg-input-bg rounded-xl font-medium">📧 support@tavi.app</div>
            <div className="p-3 bg-input-bg rounded-xl font-medium">📞 +234 1 800 TAVI (8284)</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
