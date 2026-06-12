import Summary from '../Summary';
import SpendingTrend from '../SpendingTrend';
import RecentTransactions from '../RecentTransactions';
import InsightsPanel from '../InsightsPanel';
import BudgetSnapshot from '../BudgetSnapshot';
import AnimatedNumber from '../AnimatedNumber';
import { formatCurrency } from '../../utils/currency';

function OverviewView({
  transactions, period, periodType, periodOffset,
  fixedItems, budgets, budgetPeriod, onNavigate,
}) {
  const scoped = transactions.filter(t => t.date >= period.start && t.date <= period.end);
  const income  = scoped.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const expense = scoped.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <>
      <section className="card hero">
        <div className="hero-label">Balance · {period.label}</div>
        <div className={`hero-value ${balance < 0 ? 'negative' : ''}`}>
          <AnimatedNumber value={balance} format={formatCurrency} />
        </div>
        <div className="hero-meta">
          <span className="chip chip-income">
            ↑ <AnimatedNumber value={income} format={formatCurrency} /> in
          </span>
          <span className="chip chip-expense">
            ↓ <AnimatedNumber value={expense} format={formatCurrency} /> out
          </span>
          <span className="chip chip-neutral">
            {scoped.length} {scoped.length === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>
      </section>

      <Summary transactions={transactions} period={period} />

      <div className="overview-grid">
        <div className="overview-main">
          <SpendingTrend
            transactions={transactions}
            periodType={periodType}
            periodOffset={periodOffset}
          />
          <RecentTransactions
            transactions={transactions}
            period={period}
            onViewAll={() => onNavigate('transactions')}
          />
        </div>
        <div className="overview-side">
          <InsightsPanel
            transactions={transactions}
            fixedItems={fixedItems}
            period={period}
            periodType={periodType}
            periodOffset={periodOffset}
          />
          <BudgetSnapshot
            transactions={transactions}
            budgets={budgets}
            budgetPeriod={budgetPeriod}
            onViewAll={() => onNavigate('budgets')}
          />
        </div>
      </div>
    </>
  );
}

export default OverviewView;
