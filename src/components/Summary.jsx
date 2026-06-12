import AnimatedNumber from './AnimatedNumber';
import { formatCurrency } from '../utils/currency';
import { topExpenseCategory } from '../utils/transactions';
import { CATEGORY_EMOJI } from '../constants/categories';

// Compact stat row under the hero. The hero already shows the balance, so the
// third card surfaces the savings rate instead of repeating it.
function Summary({ transactions, period }) {
  const scoped = transactions.filter(t => t.date >= period.start && t.date <= period.end);

  const totalIncome = scoped
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = scoped
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeCount = scoped.filter(t => t.type === 'income').length;
  const incomeSub = incomeCount > 0
    ? `${incomeCount} ${incomeCount === 1 ? 'entry' : 'entries'} this period`
    : 'No income recorded';

  const topCat = topExpenseCategory(transactions, period.start, period.end);
  const expenseSub = topCat
    ? `Top: ${CATEGORY_EMOJI[topCat[0]] ?? '📦'} ${topCat[0]}`
    : 'No expenses recorded';

  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome) * 100
    : null;

  return (
    <div className="summary">
      <div className="card card-hover summary-card">
        <h3>Income</h3>
        <p className="summary-value income-amount">
          <AnimatedNumber value={totalIncome} format={formatCurrency} />
        </p>
        <p className="summary-sub">{incomeSub}</p>
      </div>
      <div className="card card-hover summary-card">
        <h3>Expenses</h3>
        <p className="summary-value expense-amount">
          <AnimatedNumber value={totalExpenses} format={formatCurrency} />
        </p>
        <p className="summary-sub">{expenseSub}</p>
      </div>
      <div className="card card-hover summary-card">
        <h3>Savings Rate</h3>
        <p className={`summary-value ${savingsRate !== null && savingsRate < 0 ? 'expense-amount' : ''}`}>
          {savingsRate !== null
            ? <AnimatedNumber value={savingsRate} format={(v) => `${v.toFixed(0)}%`} />
            : '—'}
        </p>
        <p className="summary-sub">
          {savingsRate !== null ? 'of income kept this period' : 'Add income to see savings'}
        </p>
      </div>
    </div>
  );
}

export default Summary;
