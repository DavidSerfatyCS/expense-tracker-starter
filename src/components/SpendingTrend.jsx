import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { getPeriodBounds } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';

function SpendingTrend({ transactions, periodType, periodOffset }) {
  const count = periodType === 'week' ? 8 : 12;

  const data = Array.from({ length: count }, (_, i) => {
    const offset = periodOffset - (count - 1 - i);
    const { start, end } = getPeriodBounds(periodType, offset);
    const firstDay = new Date(start + 'T00:00:00');

    const shortLabel = periodType === 'week'
      ? firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : firstDay.toLocaleDateString('en-US', { month: 'short' });

    const periodTxns = transactions.filter(t => t.date >= start && t.date <= end);
    const income  = periodTxns.filter(t => t.type === 'income') .reduce((sum, t) => sum + t.amount, 0);
    const expense = periodTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return { label: shortLabel, income, expense, isCurrent: i === count - 1 };
  });

  return (
    <div className="spending-trend">
      <h2>Income vs Expenses — {periodType === 'week' ? 'Last 8 Weeks' : 'Last 12 Months'}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="25%">
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={v => formatCurrency(v)} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isCurrent ? '#2d6a4f' : '#2d6a4f44'} />
            ))}
          </Bar>
          <Bar dataKey="expense" name="Expenses" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isCurrent ? '#b84030' : '#b8403044'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingTrend;
