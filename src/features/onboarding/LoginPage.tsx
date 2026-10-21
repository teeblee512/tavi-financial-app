import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { TaviLogo } from '../../components/ui/TaviLogo';
import { Button, Input } from '../../components/ui';

export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginDemo } = useApp();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    loginDemo();
    navigate('/');
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col" style={{ paddingTop: '24px' }}>
      {/* Header */}
      <div className="bg-deep-emerald px-5 pt-10 pb-10">
        <TaviLogo size={40} variant="white" showWordmark />
        <h1 className="mt-6 text-white text-2xl font-bold">Welcome back</h1>
        <p className="text-mint/80 text-sm mt-1">Sign in to your TAVI account</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-8 flex flex-col gap-4 -mt-4 bg-app-bg rounded-t-[24px]">
        <Input
          label="Phone number"
          type="tel"
          placeholder="0703 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
        <Input
          label="PIN"
          type="password"
          placeholder="••••••"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoComplete="current-password"
          maxLength={6}
          inputMode="numeric"
        />

        <button className="text-action-green text-sm font-medium hover:underline text-left">
          Forgot PIN?
        </button>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleLogin}
          loading={loading}
          className="mt-2"
        >
          Sign in
        </Button>

        {/* Demo shortcut */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-card">
          <p className="text-amber-800 text-sm font-semibold mb-1">DEMO MODE</p>
          <p className="text-amber-700 text-xs mb-3">
            Skip login and explore the full prototype with sample data. No real account is created.
          </p>
          <Button variant="secondary" size="sm" onClick={handleDemoLogin} loading={loading}>
            Enter demo mode
          </Button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-sm text-slate-500">Don't have an account? </span>
          <button
            onClick={() => navigate('/onboarding')}
            className="text-action-green text-sm font-semibold hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
