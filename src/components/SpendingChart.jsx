import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#4f86c6', '#e07b54', '#5ab27e', '#c97fc4', '#e8c04a', '#7a7a7a'];

function SpendingChart({ transactions, period }) {
  const scoped = transactions.filter(t => t.date >= period.start && t.date <= period.end);

  const expensesByCategory = scoped
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="spending-chart">
      <div className="card-header">
        <h2>Spending by Category</h2>
        <span className="card-subtitle">{period.label}</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 13 }} width={80} />
          <Tooltip formatter={value => formatCurrency(value)} />
          <Bar dataKey="value" name="Spending">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
