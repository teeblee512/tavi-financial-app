import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Card, Button, Input, SectionHeader } from '../../components/ui';
import { formatNaira, formatDate } from '../../services/formatters';

export function RemindersPage() {
  const navigate = useNavigate();
  const { reminders, addReminder, completeReminder } = useApp();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2024-11-01');

  const handleCreate = () => {
    if (!title) return;
    addReminder({
      title,
      dueDate: new Date(date).toISOString(),
      amountKobo: (parseFloat(amount) || 0) * 100,
      currency: 'NGN',
      recurrence: 'monthly',
      notificationEnabled: true,
      completed: false,
    });
    setTitle('');
    setAmount('');
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Reminders" onBack={() => navigate(-1)} />
      <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <Card className="p-4 space-y-3">
          <SectionHeader title="Add New Reminder" />
          <Input placeholder="Reminder Title (e.g. Rent, Gym)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Amount in NGN (optional)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button variant="primary" fullWidth onClick={handleCreate}>
            Set Reminder
          </Button>
        </Card>

        <SectionHeader title="Active Reminders" />
        <div className="space-y-2">
          {reminders.map((r) => (
            <Card key={r.id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className={`text-sm font-semibold ${r.completed ? 'line-through text-slate-400' : 'text-midnight-navy'}`}>
                  {r.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {r.amountKobo ? `${formatNaira(r.amountKobo)} • ` : ''}Due {formatDate(r.dueDate)}
                </p>
              </div>
              {!r.completed && (
                <Button size="sm" variant="secondary" onClick={() => completeReminder(r.id)}>
                  Mark Done
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
