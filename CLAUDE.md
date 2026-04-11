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

This is a single-page React app (Vite) for tracking personal expenses. The entire application lives in one monolithic component — `src/App.jsx` — with no sub-components. All state, computed values, filtering logic, and JSX are co-located there.

**Data model** — transactions are stored in React `useState` as an array of objects:
```js
{ id: number, description: string, amount: string, type: "income"|"expense", category: string, date: "YYYY-MM-DD" }
```

**State in App.jsx:**
- `transactions` — source of truth for all transaction data
- Form inputs: `description`, `amount`, `type`, `category`
- Filters: `filterType`, `filterCategory`

**Rendering flow:** state → computed totals (income/expenses/balance) → filtered transactions → table rows.

## Known Issues (intentional course starter bugs)

- `amount` is stored as a `string` but used directly in arithmetic (causes string concatenation instead of addition)
- No delete button in the UI despite `.delete-btn` CSS already existing
- One seed transaction has wrong `type` ("Freelance Work" is marked `"expense"`)
- No empty state message when the filtered list is empty
