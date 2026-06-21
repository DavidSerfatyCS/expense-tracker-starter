import { useState, useEffect } from 'react';

// Thailand goal state — client-only, persisted to localStorage (same pattern as
// useBudgets / useFixedItems). The fund never touches Notion: real transactions
// are read elsewhere for feasibility, but contributions live here.
//
// Shape:
//   config:        { targetAmount, startingAmount, tripDate, dailyBudget } | null
//   contributions: [{ id, amount, date, note }]

const CONFIG_KEY = 'thailandGoal';
const LEDGER_KEY = 'thailandContributions';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useThailandGoal() {
  const [config, setConfig] = useState(() => load(CONFIG_KEY, null));
  const [contributions, setContributions] = useState(() => load(LEDGER_KEY, []));

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(contributions));
  }, [contributions]);

  // Save / update the goal config (merges into existing).
  const saveConfig = (patch) => setConfig((prev) => ({ ...(prev || {}), ...patch }));

  // Log a contribution to the fund.
  const addContribution = ({ amount, date, note }) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setContributions((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, amount: value, date: date || new Date().toISOString().slice(0, 10), note: note || '' },
      ...prev,
    ]);
  };

  const deleteContribution = (id) =>
    setContributions((prev) => prev.filter((c) => c.id !== id));

  // Full reset (used by "empezar de nuevo" in the goal settings).
  const resetGoal = () => {
    setConfig(null);
    setContributions([]);
  };

  return { config, contributions, saveConfig, addContribution, deleteContribution, resetGoal };
}
