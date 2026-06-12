import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { getCategoryPalette, getChartColors } from '../utils/chartColors';

function SpendingChart({ transactions, period }) {
  const palette = getCategoryPalette();
  const colors = getChartColors();

  const scoped = transactions.filter(t => t.date >= period.start && t.date <= period.end);

  const expensesByCategory = scoped
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="card spending-chart">
      <div className="card-header">
        <h2>Spending by Category</h2>
        <span className="card-subtitle">{period.label}</span>
      </div>
      {data.length === 0 ? (
        <p className="empty-state"><span className="empty-state-icon">🧾</span>No expenses this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.muted }} axisLine={{ stroke: colors.border }} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.muted }} width={80} axisLine={false} tickLine={false} />
            <Tooltip formatter={value => formatCurrency(value)} cursor={{ fill: colors.border, opacity: .35 }} />
            <Bar dataKey="value" name="Spending" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpendingChart;
