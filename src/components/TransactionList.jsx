import { useState } from 'react'
import { formatCurrency } from '../utils/currency'

function TransactionList({ transactions, period, onDelete }) {
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Derived from actual data so filter options always match the table.
  const availableCategories = [...new Set(transactions.map(t => t.category))].sort();

  const filteredTransactions = transactions
    .filter(t => t.date >= period.start && t.date <= period.end)
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => filterCategory === 'all' || t.category === filterCategory);

  const handleDelete = (id) => {
    if (window.confirm('Delete this transaction?')) onDelete(id);
  };

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h2>Transactions</h2>
        <div className="filters">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="empty-state">No transactions for this period.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="amount-cell">Amount</th>
                <th className="action-cell"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td className="date-cell">{t.date}</td>
                  <td>{t.description}</td>
                  <td><span className="cat-badge">{t.category}</span></td>
                  <td className={`amount-cell ${t.type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="action-cell">
                    <button className="delete-btn" onClick={() => handleDelete(t.id)} aria-label="Delete">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
