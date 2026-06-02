import { getPeriodBounds } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

const CATEGORY_EMOJI = {
  food: '🍕', housing: '🏠', utilities: '⚡',
  transport: '🚗', entertainment: '🎬', salary: '💰', other: '📦',
};

function calcSavingsRate(txns, start, end) {
  const scoped  = txns.filter(t => t.date >= start && t.date <= end);
  const income  = scoped.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = scoped.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, rate: income > 0 ? (income - expense) / income * 100 : null };
}

function InsightsPanel({ transactions, fixedItems }) {
  const today = new Date();
  const { start: mStart, end: mEnd } = getPeriodBounds('month', 0);
  const { start: lStart, end: lEnd } = getPeriodBounds('month', -1);

  const curr = calcSavingsRate(transactions, mStart, mEnd);
  const last = calcSavingsRate(transactions, lStart, lEnd);
  const savingsDelta = curr.rate !== null && last.rate !== null ? curr.rate - last.rate : null;

  // Top expense category this month
  const catTotals = transactions
    .filter(t => t.date >= mStart && t.date <= mEnd && t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  // Fixed costs
  const fixedMonthly = fixedItems.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
  const fixedPct = curr.income > 0 ? fixedMonthly / curr.income * 100 : null;

  // Projected month-end balance
  const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed    = today.getDate();
  const remainingDays = daysInMonth - daysPassed;
  const dailyNet      = daysPassed > 0 ? (curr.income - curr.expense) / daysPassed : 0;
  const projected     = curr.income - curr.expense + remainingDays * dailyNet;

  const monthName = today.toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="sidebar-panel">
      <h3 className="sidebar-panel-title">Insights — {monthName}</h3>

      {/* Savings Rate */}
      <div className="insight-block">
        <div className="insight-label">Savings Rate</div>
        {curr.rate !== null ? (
          <>
            <div className="savings-bar">
              <div
                className="savings-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, curr.rate))}%` }}
              />
            </div>
            <div className="insight-row">
              <span className="insight-value">{curr.rate.toFixed(0)}%</span>
              {savingsDelta !== null && (
                <span className={`insight-delta ${savingsDelta >= 0 ? 'positive' : 'negative'}`}>
                  {savingsDelta >= 0 ? '+' : ''}{savingsDelta.toFixed(0)}% vs last mo
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="insight-empty">No income recorded</p>
        )}
      </div>

      {/* Top Category */}
      {topCat && (
        <div className="insight-block">
          <div className="insight-label">Top Expense</div>
          <div className="insight-row">
            <span className="insight-value">
              {CATEGORY_EMOJI[topCat[0]] || '📦'} {topCat[0]}
            </span>
            <span className="insight-amount">{formatCurrency(topCat[1])}</span>
          </div>
          {curr.expense > 0 && (
            <div className="insight-sub">{(topCat[1] / curr.expense * 100).toFixed(0)}% of expenses</div>
          )}
        </div>
      )}

      {/* Fixed Costs */}
      {fixedMonthly > 0 && (
        <div className="insight-block">
          <div className="insight-label">Fixed Costs</div>
          <div className="insight-row">
            <span className="insight-value">{formatCurrency(fixedMonthly)}/mo</span>
            {fixedPct !== null && (
              <span className="insight-sub">{fixedPct.toFixed(0)}% of income</span>
            )}
          </div>
          <div className="insight-sub">{formatCurrency(fixedMonthly * 12)}/year</div>
        </div>
      )}

      {/* Projected Month-End */}
      {daysPassed > 1 && (
        <div className="insight-block">
          <div className="insight-label">Projected Month-End</div>
          <div className={`insight-value ${projected < 0 ? 'negative' : ''}`}>
            {formatCurrency(projected)}
          </div>
          <div className="insight-sub">Day {daysPassed} of {daysInMonth}</div>
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;
