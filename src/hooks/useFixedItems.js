import { useState, useEffect } from 'react';

// Schema: { id, name, amount, type: 'income'|'expense', group: 'housing'|'utility'|'subscription'|'other', dayOfMonth }

export function useFixedItems() {
  const [fixedItems, setFixedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fixedItems')) ?? []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('fixedItems', JSON.stringify(fixedItems));
  }, [fixedItems]);

  const addFixedItem    = (item) => setFixedItems(prev => [...prev, { ...item, id: Date.now() }]);
  const deleteFixedItem = (id)   => setFixedItems(prev => prev.filter(i => i.id !== id));

  return { fixedItems, addFixedItem, deleteFixedItem };
}
