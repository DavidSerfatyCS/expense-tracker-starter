import { useState, useEffect } from 'react'
import './App.css'
import Summary from './components/Summary'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import SpendingChart from './components/SpendingChart'
import SpendingTrend from './components/SpendingTrend'
import PeriodSelector from './components/PeriodSelector'
import Sidebar from './components/Sidebar'
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
      <div className="layout">
        <main className="main-content">
          <h1>Finance Tracker</h1>
          <p className="subtitle">Track your income and expenses</p>

          <PeriodSelector
            periodType={periodType}
            periodOffset={periodOffset}
            onTypeChange={setPeriodType}
            onOffsetChange={setPeriodOffset}
          />
          <Summary transactions={transactions} period={period} />
          <TransactionForm onAdd={handleAdd} />
          <SpendingTrend transactions={transactions} periodType={periodType} periodOffset={periodOffset} />
          <SpendingChart transactions={transactions} period={period} />
          <TransactionList transactions={transactions} period={period} onDelete={handleDelete} />
        </main>

        <aside className="sidebar-container">
          <Sidebar
            transactions={transactions}
            fixedItems={fixedItems}
            onAddFixed={addFixedItem}
            onDeleteFixed={deleteFixedItem}
          />
        </aside>
      </div>
    </div>
  );
}

export default App
