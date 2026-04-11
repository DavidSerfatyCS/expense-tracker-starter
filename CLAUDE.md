# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Architecture

This is a single-page React app (Vite) for tracking personal expenses. The `transactions` array lives in `App.jsx` as the single source of truth and is passed down to child components.

**Component tree:**
```
App
├── Summary          — receives transactions, computes and displays income/expenses/balance
├── TransactionForm  — owns its own form state, calls onAdd(transaction) on submit
└── TransactionList  — receives transactions, owns filter state, renders the filtered table
```

**Data model** — transactions are stored in React `useState` as an array of objects:
```js
{ id: number, description: string, amount: number, type: "income"|"expense", category: string, date: "YYYY-MM-DD" }
```

**Data flow:** `App` holds `transactions` → passes to `Summary` (for totals) and `TransactionList` (for display) → `TransactionForm` calls `onAdd` → `App` appends to state.

The `categories` constant is currently duplicated in `TransactionForm` and `TransactionList`.

## Known Issues (intentional course starter bugs)

- No delete button in the UI despite `.delete-btn` CSS already existing
- One seed transaction has wrong `type` ("Freelance Work" is marked `"expense"`)
- No empty state message when the filtered list is empty
