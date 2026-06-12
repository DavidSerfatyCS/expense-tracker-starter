import { formatCurrency } from '../utils/currency';
import { getPeriodBounds } from '../utils/dateUtils';
import { CATEGORY_EMOJI } from '../constants/categories';

function spentByCategory(transactions, start, end) {
  return transactions
    .filter(t => t.type === 'expense' && t.date >= start && t.date <= end)
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
}

// Category-by-category spend: selected month vs the month before it.
// In week mode it compares the current month against the previous one.
function MonthComparison({ transactions, periodType, periodOffset }) {
  const monthOffset = periodType === 'month' ? periodOffset : 0;
  const cur  = getPeriodBounds('month', monthOffset);
  const prev = getPeriodBounds('month', monthOffset - 1);

  const curSpent  = spentByCategory(transactions, cur.start, cur.end);
  const prevSpent = spentByCategory(transactions, prev.start, prev.end);

  const categories = [...new Set([...Object.keys(curSpent), ...Object.keys(prevSpent)])];
  const rows = categories
    .map(cat => ({ cat, cur: curSpent[cat] ?? 0, prev: prevSpent[cat] ?? 0 }))
    .sort((a, b) => b.cur - a.cur);

  const max = Math.max(1, ...rows.map(r => Math.max(r.cur, r.prev)));

  return (
    <div className="card month-comparison">
      <div className="card-header">
        <h2>Month vs Month</h2>
        <span className="card-subtitle">{cur.label} vs {prev.label}</span>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state"><span className="empty-state-icon">⚖️</span>No expenses in either month.</p>
      ) : (
        <>
          <div className="compare-legend">
            <span><span className="legend-dot" style={{ background: 'var(--expense)' }} />{cur.label}</span>
            <span><span className="legend-dot" style={{ background: 'var(--border-strong)' }} />{prev.label}</span>
          </div>

          {rows.map(({ cat, cur: c, prev: p }) => {
            // More spending than last month is bad news → red; less → green.
            const delta = p > 0 ? ((c - p) / p) * 100 : null;
            const deltaClass = delta === null ? 'neutral' : c > p ? 'negative' : 'positive';
            const deltaText = delta === null
              ? (c > 0 ? 'new' : '—')
              : `${c > p ? '+' : ''}${delta.toFixed(0)}%`;

            return (
              <div key={cat} className="compare-row">
                <span className="compare-cat">{CATEGORY_EMOJI[cat] ?? '📦'} {cat}</span>
                <div className="compare-bars">
                  <div className="compare-bar current"  style={{ width: `${(c / max) * 100}%` }} title={formatCurrency(c)} />
                  <div className="compare-bar previous" style={{ width: `${(p / max) * 100}%` }} title={formatCurrency(p)} />
                </div>
                <span className={`compare-delta ${deltaClass}`}>{deltaText}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default MonthComparison;
