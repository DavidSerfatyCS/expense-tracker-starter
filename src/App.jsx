import { useState, useEffect } from 'react'
import './App.css'
import Summary from './components/Summary'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import SpendingChart from './components/SpendingChart'
import SpendingTrend from './components/SpendingTrend'
import PeriodSelector from './components/PeriodSelector'
import Sidebar from './components/Sidebar'
import AppNav from './components/AppNav'
import { getPeriodBounds } from './utils/dateUtils'
import { useFixedItems } from './hooks/useFixedItems'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3002').replace(/\/$/, '')

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodType, setPeriodType] = useState('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const { fixedItems, addFixedItem, deleteFixedItem } = useFixedItems();

  const period = getPeriodBounds(periodType, periodOffset);

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Failed to delete transaction.');
    }
  };

  if (loading) return <div className="app"><p>Loading from Notion...</p></div>;
  if (error)   return <div className="app"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="app">
      <AppNav />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, David</h1>
            <p className="subtitle">Here's your overview for {period.label}</p>
          </div>
          <div className="dashboard-actions">
            <PeriodSelector
              periodType={periodType}
              periodOffset={periodOffset}
              onTypeChange={setPeriodType}
              onOffsetChange={setPeriodOffset}
            />
            <button
              className="btn-primary"
              onClick={() => document.getElementById('add')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              + Add Transaction
            </button>
          </div>
        </header>

        <section id="overview">
          <Summary transactions={transactions} period={period} />
        </section>

        <section id="add">
          <TransactionForm onAdd={handleAdd} />
        </section>

        <section id="analytics">
          <SpendingTrend transactions={transactions} periodType={periodType} periodOffset={periodOffset} />
          <SpendingChart transactions={transactions} period={period} />
        </section>

        <section id="transactions">
          <TransactionList transactions={transactions} period={period} onDelete={handleDelete} />
        </section>
      </main>

      <aside className="sidebar-container" id="fixed">
        <Sidebar
          transactions={transactions}
          fixedItems={fixedItems}
          onAddFixed={addFixedItem}
          onDeleteFixed={deleteFixedItem}
          period={period}
          periodType={periodType}
          periodOffset={periodOffset}
        />
      </aside>
    </div>
  );
}

export default App
