import { useState, useEffect } from 'react'
import './App.css'
import AppNav from './components/AppNav'
import PeriodSelector from './components/PeriodSelector'
import Modal from './components/Modal'
import TransactionForm from './components/TransactionForm'
import OverviewView from './components/views/OverviewView'
import AnalyticsView from './components/views/AnalyticsView'
import TransactionsView from './components/views/TransactionsView'
import BudgetsView from './components/views/BudgetsView'
import { getPeriodBounds } from './utils/dateUtils'
import { useFixedItems } from './hooks/useFixedItems'
import { useBudgets } from './hooks/useBudgets'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3002').replace(/\/$/, '')

// Apply the saved theme before the first render so charts read the right
// CSS variables on mount (the toggle also flips the attribute pre-setState).
const initialTheme = (() => {
  try { return localStorage.getItem('theme') ?? 'light'; } catch { return 'light'; }
})();
document.documentElement.dataset.theme = initialTheme;

const VIEW_HEADERS = {
  overview:     { title: 'Welcome back, David', subtitle: (label) => `Here's your overview for ${label}` },
  analytics:    { title: 'Analytics',           subtitle: (label) => `Patterns and trends — ${label}` },
  transactions: { title: 'Transactions',        subtitle: (label) => `Every movement for ${label}` },
  budgets:      { title: 'Budgets',             subtitle: (label) => `Monthly limits per category — ${label}` },
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview');
  const [periodType, setPeriodType] = useState('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [theme, setTheme] = useState(initialTheme);
  const { fixedItems, addFixedItem, deleteFixedItem } = useFixedItems();
  const { budgets, setBudget } = useBudgets();

  const period = getPeriodBounds(periodType, periodOffset);
  // Budgets are monthly: follow the selected month, or the current one in week mode.
  const budgetPeriod = periodType === 'month' ? period : getPeriodBounds('month', 0);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
    setTheme(next);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(() => { setError('Could not load transactions from Notion.'); setLoading(false); });
  }, []);

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error('Save failed');
      const { id } = await res.json();
      setTransactions(prev => [...prev, { ...transaction, id }]);
    } catch {
      alert('Failed to save transaction.');
    }
  };

  const handleUpdate = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Update failed');
      setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...fields } : t)));
    } catch {
      alert('Failed to update transaction.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Failed to delete transaction.');
    }
  };

  const header = VIEW_HEADERS[view];
  const headerLabel = view === 'budgets' ? budgetPeriod.label : period.label;

  if (loading) {
    return (
      <div className="app">
        <AppNav view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          <div className="skeleton-stack">
            <div className="skeleton" style={{ height: 38, width: 300 }} />
            <div className="skeleton" style={{ height: 140 }} />
            <div className="skeleton" style={{ height: 96 }} />
            <div className="skeleton" style={{ height: 320 }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <AppNav view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-content">
        <header className="dashboard-header">
          <h1>{header.title}</h1>
          <p className="subtitle">{header.subtitle(headerLabel)}</p>
        </header>

        {error ? (
          <div className="error-banner" style={{ marginTop: 24 }}>{error}</div>
        ) : (
          <>
            <div className="dashboard-toolbar">
              {view !== 'budgets' ? (
                <PeriodSelector
                  periodType={periodType}
                  periodOffset={periodOffset}
                  onTypeChange={setPeriodType}
                  onOffsetChange={setPeriodOffset}
                />
              ) : <span />}
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                + Add Transaction
              </button>
            </div>

            <div className="view" key={view}>
              {view === 'overview' && (
                <OverviewView
                  transactions={transactions}
                  period={period}
                  periodType={periodType}
                  periodOffset={periodOffset}
                  fixedItems={fixedItems}
                  budgets={budgets}
                  budgetPeriod={budgetPeriod}
                  onNavigate={setView}
                />
              )}
              {view === 'analytics' && (
                <AnalyticsView
                  transactions={transactions}
                  period={period}
                  periodType={periodType}
                  periodOffset={periodOffset}
                />
              )}
              {view === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  period={period}
                  onDelete={handleDelete}
                  onEdit={setEditingTx}
                />
              )}
              {view === 'budgets' && (
                <BudgetsView
                  transactions={transactions}
                  budgets={budgets}
                  onSetBudget={setBudget}
                  budgetPeriod={budgetPeriod}
                  fixedItems={fixedItems}
                  onAddFixed={addFixedItem}
                  onDeleteFixed={deleteFixedItem}
                />
              )}
            </div>
          </>
        )}
      </main>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <TransactionForm onSubmit={(t) => { handleAdd(t); setShowAddModal(false); }} />
        </Modal>
      )}

      {editingTx && (
        <Modal onClose={() => setEditingTx(null)}>
          <TransactionForm
            initialTx={editingTx}
            onSubmit={(fields) => { handleUpdate(editingTx.id, fields); setEditingTx(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

export default App
