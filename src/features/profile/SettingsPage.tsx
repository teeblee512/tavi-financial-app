import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card } from '../../components/ui';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Security & Settings" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-midnight-navy">Security Settings</h3>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="font-semibold text-sm">Biometric Authentication</p>
              <p className="text-xs text-slate-500">Log in with FaceID or Fingerprint</p>
            </div>
            <span className="text-xs text-action-green font-bold">Enabled</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <p className="font-semibold text-sm">Change Transaction PIN</p>
              <p className="text-xs text-slate-500">Required for transfers</p>
            </div>
            <span className="text-xs text-slate-400">••••</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-semibold text-sm">Daily Transfer Limit</p>
              <p className="text-xs text-slate-500">Tier 3 KYC Verified</p>
            </div>
            <span className="text-xs font-bold text-midnight-navy">₦5,000,000</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
