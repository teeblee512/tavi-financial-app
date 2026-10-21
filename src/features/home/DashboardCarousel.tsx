import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { formatNaira, formatDate } from '../../services/formatters';

export function DashboardCarousel() {
  const { balance, investmentAccount, reminders } = useApp();
  const navigate = useNavigate();

  const upcomingReminder = reminders.find((r) => !r.completed);

  return (
    <div className="px-5">
      <div className="carousel-scroll" role="list" aria-label="Dashboard highlights">
        {/* Card B: Spending Insights */}
        <div className="carousel-card" style={{ width: 300 }} role="listitem">
          <div className="card p-4 h-[140px] flex flex-col justify-between bg-gradient-to-br from-pale-mint to-white border-green-100">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">This month</p>
              <p className="text-lg font-bold text-midnight-navy">₦251,100</p>
              <p className="text-xs text-slate-500">↓ 21% less than September</p>
            </div>
            <button
              onClick={() => navigate('/budget')}
              className="text-xs font-semibold text-action-green hover:underline text-left"
            >
              View spending insights →
            </button>
          </div>
        </div>

        {/* Card C: Upcoming payment */}
        {upcomingReminder && (
          <div className="carousel-card" style={{ width: 300 }} role="listitem">
            <div className="card p-4 h-[140px] flex flex-col justify-between border-amber-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-amber-100 rounded-icon flex items-center justify-center">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#B45309" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <p className="text-xs text-warning font-medium">Upcoming</p>
                </div>
                <p className="text-sm font-bold text-midnight-navy">{upcomingReminder.title}</p>
                {upcomingReminder.amountKobo && (
                  <p className="text-base font-semibold text-midnight-navy">{formatNaira(upcomingReminder.amountKobo)}</p>
                )}
                <p className="text-xs text-slate-400">
                  Due {new Date(upcomingReminder.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <button
                onClick={() => navigate('/reminders')}
                className="text-xs font-semibold text-action-green hover:underline text-left"
              >
                View reminder →
              </button>
            </div>
          </div>
        )}

        {/* Card D: Investment overview */}
        {investmentAccount && (
          <div className="carousel-card" style={{ width: 300 }} role="listitem">
            <div className="card p-4 h-[140px] flex flex-col justify-between bg-gradient-to-br from-midnight-navy to-slate-800 border-0">
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-wide mb-1">Portfolio value</p>
                <p className="text-lg font-bold text-white">{formatNaira(investmentAccount.portfolioValueKobo)}</p>
                <p className="text-xs text-green-400">
                  +{formatNaira(investmentAccount.unrealisedGainKobo)} unrealised
                </p>
              </div>
              <button
                onClick={() => navigate('/invest')}
                className="text-xs font-semibold text-mint hover:text-white text-left"
              >
                Open Invest →
              </button>
            </div>
          </div>
        )}

        {/* Card E: FX Calculator */}
        <div className="carousel-card" style={{ width: 280 }} role="listitem">
          <div className="card p-4 h-[140px] flex flex-col justify-between border-blue-100">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">FX Rate</p>
              <p className="text-lg font-bold text-midnight-navy">$1 = ₦1,600</p>
              <p className="text-xs text-slate-400">NGN / USD · indicative rate</p>
              <p className="text-[10px] text-slate-400 mt-0.5">This rate is indicative and may change.</p>
            </div>
            <button
              onClick={() => navigate('/fx')}
              className="text-xs font-semibold text-action-green hover:underline text-left"
            >
              Convert currency →
            </button>
          </div>
        </div>

        {/* Card F: Gift Cards */}
        <div className="carousel-card" style={{ width: 280 }} role="listitem">
          <div className="card p-4 h-[140px] flex flex-col justify-between border-purple-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-purple-100 rounded-icon flex items-center justify-center">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7" />
                  </svg>
                </span>
                <p className="text-xs text-purple-700 font-medium">Gift Cards</p>
              </div>
              <p className="text-sm font-semibold text-midnight-navy">Redeem gift cards for cash</p>
              <p className="text-xs text-slate-400">Amazon, iTunes, Google Play &amp; more</p>
            </div>
            <button
              onClick={() => navigate('/gift-cards')}
              className="text-xs font-semibold text-action-green hover:underline text-left"
            >
              Explore gift cards →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
