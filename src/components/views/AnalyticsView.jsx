import SpendingTrend from '../SpendingTrend';
import SpendingChart from '../SpendingChart';
import WeekdayChart from '../WeekdayChart';
import MonthComparison from '../MonthComparison';
import AnimatedNumber from '../AnimatedNumber';
import { formatCurrency } from '../../utils/currency';
import { getPeriodBounds, toYMD } from '../../utils/dateUtils';
import { topExpenseCategory } from '../../utils/transactions';
import { CATEGORY_EMOJI } from '../../constants/categories';

function sumExpenses(transactions, start, end) {
  return transactions
    .filter(t => t.type === 'expense' && t.date >= start && t.date <= end)
    .reduce((s, t) => s + t.amount, 0);
}

// Days elapsed within the period (caps at today for the current period).
function daysElapsed(start, end) {
  const today = toYMD(new Date());
  const last = end < today ? end : today;
  const ms = new Date(last + 'T00:00:00') - new Date(start + 'T00:00:00');
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function AnalyticsView({ transactions, period, periodType, periodOffset }) {
  const totalSpent = sumExpenses(transactions, period.start, period.end);

  const prev = getPeriodBounds(periodType, periodOffset - 1);
  const prevSpent = sumExpenses(transactions, prev.start, prev.end);
  const spentDelta = prevSpent > 0 ? ((totalSpent - prevSpent) / prevSpent) * 100 : null;
  const prevLabel = periodType === 'month' ? 'last month' : 'last week';

  const avgDaily = totalSpent / daysElapsed(period.start, period.end);

  const scopedExpenses = transactions.filter(
    t => t.type === 'expense' && t.date >= period.start && t.date <= period.end
  );
  const biggest = scopedExpenses.reduce(
    (max, t) => (max === null || t.amount > max.amount ? t : max), null
  );

  const topCat = topExpenseCategory(transactions, period.start, period.end);

  return (
    <>
      <div className="stat-grid">
        <div className="card card-hover stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value expense-amount">
            <AnimatedNumber value={totalSpent} format={formatCurrency} />
          </div>
          <div className="stat-sub">
            {spentDelta !== null ? (
              <span className={`stat-delta ${totalSpent > prevSpent ? 'negative' : 'positive'}`}>
                {totalSpent > prevSpent ? '+' : ''}{spentDelta.toFixed(0)}% vs {prevLabel}
              </span>
            ) : `nothing spent ${prevLabel}`}
          </div>
        </div>

        <div className="card card-hover stat-card">
          <div className="stat-label">Avg Daily Spend</div>
          <div className="stat-value">
            <AnimatedNumber value={avgDaily} format={formatCurrency} />
          </div>
          <div className="stat-sub">over {daysElapsed(period.start, period.end)} days</div>
        </div>

        <div className="card card-hover stat-card">
          <div className="stat-label">Biggest Expense</div>
          <div className="stat-value">{biggest ? formatCurrency(biggest.amount) : '—'}</div>
          <div className="stat-sub">{biggest ? biggest.description : 'No expenses this period'}</div>
        </div>

        <div className="card card-hover stat-card">
          <div className="stat-label">Top Category</div>
          <div className="stat-value">
            {topCat ? `${CATEGORY_EMOJI[topCat[0]] ?? '📦'} ${formatCurrency(topCat[1])}` : '—'}
          </div>
          <div className="stat-sub" style={{ textTransform: 'capitalize' }}>
            {topCat ? topCat[0] : 'No expenses this period'}
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="full-width">
          <SpendingTrend
            transactions={transactions}
            periodType={periodType}
            periodOffset={periodOffset}
          />
        </div>
        <SpendingChart transactions={transactions} period={period} />
        <WeekdayChart transactions={transactions} />
        <div className="full-width">
          <MonthComparison
            transactions={transactions}
            periodType={periodType}
            periodOffset={periodOffset}
          />
        </div>
      </div>
    </>
  );
}

export default AnalyticsView;
