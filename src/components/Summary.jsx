import { formatCurrency } from '../utils/currency';

function Summary({ transactions, period }) {
  const scoped = transactions.filter(t => t.date >= period.start && t.date <= period.end);

  const totalIncome = scoped
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = scoped
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Supporting text
  const incomeCount = scoped.filter(t => t.type === 'income').length;
  const incomeSub = incomeCount > 0
    ? `${incomeCount} ${incomeCount === 1 ? 'entry' : 'entries'} this period`
    : 'No income recorded';

  const catTotals = scoped
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const expenseSub = topCat ? `Top category: ${topCat[0]}` : 'No expenses recorded';

  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : null;
  const balanceSub = savingsRate !== null
    ? `Savings rate: ${savingsRate.toFixed(0)}%`
    : 'Add income to see savings';

  return (
    <div className="summary">
      <div className="summary-card">
        <h3>Income</h3>
        <p className="summary-value income-amount">{formatCurrency(totalIncome)}</p>
        <p className="summary-sub">{incomeSub}</p>
      </div>
      <div className="summary-card">
        <h3>Expenses</h3>
        <p className="summary-value expense-amount">{formatCurrency(totalExpenses)}</p>
        <p className="summary-sub">{expenseSub}</p>
      </div>
      <div className="summary-card">
        <h3>Balance</h3>
        <p className={`summary-value balance-amount ${balance < 0 ? 'negative' : ''}`}>
          {formatCurrency(balance)}
        </p>
        <p className="summary-sub">{balanceSub}</p>
      </div>
    </div>
  );
}

export default Summary;
