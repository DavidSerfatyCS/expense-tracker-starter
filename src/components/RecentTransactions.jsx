import { formatCurrency } from '../utils/currency';
import { CATEGORY_EMOJI } from '../constants/categories';

function formatDay(ymd) {
  return new Date(ymd + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RecentTransactions({ transactions, period, onViewAll }) {
  const recent = transactions
    .filter(t => t.date >= period.start && t.date <= period.end)
    .slice() // already date-sorted desc from the API, but don't rely on it
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="card recent-transactions">
      <div className="card-header">
        <h2>Recent Activity</h2>
        <span className="card-subtitle">{period.label}</span>
      </div>

      {recent.length === 0 ? (
        <p className="empty-state"><span className="empty-state-icon">🗒️</span>Nothing recorded this period yet.</p>
      ) : (
        <div className="recent-list">
          {recent.map(t => (
            <div key={t.id} className="recent-item">
              <span className="recent-emoji">{CATEGORY_EMOJI[t.category] ?? '📦'}</span>
              <div className="recent-info">
                <div className="recent-name">{t.description}</div>
                <div className="recent-date">{formatDay(t.date)} · {t.category}</div>
              </div>
              <span className={`recent-amount ${t.type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="view-all-btn" onClick={onViewAll}>View all transactions →</button>
    </div>
  );
}

export default RecentTransactions;
