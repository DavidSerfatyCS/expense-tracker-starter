import { useState, useEffect } from 'react';

// Thailand goal state — client-only, persisted to localStorage (same pattern as
// useBudgets / useFixedItems). The fund never touches Notion for writes: real
// transactions are read elsewhere for the algorithmic part of the balance.
//
// Shape:
//   config:        { targetAmount, startingAmount, tripDate, dailyBudget, startDate } | null
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

const todayStr = () => new Date().toISOString().slice(0, 10);

export function useThailandGoal() {
  const [config, setConfig] = useState(() => load(CONFIG_KEY, null));
  const [contributions, setContributions] = useState(() => load(LEDGER_KEY, []));

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(contributions));
  }, [contributions]);

  // Save / update the goal config. Stamps startDate the first time so the
  // Notion-surplus part of the fund counts from when the goal began.
  const saveConfig = (patch) => setConfig((prev) => {
    const next = { ...(prev || {}), ...patch };
    if (!next.startDate) next.startDate = todayStr();
    return next;
  });

  // Log a manual contribution to the fund.
  const addContribution = ({ amount, date, note }) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setContributions((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, amount: value, date: date || todayStr(), note: note || '' },
      ...prev,
    ]);
  };

  const deleteContribution = (id) =>
    setContributions((prev) => prev.filter((c) => c.id !== id));

  // Full reset (used by "empezar de nuevo" in the fund manager).
  const resetGoal = () => {
    setConfig(null);
    setContributions([]);
  };

  return { config, contributions, saveConfig, addContribution, deleteContribution, resetGoal };
}
