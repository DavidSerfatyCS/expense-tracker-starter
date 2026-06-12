// Expense categories — must match the Select options in the Notion expense DB.
// Income transactions store category "income" (hardcoded server-side).
export const CATEGORIES = ["food & drinks", "transportation", "entertainment", "health", "shopping", "travel", "services"];

// Shared emoji map for category visuals (lists, budgets, insights).
export const CATEGORY_EMOJI = {
  'food & drinks': '🍕', transportation: '🚗', entertainment: '🎬',
  health: '🏥', shopping: '🛍️', travel: '✈️', services: '🔧',
  income: '💰', other: '📦',
};
