import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader, Input, Button } from '../../components/ui';
import { formatNaira } from '../../services/formatters';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function AskAIPage() {
  const navigate = useNavigate();
  const { transactions, balance } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello Amara! I am TAVI AI, your personal financial assistant. You can ask me about your spending, recent transfers, or ask me to prepare a payment.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    setTimeout(() => {
      let reply = "I couldn't quite find that. Try asking 'How much did I spend this month?' or 'Find my transfer to Ada'.";
      const lower = userMsg.toLowerCase();

      if (lower.includes('spend') || lower.includes('spent') || lower.includes('month')) {
        reply = "In October 2024, your total recorded debits amount to ₦251,100 across transfers, utilities, and airtime.";
      } else if (lower.includes('ada')) {
        const adaTx = transactions.filter((t) => t.counterpartyName.toLowerCase().includes('ada'));
        reply = `You have ${adaTx.length} transactions with Ada Chukwu. Your most recent was ₦50,000 for 'Rent contribution'.`;
      } else if (lower.includes('balance')) {
        reply = `Your available balance is ${formatNaira(balance?.available || 0)}.`;
      } else if (lower.includes('send') || lower.includes('transfer')) {
        reply = "To send money, I can draft the transfer for you! Head over to Payments > Send Money to authorize with your PIN.";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="flex flex-col bg-app-bg min-h-full">
      <PageHeader title="Ask TAVI AI" onBack={() => navigate(-1)} />
      <div className="flex-1 p-5 flex flex-col justify-between max-w-2xl mx-auto w-full">
        <div className="space-y-3 overflow-y-auto max-h-[65vh] pb-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  m.sender === 'user'
                    ? 'bg-action-green text-white rounded-tr-none'
                    : 'bg-white border border-border-color text-midnight-navy shadow-sm rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-3 border-t">
          <Input
            placeholder="Ask about spending, transfers, etc..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button variant="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
