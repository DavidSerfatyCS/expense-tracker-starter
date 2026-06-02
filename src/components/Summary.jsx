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

  return (
    <div className="summary">
      <div className="summary-card">
        <h3>Income</h3>
        <p className="income-amount">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="summary-card">
        <h3>Expenses</h3>
        <p className="expense-amount">{formatCurrency(totalExpenses)}</p>
      </div>
      <div className="summary-card">
        <h3>Balance</h3>
        <p className="balance-amount">{formatCurrency(balance)}</p>
      </div>
    </div>
  );
}

export default Summary;
