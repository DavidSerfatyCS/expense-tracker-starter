import { formatCurrency } from '../utils/currency';
import { CATEGORY_EMOJI } from '../constants/categories';

const EditIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);

const DeleteIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

// Presentational table. Filtering/sorting state lives in TransactionsView.
function TransactionList({ transactions, sortKey, sortDir, onSort, onEdit, onDelete }) {
  const handleDelete = (id) => {
    if (window.confirm('Delete this transaction?')) onDelete(id);
  };

  const arrow = (key) =>
    sortKey === key ? <span className="sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

  if (transactions.length === 0) {
    return (
      <p className="empty-state">
        <span className="empty-state-icon">🔍</span>
        No transactions match your filters.
      </p>
    );
  }

  const income  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => onSort('date')}>Date{arrow('date')}</th>
              <th>Description</th>
              <th>Category</th>
              <th className="sortable amount-cell" onClick={() => onSort('amount')}>Amount{arrow('amount')}</th>
              <th className="action-cell"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="date-cell">{t.date}</td>
                <td>{t.description}</td>
                <td>
                  <span className="cat-badge">
                    {CATEGORY_EMOJI[t.category] ?? '📦'} {t.category}
                  </span>
                </td>
                <td className={`amount-cell ${t.type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                  {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                </td>
                <td className="action-cell">
                  <button className="icon-btn edit-btn" onClick={() => onEdit(t)} aria-label="Edit">
                    {EditIcon}
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => handleDelete(t.id)} aria-label="Delete">
                    {DeleteIcon}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-totals">
        <span>{transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}</span>
        <span>
          Net&nbsp;
          <strong className={net < 0 ? 'expense-amount' : 'income-amount'}>
            {net < 0 ? '−' : '+'}{formatCurrency(Math.abs(net))}
          </strong>
        </span>
      </div>
    </>
  );
}

export default TransactionList;
