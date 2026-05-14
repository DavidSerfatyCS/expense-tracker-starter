import { useState, useEffect } from 'react'
import './App.css'
import Summary from './Summary'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import SpendingChart from './SpendingChart'

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3002/api/transactions')
      .then(res => res.json())
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(() => { setError('Could not load transactions from Notion.'); setLoading(false); });
  }, []);

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch('http://localhost:3002/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const { id } = await res.json();
      setTransactions(prev => [...prev, { ...transaction, id }]);
    } catch {
      alert('Failed to save transaction.');
    }
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="app"><p>Loading from Notion...</p></div>;
  if (error) return <div className="app"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="app">
      <h1>Finance Tracker</h1>
      <p className="subtitle">Track your income and expenses</p>

      <Summary transactions={transactions} />
      <TransactionForm onAdd={handleAdd} />
      <SpendingChart transactions={transactions} />
      <TransactionList transactions={transactions} onDelete={handleDelete} />
    </div>
  );
}

export default App
