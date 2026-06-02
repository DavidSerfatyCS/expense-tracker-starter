# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Run Express server (nodemon) + Vite together via concurrently
npm run server    # Run only the Express/Notion proxy (server/index.js, port 3002)
npm run start     # Same as server, used by Railway in production
npm run build     # Production build of the frontend (Vite)
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

Vite dev server runs at http://localhost:5173; the API server at http://localhost:3002.

## Architecture

Single-page React 19 app (Vite) for tracking personal income and expenses. Data is **not** local seed data — it lives in two Notion databases and is read/written through a small Express proxy.

### Two processes

- **Frontend** (`src/`, Vite) — renders the UI, holds `transactions` in `App.jsx` state. Deployed to Vercel.
- **Backend** (`server/`, Express on port 3002) — proxies to the Notion API. It exists because `NOTION_API_KEY` must never reach the browser. The frontend talks only to this server, never to Notion directly. Deployed to Railway.

### Backend (`server/`)

```
server/
├── index.js              — Express app: CORS, JSON, mounts the router, listen
├── notion.js             — Notion client + all Notion logic (fetch/create/delete + extractProperty)
└── routes/
    └── transactions.js   — Express Router for /api/transactions (GET, POST, DELETE)
```

- `GET /api/transactions` — `fetchTransactions()` queries the **expense** DB (`NOTION_DATABASE_ID`) and **income** DB (`NOTION_INCOME_DATABASE_ID`) in parallel, normalizes both into the shared transaction shape, merges and sorts by date descending.
- `POST /api/transactions` — `createTransaction()` creates a Notion page in the expense or income DB depending on `type`.
- `DELETE /api/transactions/:id` — `deleteTransaction()` archives the Notion page (Notion has no hard delete via API).
- **Notion schema quirk:** the expense DB stores the amount in a property named `Amount`; the income DB stores it in a property named `Number`. The income category is hardcoded to `"income"`.

Environment variables: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_INCOME_DATABASE_ID`, optional `ALLOWED_ORIGIN` (locks CORS to the frontend URL in prod), `PORT` (injected by Railway). Locally these live in `.env` (gitignored); in production they live in the Railway dashboard. See `.env.example`.

### Frontend layout (`src/`)

```
src/
├── App.jsx               — owns transactions + period state, fetches on mount, handlers
├── main.jsx              — React entry
├── components/           — all UI components
├── hooks/useFixedItems.js
├── constants/categories.js
├── utils/                — dateUtils.js, currency.js
└── *.css                 — App.css, index.css, theme-*.css
```

Component tree:
```
App  (fetches transactions on mount, owns transactions + period state)
├── PeriodSelector  — week/month toggle + prev/next offset navigation
├── Summary         — income/expense/balance totals for the active period
├── TransactionForm — owns form state, calls onAdd(transaction)
├── SpendingTrend   — trend chart across periods
├── SpendingChart   — recharts BarChart of expenses by category (period-scoped)
├── TransactionList — owns filter state, renders the filtered table, delete button
└── Sidebar
    ├── InsightsPanel    — savings rate, top category, fixed costs, projected month-end
    └── FixedItemsPanel  — recurring income/expense items (localStorage)
```

### Data model

Transactions come from Notion (note: `id` is a Notion page id **string**, not a number):
```js
{ id: string, description: string, amount: number, type: "income"|"expense", category: string, date: "YYYY-MM-DD" }
```

### Key conventions

- **Single source of truth:** `App.jsx` holds `transactions`; children receive it as props. `App` passes `onAdd`/`onDelete` down. The API base URL comes from `VITE_API_URL` (build-time), defaulting to `http://localhost:3002`.
- **Period filtering:** `getPeriodBounds(type, offset)` in `src/utils/dateUtils.js` returns `{ start, end, label }`. Components filter transactions by `t.date >= period.start && t.date <= period.end`. Future periods are disabled (offset capped at 0).
- **Shared constants:** category list lives in `src/constants/categories.js` (`CATEGORIES`) — imported by both `TransactionForm` and `TransactionList`.
- **Currency:** `formatCurrency()` in `src/utils/currency.js` formats as shekels (`₪`).
- **Fixed items:** `useFixedItems()` hook (`src/hooks/`) persists recurring items to `localStorage` (separate from Notion transactions).

## Conventions

- Any transaction mutation (add/delete) must write through to the API **and** update local `useState` — local-only updates are lost on reload. `handleAdd`/`handleDelete` in `App.jsx` follow this pattern.
- Fixed items are the exception: they are client-only and persist to `localStorage`, not Notion.
