import { useState, useEffect } from 'react';

// Schema: { [category]: number } — monthly spending limit per expense category.
// Client-only, persisted to localStorage (same pattern as useFixedItems).

export function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('budgets')) ?? {}; }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const setBudget = (category, amount) => {
    setBudgets(prev => {
      const next = { ...prev };
      if (!amount || Number(amount) <= 0) delete next[category];
      else next[category] = Number(amount);
      return next;
    });
  };

  return { budgets, setBudget };
}
