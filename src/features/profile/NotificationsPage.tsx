import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card } from '../../components/ui';

export function NotificationsPage() {
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Inward Transfer Received', desc: '₦200,000 received from Emeka Balogun', time: 'Today, 11:15 AM' },
    { id: 2, title: 'Security Alert', desc: 'New login from Chrome on Windows', time: 'Yesterday, 8:45 PM' },
    { id: 3, title: 'Electricity Token Generated', desc: 'Token: 4930-1829-4829-1029', time: 'Oct 18' },
  ];

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Notifications" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-3 max-w-lg mx-auto w-full">
        {notifications.map((n) => (
          <Card key={n.id} className="p-4 space-y-1">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm text-midnight-navy">{n.title}</h4>
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
            <p className="text-xs text-slate-500">{n.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
