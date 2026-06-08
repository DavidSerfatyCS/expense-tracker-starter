// Top expense category within [start, end] (inclusive), as [category, total],
// or null when there are no expenses in range.
export function topExpenseCategory(transactions, start, end) {
  const totals = transactions
    .filter(t => t.date >= start && t.date <= end && t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0] ?? null;
}
