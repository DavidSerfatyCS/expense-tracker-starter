import { useState } from 'react';
import TransactionList from '../TransactionList';

const DEFAULT_FILTERS = {
  q: '',
  type: 'all',          // all | income | expense
  scope: 'period',      // period | all time
  categories: [],       // multi-select chips
  from: '', to: '',     // explicit date range (overrides scope when set)
  min: '', max: '',     // amount range
};

function TransactionsView({ transactions, period, onDelete, onEdit }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const set = (patch) => setFilters(prev => ({ ...prev, ...patch }));

  const toggleCategory = (cat) =>
    set({
      categories: filters.categories.includes(cat)
        ? filters.categories.filter(c => c !== cat)
        : [...filters.categories, cat],
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const availableCategories = [...new Set(transactions.map(t => t.category))].sort();

  const hasActiveFilters =
    filters.q || filters.type !== 'all' || filters.categories.length > 0 ||
    filters.from || filters.to || filters.min || filters.max || filters.scope !== 'period';

  const q = filters.q.trim().toLowerCase();

  const filtered = transactions
    .filter(t => {
      // Date scope: explicit range wins; otherwise period vs all time.
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      if (!filters.from && !filters.to && filters.scope === 'period') {
        if (t.date < period.start || t.date > period.end) return false;
      }
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;
      if (filters.min !== '' && t.amount < Number(filters.min)) return false;
      if (filters.max !== '' && t.amount > Number(filters.max)) return false;
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => {
      const cmp = sortKey === 'amount'
        ? a.amount - b.amount
        : a.date.localeCompare(b.date);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="card transactions">
      <div className="filters-bar">
        <div className="filters-row">
          <input
            type="search"
            className="search-input"
            placeholder="Search description or category…"
            value={filters.q}
            onChange={e => set({ q: e.target.value })}
          />
          <div className="seg-control">
            <button className={filters.type === 'all' ? 'active' : ''} onClick={() => set({ type: 'all' })}>All</button>
            <button className={filters.type === 'expense' ? 'active' : ''} onClick={() => set({ type: 'expense' })}>Expenses</button>
            <button className={filters.type === 'income' ? 'active' : ''} onClick={() => set({ type: 'income' })}>Income</button>
          </div>
          <div className="seg-control">
            <button className={filters.scope === 'period' ? 'active' : ''} onClick={() => set({ scope: 'period' })}>This period</button>
            <button className={filters.scope === 'all' ? 'active' : ''} onClick={() => set({ scope: 'all' })}>All time</button>
          </div>
        </div>

        <div className="filters-row">
          <div className="chip-row">
            {availableCategories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${filters.categories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="filters-row">
          <div className="range-inputs">
            <label>From <input type="date" value={filters.from} onChange={e => set({ from: e.target.value })} /></label>
            <label>To <input type="date" value={filters.to} onChange={e => set({ to: e.target.value })} /></label>
            <label>Min ₪ <input type="number" min="0" placeholder="0" value={filters.min} onChange={e => set({ min: e.target.value })} /></label>
            <label>Max ₪ <input type="number" min="0" placeholder="∞" value={filters.max} onChange={e => set({ max: e.target.value })} /></label>
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <TransactionList
        transactions={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export default TransactionsView;
