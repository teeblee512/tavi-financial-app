import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { TaviLogo } from '../../components/ui/TaviLogo';
import { Button, Input } from '../../components/ui';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithCredentials, loginAsTester } = useApp();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError('Please enter your phone number, email, or @demoTag.');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter your password or 4-digit PIN.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await loginWithCredentials(identifier.trim(), pin.trim());
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickTesterLogin = async (tester: 'amara' | 'babajide' | 'chioma') => {
    setLoading(true);
    setError('');
    const success = await loginAsTester(tester);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col" style={{ paddingTop: '24px' }}>
      {/* Header */}
      <div className="bg-deep-emerald px-5 pt-8 pb-10">
        <TaviLogo size={40} variant="white" showWordmark />
        <div className="mt-4 flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-full bg-amber-400 text-amber-950">
            DEMO SANDBOX
          </span>
          <span className="text-xs text-mint/80">Multi-User Testing</span>
        </div>
        <h1 className="mt-2 text-white text-2xl font-bold">Welcome back</h1>
        <p className="text-mint/80 text-sm mt-1">Sign in with an independent tester account</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-6 flex flex-col gap-4 -mt-4 bg-app-bg rounded-t-[24px]">
        {/* Quick Tester Picker for UAT */}
        <div className="p-4 bg-white border border-border-color rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            1-Click UAT Test Accounts:
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickTesterLogin('amara')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl border border-border-color hover:border-action-green hover:bg-pale-mint/30 transition-all text-left"
            >
              <div>
                <p className="text-xs font-bold text-midnight-navy">Amara Okonkwo (Tester 1)</p>
                <p className="text-[11px] text-slate-400">@amara • 0703 000 0000</p>
              </div>
              <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded-md">
                ₦485k Demo
              </span>
            </button>

            <button
              onClick={() => handleQuickTesterLogin('babajide')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl border border-border-color hover:border-action-green hover:bg-pale-mint/30 transition-all text-left"
            >
              <div>
                <p className="text-xs font-bold text-midnight-navy">Babajide Adeleke (Tester 2)</p>
                <p className="text-[11px] text-slate-400">@babajide • 0802 000 0002</p>
              </div>
              <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded-md">
                ₦250k Demo
              </span>
            </button>

            <button
              onClick={() => handleQuickTesterLogin('chioma')}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-xl border border-border-color hover:border-action-green hover:bg-pale-mint/30 transition-all text-left"
            >
              <div>
                <p className="text-xs font-bold text-midnight-navy">Chioma Nwosu (Tester 3)</p>
                <p className="text-[11px] text-slate-400">@chioma • 0903 000 0003</p>
              </div>
              <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded-md">
                ₦150k Demo
              </span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border-color"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">Or enter credentials</span>
          <div className="flex-grow border-t border-border-color"></div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Phone, Email, or @demoTag"
          type="text"
          placeholder="e.g. 0802 000 0002 or @babajide"
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
          autoComplete="username"
        />

        <Input
          label="Password or 4-digit PIN"
          type="password"
          placeholder="•••• (e.g. 1234)"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          autoComplete="current-password"
          maxLength={10}
        />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleLogin}
          loading={loading}
          className="mt-2"
        >
          Sign in to Demo Sandbox
        </Button>

        {/* Demo safety banner */}
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 text-xs font-semibold">SAFE SANDBOX ENVIRONMENT</p>
          <p className="text-amber-700 text-[11px] mt-0.5">
            All tester funds are simulated demo tokens for peer transfer UAT. Real money cannot be deposited or withdrawn.
          </p>
        </div>

        <div className="mt-2 text-center pb-6">
          <span className="text-sm text-slate-500">Need a fresh tester account? </span>
          <button
            onClick={() => navigate('/onboarding')}
            className="text-action-green text-sm font-semibold hover:underline"
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
}
