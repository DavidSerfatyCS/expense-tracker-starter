import { useState } from 'react'
import { CATEGORIES } from '../constants/categories'
import { todayYMD } from '../utils/dateUtils'

// Add mode (no `initialTx`): full form with type switch, date defaults to today.
// Edit mode (`initialTx` set): same fields pre-filled; the type cannot change —
// switching income<->expense would mean moving the page between Notion DBs.
function TransactionForm({ onSubmit, initialTx }) {
  const isEdit = Boolean(initialTx);

  const [description, setDescription] = useState(initialTx?.description ?? "");
  const [amount, setAmount] = useState(initialTx?.amount != null ? String(initialTx.amount) : "");
  const [type, setType] = useState(initialTx?.type ?? "expense");
  const [category, setCategory] = useState(
    initialTx && CATEGORIES.includes(initialTx.category) ? initialTx.category : CATEGORIES[0]
  );
  const [date, setDate] = useState(initialTx?.date ?? todayYMD());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0 || !date) return;

    onSubmit({
      description,
      amount: Number(amount),
      type,
      category: type === 'income' ? 'income' : category,
      date,
    });

    if (!isEdit) {
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory(CATEGORIES[0]);
      setDate(todayYMD());
    }
  };

  return (
    <div className="add-transaction">
      <h2>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <div className="seg-control">
            <button
              type="button"
              className={type === 'expense' ? 'active active-expense' : ''}
              onClick={() => setType('expense')}
            >Expense</button>
            <button
              type="button"
              className={type === 'income' ? 'active active-income' : ''}
              onClick={() => setType('income')}
            >Income</button>
          </div>
        )}

        <label className="form-field">
          <span>Description</span>
          <input
            type="text"
            placeholder="e.g. Groceries at the shuk"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />
        </label>

        <div className="form-row">
          <label className="form-field">
            <span>Amount (₪)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              max={todayYMD()}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        {type === 'expense' && (
          <label className="form-field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" className="btn-primary form-submit">
          {isEdit ? 'Save changes' : 'Add transaction'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
