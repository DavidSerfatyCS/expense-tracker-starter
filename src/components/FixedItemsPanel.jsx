import { useState } from 'react';
import { formatCurrency } from '../utils/currency';

const EXPENSE_GROUPS = [
  { value: 'housing',      label: 'Housing',       emoji: '🏠' },
  { value: 'utility',      label: 'Utilities',     emoji: '⚡' },
  { value: 'subscription', label: 'Subscriptions', emoji: '📱' },
  { value: 'other',        label: 'Other',         emoji: '📦' },
];

const INCOME_GROUPS = [
  { value: 'salary',    label: 'Salary',    emoji: '💰' },
  { value: 'freelance', label: 'Freelance', emoji: '💻' },
  { value: 'rental',    label: 'Rental',    emoji: '🏘️' },
  { value: 'other',     label: 'Other',     emoji: '📦' },
];

function ordinal(n) {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function FixedItemsPanel({ fixedItems, onAdd, onDelete }) {
  const [activeTab, setActiveTab]   = useState('expense');
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState('');
  const [amount, setAmount]         = useState('');
  const [group, setGroup]           = useState('housing');
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const groups = activeTab === 'expense' ? EXPENSE_GROUPS : INCOME_GROUPS;
  const items  = fixedItems.filter(i => i.type === activeTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setGroup(tab === 'expense' ? 'housing' : 'salary');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || Number(amount) <= 0) return;
    onAdd({ name, amount: Number(amount), type: activeTab, group, dayOfMonth: Number(dayOfMonth) });
    setName(''); setAmount(''); setGroup(activeTab === 'expense' ? 'housing' : 'salary'); setDayOfMonth(1);
    setShowForm(false);
  };

  const monthlyTotal = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="card sidebar-panel">
      <h3 className="sidebar-panel-title">Fixed Items</h3>

      <div className="panel-tabs">
        <button
          className={`panel-tab ${activeTab === 'expense' ? 'active' : ''}`}
          onClick={() => handleTabChange('expense')}
        >
          Expenses
        </button>
        <button
          className={`panel-tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => handleTabChange('income')}
        >
          Income
        </button>
      </div>

      {groups.map(g => {
        const groupItems = items.filter(i => i.group === g.value);
        if (groupItems.length === 0) return null;
        return (
          <div key={g.value} className="fixed-group">
            <div className="fixed-group-header">{g.emoji} {g.label}</div>
            {groupItems.map(item => (
              <div key={item.id} className="fixed-item-row">
                <span className="fixed-item-name">{item.name}</span>
                <span className="fixed-item-day">{ordinal(item.dayOfMonth)}</span>
                <span className="fixed-item-amount">{formatCurrency(item.amount)}</span>
                <button className="fixed-item-delete" onClick={() => onDelete(item.id)}>×</button>
              </div>
            ))}
          </div>
        );
      })}

      {items.length === 0 && !showForm && (
        <p className="insight-empty">No fixed {activeTab === 'expense' ? 'expenses' : 'income'} yet</p>
      )}

      {monthlyTotal > 0 && (
        <div className="fixed-totals">
          <div className="fixed-totals-row">
            <span>Monthly</span>
            <span>{formatCurrency(monthlyTotal)}</span>
          </div>
          <div className="fixed-totals-row muted">
            <span>Annually</span>
            <span>{formatCurrency(monthlyTotal * 12)}</span>
          </div>
        </div>
      )}

      {showForm ? (
        <form className="fixed-add-form" onSubmit={handleSubmit}>
          <input
            type="text" placeholder="Name (e.g. Rent)"
            value={name} onChange={e => setName(e.target.value)}
          />
          <input
            type="number" placeholder="Amount"
            value={amount} onChange={e => setAmount(e.target.value)}
          />
          <select value={group} onChange={e => setGroup(e.target.value)}>
            {groups.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <input
            type="number" placeholder="Day of month" min="1" max="31"
            value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)}
          />
          <div className="fixed-form-actions">
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="fixed-add-btn" onClick={() => setShowForm(true)}>
          + Add fixed {activeTab === 'expense' ? 'expense' : 'income'}
        </button>
      )}
    </div>
  );
}

export default FixedItemsPanel;
