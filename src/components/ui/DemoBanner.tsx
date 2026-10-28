import { useState } from 'react';
import clsx from 'clsx';
import { useApp } from '../../app/AppContext';

export function DemoBanner() {
  const { user, balance, loginAsTester, resetDemoBalance, logout, isAuthenticated } = useApp();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  return (
    <>
      <div
        className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-3 py-1.5 text-xs font-semibold tracking-wide shadow-md flex items-center justify-between flex-wrap gap-2"
        role="banner"
        aria-label="Demo mode indicator"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-extrabold tracking-wider uppercase text-[11px] bg-black/20 px-1.5 py-0.5 rounded">
            DEMO SANDBOX
          </span>
          <span className="hidden sm:inline text-amber-100 text-[11px]">
            Simulated Funds • Not Real Legal Tender
          </span>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/90 hidden md:inline">
              Tester: <strong className="text-white">{user.firstName}</strong> ({user.demoTag || '@user'})
            </span>

            <button
              onClick={() => setShowSwitchModal(true)}
              className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 text-white text-[10px] font-bold transition-colors border border-white/20"
            >
              Switch Tester
            </button>

            <button
              onClick={() => resetDemoBalance()}
              className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 text-white text-[10px] font-bold transition-colors border border-white/20"
              title="Reset current demo balance to factory ₦250,000.00"
            >
              Reset Balance
            </button>
          </div>
        )}
      </div>

      {/* Modal for fast tester switching during UAT */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-midnight-navy text-base">Select Test Account</h3>
                <p className="text-xs text-slate-500">Instant switch for multi-user UAT testing</p>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  await loginAsTester('amara');
                  setShowSwitchModal(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  user?.phoneInput === '07030000000'
                    ? 'border-action-green bg-pale-mint/30 ring-1 ring-action-green'
                    : 'border-slate-200 hover:border-action-green'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-midnight-navy">Amara Okonkwo (Tester 1)</p>
                  <p className="text-[11px] text-slate-400">@amara • 0703 000 0000</p>
                </div>
                <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded">
                  Tester 1
                </span>
              </button>

              <button
                onClick={async () => {
                  await loginAsTester('babajide');
                  setShowSwitchModal(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  user?.phoneInput === '08020000002'
                    ? 'border-action-green bg-pale-mint/30 ring-1 ring-action-green'
                    : 'border-slate-200 hover:border-action-green'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-midnight-navy">Babajide Adeleke (Tester 2)</p>
                  <p className="text-[11px] text-slate-400">@babajide • 0802 000 0002</p>
                </div>
                <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded">
                  Tester 2
                </span>
              </button>

              <button
                onClick={async () => {
                  await loginAsTester('chioma');
                  setShowSwitchModal(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  user?.phoneInput === '09030000003'
                    ? 'border-action-green bg-pale-mint/30 ring-1 ring-action-green'
                    : 'border-slate-200 hover:border-action-green'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-midnight-navy">Chioma Nwosu (Tester 3)</p>
                  <p className="text-[11px] text-slate-400">@chioma • 0903 000 0003</p>
                </div>
                <span className="text-[11px] font-bold text-primary-green bg-pale-mint px-2 py-0.5 rounded">
                  Tester 3
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  logout();
                  setShowSwitchModal(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Log Out
              </button>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function DemoChip({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full',
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      DEMO
    </span>
  );
}
