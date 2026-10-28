import { useNavigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { formatNaira } from '../../services/formatters';

export function DashboardCarousel() {
  const { investmentAccount, reminders } = useApp();
  const navigate = useNavigate();

  const upcomingReminder = reminders.find((r) => !r.completed);

  return (
    <div className="px-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" role="list" aria-label="Dashboard highlights">
        {/* Card 1: Monthly Spending Insights */}
        <div className="card p-4 min-h-[145px] flex flex-col justify-between bg-gradient-to-br from-pale-mint/60 to-white border-green-100 hover:shadow-sm transition-shadow" role="listitem">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">This Month</span>
              <span className="text-[10px] bg-green-100 text-primary-green px-2 py-0.5 rounded-full font-medium">↓ 21%</span>
            </div>
            <p className="text-xl font-extrabold text-midnight-navy">₦251,100.00</p>
            <p className="text-xs text-slate-500 mt-0.5">Budget on track (76% used)</p>
          </div>
          <button
            onClick={() => navigate('/budget')}
            className="text-xs font-semibold text-action-green hover:underline text-left mt-2 flex items-center gap-1"
          >
            Spending Insights <span>→</span>
          </button>
        </div>

        {/* Card 2: Upcoming Payment Reminder */}
        {upcomingReminder && (
          <div className="card p-4 min-h-[145px] flex flex-col justify-between border-amber-100/80 bg-amber-50/20 hover:shadow-sm transition-shadow" role="listitem">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  Upcoming
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(upcomingReminder.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className="text-sm font-bold text-midnight-navy truncate">{upcomingReminder.title}</p>
              {upcomingReminder.amountKobo && (
                <p className="text-lg font-extrabold text-midnight-navy mt-0.5">{formatNaira(upcomingReminder.amountKobo)}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="text-xs font-semibold text-action-green hover:underline text-left mt-2 flex items-center gap-1"
            >
              View Reminders <span>→</span>
            </button>
          </div>
        )}

        {/* Card 3: Investment Portfolio */}
        {investmentAccount && (
          <div className="card p-4 min-h-[145px] flex flex-col justify-between bg-gradient-to-br from-midnight-navy to-slate-900 text-white border-0 hover:shadow-sm transition-shadow" role="listitem">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">NGX Portfolio</span>
                <span className="text-[10px] bg-white/10 text-mint px-2 py-0.5 rounded-full font-medium">+12.4%</span>
              </div>
              <p className="text-xl font-extrabold text-mint">{formatNaira(investmentAccount.portfolioValueKobo)}</p>
              <p className="text-xs text-green-300/80 mt-0.5">
                +{formatNaira(investmentAccount.unrealisedGainKobo)} unrealised gain
              </p>
            </div>
            <button
              onClick={() => navigate('/invest')}
              className="text-xs font-semibold text-mint hover:text-white text-left mt-2 flex items-center gap-1"
            >
              Open Brokerage <span>→</span>
            </button>
          </div>
        )}

        {/* Card 4: Indicative FX Rate */}
        <div className="card p-4 min-h-[145px] flex flex-col justify-between border-blue-100 hover:shadow-sm transition-shadow" role="listitem">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Mid-Market FX</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Indicative</span>
            </div>
            <p className="text-xl font-extrabold text-midnight-navy">$1 = ₦1,600.00</p>
            <p className="text-[11px] text-slate-400 mt-0.5">USD / NGN · Zero hidden fees</p>
          </div>
          <button
            onClick={() => navigate('/fx')}
            className="text-xs font-semibold text-action-green hover:underline text-left mt-2 flex items-center gap-1"
          >
            Convert Currencies <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
