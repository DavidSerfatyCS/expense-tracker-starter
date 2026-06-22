import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { getPeriodBounds } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currency';
import { getChartColors } from '../utils/chartColors';

function IncomeExpenseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      fontSize: 12.5,
      fontFamily: 'var(--font-ui)',
      boxShadow: 'var(--shadow-lift)',
    }}>
      <p style={{ margin: '0 0 4px', fontWeight: 500, color: 'var(--text)' }}>{label}</p>
      {payload.map(entry => (
        <p key={entry.dataKey} style={{
          margin: '2px 0',
          color: entry.dataKey === 'income' ? '#2d7d52' : '#1e3a5f',
        }}>
          {entry.name}: {entry.value.toLocaleString('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

function SpendingTrend({ transactions, periodType, periodOffset }) {
  const colors = getChartColors();
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
    <div className="card spending-trend">
      <div className="card-header">
        <h2>Income vs Expenses</h2>
        <span className="card-subtitle">{periodType === 'week' ? 'Last 8 weeks' : 'Last 12 months'}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="25%">
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.muted }} axisLine={{ stroke: colors.border }} tickLine={false} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: colors.muted }} width={80} axisLine={false} tickLine={false} />
          <Tooltip content={<IncomeExpenseTooltip />} cursor={{ fill: colors.border, opacity: .35 }} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: colors.muted }} />
          <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colors.income} opacity={entry.isCurrent ? 1 : 0.35} />
            ))}
          </Bar>
          <Bar dataKey="expense" name="Expenses" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colors.expense} opacity={entry.isCurrent ? 1 : 0.35} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingTrend;
