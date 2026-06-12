import { useState } from 'react';
import FixedItemsPanel from '../FixedItemsPanel';
import AnimatedNumber from '../AnimatedNumber';
import { formatCurrency } from '../../utils/currency';
import { CATEGORIES, CATEGORY_EMOJI } from '../../constants/categories';

// One card per category. The limit input commits on blur or Enter;
// clearing it removes the budget.
function BudgetCard({ category, limit, spent, onSetBudget }) {
  const [draft, setDraft] = useState(limit != null ? String(limit) : '');

  const commit = () => {
    const value = draft.trim();
    if (value === '' && limit == null) return;
    if (Number(value) === limit) return;
    onSetBudget(category, value === '' ? 0 : Number(value));
  };

  const pct = limit > 0 ? spent / limit : 0;
  const left = limit - spent;

  return (
    <div className="card card-hover budget-card">
      <div className="budget-card-header">
        <span className="budget-emoji">{CATEGORY_EMOJI[category] ?? '📦'}</span>
        <span className="budget-name">{category}</span>
        <input
          className="budget-input num"
          type="number"
          min="0"
          placeholder="Set ₪"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label={`Monthly limit for ${category}`}
        />
      </div>

      {limit > 0 ? (
        <>
          <div className="budget-bar">
            <div
              className={`budget-bar-fill ${pct > 1 ? 'over' : pct >= 0.75 ? 'warn' : ''}`}
              style={{ width: `${Math.min(100, pct * 100)}%` }}
            />
          </div>
          <div className="budget-amounts">
            <span className="num">{formatCurrency(spent)} spent</span>
            {left >= 0
              ? <span className={`num ${pct >= 0.75 ? 'warn-text' : ''}`}>{formatCurrency(left)} left</span>
              : <span className="over num">{formatCurrency(-left)} over</span>}
          </div>
        </>
      ) : (
        <div className="budget-unset">
          {spent > 0
            ? <>No limit set · <span className="num">{formatCurrency(spent)}</span> spent</>
            : 'No limit set'}
        </div>
      )}
    </div>
  );
}

function BudgetsView({
  transactions, budgets, onSetBudget, budgetPeriod,
  fixedItems, onAddFixed, onDeleteFixed,
}) {
  const spentByCategory = transactions
    .filter(t => t.type === 'expense' && t.date >= budgetPeriod.start && t.date <= budgetPeriod.end)
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const trackedSpent = Object.keys(budgets).reduce((s, cat) => s + (spentByCategory[cat] ?? 0), 0);
  const remaining = totalBudget - trackedSpent;

  return (
    <div className="budgets-layout">
      <div className="budgets-main">
        {totalBudget > 0 && (
          <div className="summary">
            <div className="card summary-card">
              <h3>Total Budget</h3>
              <p className="summary-value">
                <AnimatedNumber value={totalBudget} format={formatCurrency} />
              </p>
              <p className="summary-sub">{Object.keys(budgets).length} categories · {budgetPeriod.label}</p>
            </div>
            <div className="card summary-card">
              <h3>Spent</h3>
              <p className="summary-value expense-amount">
                <AnimatedNumber value={trackedSpent} format={formatCurrency} />
              </p>
              <p className="summary-sub">
                {totalBudget > 0 ? `${((trackedSpent / totalBudget) * 100).toFixed(0)}% of budget used` : ''}
              </p>
            </div>
            <div className="card summary-card">
              <h3>Remaining</h3>
              <p className={`summary-value ${remaining < 0 ? 'expense-amount' : 'income-amount'}`}>
                <AnimatedNumber value={remaining} format={formatCurrency} />
              </p>
              <p className="summary-sub">{remaining < 0 ? 'Over budget this month' : 'Available to spend'}</p>
            </div>
          </div>
        )}

        <div className="budgets-grid">
          {CATEGORIES.map(cat => (
            <BudgetCard
              key={cat}
              category={cat}
              limit={budgets[cat]}
              spent={spentByCategory[cat] ?? 0}
              onSetBudget={onSetBudget}
            />
          ))}
        </div>
      </div>

      <aside>
        <FixedItemsPanel fixedItems={fixedItems} onAdd={onAddFixed} onDelete={onDeleteFixed} />
      </aside>
    </div>
  );
}

export default BudgetsView;
