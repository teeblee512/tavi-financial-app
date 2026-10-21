import { useNavigate } from 'react-router-dom';
import { TaviLogo } from '../../components/ui/TaviLogo';
import { Button, Card } from '../../components/ui';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-bg text-midnight-navy flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border-color px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <TaviLogo size={36} showWordmark />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/onboarding')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 text-center max-w-4xl mx-auto flex flex-col items-center">
        <span className="px-3.5 py-1 rounded-full bg-pale-mint text-primary-green text-xs font-bold tracking-wide uppercase mb-4">
          Nigeria's Modern Financial Super App
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-midnight-navy leading-tight">
          Move. Manage. Grow.
        </h1>
        <p className="mt-5 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Phone-number-linked accounts, intelligent spending AI, instant utility payments, transparent FX, 
          and dedicated Nigerian equity investments — all in one unified experience.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Explore Live Prototype →
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
            Demo Account Sign-In
          </Button>
        </div>

        {/* Prototype disclaimer pill */}
        <p className="mt-6 text-xs text-slate-400">
          Prototype build under the leadership of Founder &amp; Project Owner: <span className="font-semibold text-slate-600">Taiwo Layonu</span>.
        </p>
      </section>

      {/* Core Highlights Grid */}
      <section className="bg-white py-16 px-6 border-y border-border-color">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-midnight-navy">Engineered for Everyday Nigerian Money</h2>
            <p className="text-sm text-slate-500">Built with the 10 core principles of transparent financial technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">📱</div>
              <h3 className="font-bold text-lg text-midnight-navy">Phone-Linked Accounts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your account number mirrors your mobile number pattern (e.g. 07074100290 → 7074100290) confirmed directly by our licensed partner bank.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">🤖</div>
              <h3 className="font-bold text-lg text-midnight-navy">AI Financial Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask TAVI to break down your monthly spending, track counterparty transfers to friends, or draft safe payment proposals.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">📈</div>
              <h3 className="font-bold text-lg text-midnight-navy">Dedicated NGX Investing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invest in real Nigerian blue-chips (Dangote Cement, GTCO, Airtel Africa) with strict segregation between spending wallet and brokerage cash.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">💱</div>
              <h3 className="font-bold text-lg text-midnight-navy">Transparent Multi-Currency FX</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live mid-market conversion across USD, GBP, EUR, CAD, CNY, and KRW with guaranteed quote locks and zero hidden markups.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">🎁</div>
              <h3 className="font-bold text-lg text-midnight-navy">Gift Card Liquidation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Convert supported international gift cards (Amazon, Apple, Steam) into instant Naira wallet funds without peer-to-peer risk.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border hover:border-action-green transition-all">
              <div className="text-3xl p-3 bg-pale-mint rounded-xl w-fit">⚡</div>
              <h3 className="font-bold text-lg text-midnight-navy">Instant Bills & Utilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero-fee airtime recharge, 4G/5G data packages, prepaid electricity token vending, and cable TV subscription renewals.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-midnight-navy text-white/70 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <TaviLogo size={28} variant="white" showWordmark />
            <span>© 2026 TAVI Technologies. All rights reserved.</span>
          </div>

          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Regulatory Disclosures</a>
            <a href="#" className="hover:text-white">Security Controls</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
