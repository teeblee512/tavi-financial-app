import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Input, Button } from '../../components/ui';
import { useClipboard } from '../../hooks/useClipboard';

export function RequestMoneyPage() {
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [linkCreated, setLinkCreated] = useState(false);

  const handleCreate = () => {
    if (!amount) return;
    setLinkCreated(true);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Request Money" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {!linkCreated ? (
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-midnight-navy">Create Payment Request</h3>
            <Input 
              label="Amount to Request (NGN)" 
              placeholder="10,000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input 
              label="Note / Purpose" 
              placeholder="For team lunch / Groceries" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button variant="primary" fullWidth onClick={handleCreate} disabled={!amount}>
              Generate Request Link
            </Button>
          </Card>
        ) : (
          <Card className="p-5 text-center space-y-4">
            <div className="text-4xl">🔗</div>
            <h3 className="font-bold text-lg text-midnight-navy">Payment Link Ready</h3>
            <div className="p-3 bg-pale-mint rounded-lg text-xs font-mono text-primary-green break-all">
              https://tavi.app/pay/req_{Math.random().toString(36).substring(2, 8)}?amt={amount}
            </div>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => copyToClipboard(`https://tavi.app/pay/req_demo?amt=${amount}`, 'Payment link copied')}
            >
              Copy Link & Share
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setLinkCreated(false)}>
              Create Another Request
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
