import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { TaviLogo } from '../../components/ui/TaviLogo';
import { Button, Input, InfoBanner } from '../../components/ui';
import { normaliseNigerianPhone } from '../../services/phoneUtils';

type Step = 'welcome' | 'phone' | 'verify' | 'name' | 'done';

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginDemo } = useApp();
  const navigate = useNavigate();

  const handlePhoneNext = () => {
    const result = normaliseNigerianPhone(phone);
    if (!result.valid) {
      setPhoneError(result.error);
      return;
    }
    setPhoneError('');
    setStep('verify');
  };

  const handleOtpVerify = async () => {
    if (otp.length < 4) {
      setOtpError('Please enter the 6-digit code sent to your number.');
      return;
    }
    setOtpError('');
    setLoading(true);
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('name');
  };

  const handleComplete = async () => {
    if (!firstName.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    loginDemo();
    navigate('/');
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-deep-emerald flex flex-col items-center justify-center px-6 py-12" style={{ paddingTop: '48px' }}>
        <TaviLogo size={64} variant="white" />
        <h1 className="mt-6 text-white text-4xl font-bold tracking-tight">TAVI</h1>
        <p className="text-mint text-base mt-2 text-center">Move. Manage. Grow.</p>
        <p className="text-white/70 text-sm text-center mt-4 max-w-xs leading-relaxed">
          Your modern Nigerian financial super app. Smart payments, investments, and more.
        </p>
        <div className="mt-10 w-full max-w-xs flex flex-col gap-3">
          <Button variant="secondary" size="lg" fullWidth onClick={() => setStep('phone')}>
            Create account
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        </div>
        <p className="mt-8 text-white/40 text-xs text-center max-w-xs">
          TAVI is a prototype application. No real financial transactions are processed.
        </p>
      </div>
    );
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col px-5 py-8" style={{ paddingTop: '48px' }}>
        <button onClick={() => setStep('welcome')} className="mb-8 w-9 h-9 flex items-center justify-center rounded-icon hover:bg-slate-100">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <TaviLogo size={40} showWordmark />
        <h2 className="mt-8 text-2xl font-bold text-midnight-navy">Enter your phone number</h2>
        <p className="text-slate-500 text-sm mt-2">
          We'll send a one-time code to verify your number. Your phone number will be linked to your TAVI account.
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <Input
            label="Phone number"
            type="tel"
            placeholder="0703 000 0000"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
            error={phoneError}
            hint="Enter your Nigerian mobile number"
            autoComplete="tel"
            inputMode="tel"
          />
          <InfoBanner
            type="info"
            message="Your account number will be linked to your phone number, subject to confirmation by your account provider."
          />
        </div>
        <div className="mt-auto pt-6">
          <Button variant="primary" size="lg" fullWidth onClick={handlePhoneNext}>
            Continue
          </Button>
          <p className="text-xs text-slate-400 text-center mt-4">
            By continuing, you agree to TAVI's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    const result = normaliseNigerianPhone(phone);
    const displayPhone = result.valid ? phone : phone;
    return (
      <div className="min-h-screen bg-app-bg flex flex-col px-5 py-8" style={{ paddingTop: '48px' }}>
        <button onClick={() => setStep('phone')} className="mb-8 w-9 h-9 flex items-center justify-center rounded-icon hover:bg-slate-100">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <TaviLogo size={40} showWordmark />
        <h2 className="mt-8 text-2xl font-bold text-midnight-navy">Verify your number</h2>
        <p className="text-slate-500 text-sm mt-2">
          Enter the 6-digit code sent to <span className="font-medium text-midnight-navy">{displayPhone}</span>
        </p>
        <p className="text-amber-600 text-xs mt-1 font-medium">
          DEMO: Use any code (e.g. 123456) to proceed.
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <Input
            label="Verification code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
            error={otpError}
            autoComplete="one-time-code"
          />
        </div>
        <div className="mt-6">
          <button className="text-action-green text-sm font-medium hover:underline">
            Resend code
          </button>
        </div>
        <div className="mt-auto pt-6">
          <Button variant="primary" size="lg" fullWidth onClick={handleOtpVerify} loading={loading}>
            Verify
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col px-5 py-8" style={{ paddingTop: '48px' }}>
        <TaviLogo size={40} showWordmark />
        <h2 className="mt-8 text-2xl font-bold text-midnight-navy">What's your name?</h2>
        <p className="text-slate-500 text-sm mt-2">
          We'll use this on your account.
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <Input
            label="First name"
            placeholder="Amara"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
          <Input
            label="Last name"
            placeholder="Okonkwo"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <div className="mt-auto pt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleComplete}
            loading={loading}
            disabled={!firstName.trim()}
          >
            Create my account
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
