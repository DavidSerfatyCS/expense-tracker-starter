import { formatCurrency } from '../utils/currency';
import { CATEGORY_EMOJI } from '../constants/categories';

// Side-panel mini view of the most-consumed budgets for the month.
function BudgetSnapshot({ transactions, budgets, budgetPeriod, onViewAll }) {
  const spentByCategory = transactions
    .filter(t => t.type === 'expense' && t.date >= budgetPeriod.start && t.date <= budgetPeriod.end)
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

  const rows = Object.entries(budgets)
    .map(([category, limit]) => ({
      category,
      limit,
      spent: spentByCategory[category] ?? 0,
      pct: (spentByCategory[category] ?? 0) / limit,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  return (
    <div className="card sidebar-panel">
      <h3 className="sidebar-panel-title">Budgets — {budgetPeriod.label}</h3>

      {rows.length === 0 ? (
        <p className="insight-empty">No budgets set yet.</p>
      ) : (
        rows.map(({ category, limit, spent, pct }) => (
          <div key={category} className="snapshot-row">
            <div className="snapshot-top">
              <span className="snapshot-cat">{CATEGORY_EMOJI[category] ?? '📦'} {category}</span>
              <span className="snapshot-nums num">{formatCurrency(spent)} / {formatCurrency(limit)}</span>
            </div>
            <div className="budget-bar">
              <div
                className={`budget-bar-fill ${pct > 1 ? 'over' : pct >= 0.75 ? 'warn' : ''}`}
                style={{ width: `${Math.min(100, pct * 100)}%` }}
              />
            </div>
          </div>
        ))
      )}

      <button className="view-all-btn" onClick={onViewAll}>
        {rows.length === 0 ? 'Set monthly limits →' : 'Manage budgets →'}
      </button>
    </div>
  );
}

export default BudgetSnapshot;
