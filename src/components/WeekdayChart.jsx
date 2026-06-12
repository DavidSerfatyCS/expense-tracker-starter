import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { daysAgoYMD } from '../utils/dateUtils';
import { getChartColors } from '../utils/chartColors';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Total spending per weekday over the last 90 days — answers "which day of
// the week do I spend the most?". Window is fixed so weeks compare fairly.
function WeekdayChart({ transactions }) {
  const colors = getChartColors();
  const cutoff = daysAgoYMD(89);

  const totals = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
  transactions
    .filter(t => t.type === 'expense' && t.date >= cutoff)
    .forEach(t => {
      const dow = new Date(t.date + 'T00:00:00').getDay(); // 0 = Sun
      totals[dow === 0 ? 6 : dow - 1] += t.amount;
    });

  const data = DAY_LABELS.map((label, i) => ({ label, value: totals[i] }));
  const max = Math.max(...totals);
  const hasData = max > 0;

  return (
    <div className="card weekday-chart">
      <div className="card-header">
        <h2>Spending by Weekday</h2>
        <span className="card-subtitle">Last 90 days</span>
      </div>
      {!hasData ? (
        <p className="empty-state"><span className="empty-state-icon">📅</span>No expenses in the last 90 days.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: colors.muted }} axisLine={{ stroke: colors.border }} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: colors.muted }} width={80} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => formatCurrency(v)} cursor={{ fill: colors.border, opacity: .35 }} />
            <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.value === max ? colors.accent : colors.expense}
                  opacity={entry.value === max ? 1 : 0.45}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default WeekdayChart;
