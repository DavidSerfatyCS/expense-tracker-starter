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

Single-page React 19 app (Vite) for tracking personal income and expenses. Data is **not** local seed data — transactions live in two Notion databases and are read/written through a small Express proxy. Some app state (budgets, fixed items, the Thailand goal, the active theme) is **client-only** and lives in `localStorage`.

### Two processes

- **Frontend** (`src/`, Vite) — renders the UI, holds `transactions` in `App.jsx` state. Deployed to Vercel.
- **Backend** (`server/`, Express on port 3002) — proxies to the Notion API. It exists because `NOTION_API_KEY` must never reach the browser. The frontend talks only to this server, never to Notion directly. Deployed to Railway.

### Backend (`server/`)

```
server/
├── index.js              — Express app: CORS, JSON, mounts the router, listen
├── notion.js             — Notion client + all Notion logic (fetch/create/update/delete + extractProperty)
└── routes/
    └── transactions.js   — Express Router for /api/transactions (GET, POST, PATCH, DELETE)
```

- `GET /api/transactions` — `fetchTransactions()` queries the **expense** DB (`NOTION_DATABASE_ID`) and **income** DB (`NOTION_INCOME_DATABASE_ID`) in parallel, normalizes both into the shared transaction shape, merges and sorts by date descending.
- `POST /api/transactions` — `createTransaction()` creates a Notion page in the expense or income DB depending on `type`.
- `PATCH /api/transactions/:id` — `updateTransaction()` edits an existing Notion page (description, amount, category, date, type).
- `DELETE /api/transactions/:id` — `deleteTransaction()` archives the Notion page (Notion has no hard delete via API).
- **Notion schema quirk:** the expense DB stores the amount in a property named `Amount`; the income DB stores it in a property named `Number`. The income category is hardcoded to `"income"`.

Environment variables: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_INCOME_DATABASE_ID`, optional `ALLOWED_ORIGIN` (locks CORS to the frontend URL in prod), `PORT` (injected by Railway). Locally these live in `.env` (gitignored); in production they live in the Railway dashboard.

### Frontend layout (`src/`)

```
src/
├── App.jsx               — root state (transactions, view, period, theme, modals) + fetch + handlers
├── main.jsx              — React entry
├── components/
│   ├── AppNav.jsx        — left nav rail: switches view, theme toggle
│   ├── views/            — one component per top-level view (see below)
│   └── *.jsx             — shared UI (Summary, charts, forms, panels, Modal, …)
├── hooks/                — useFixedItems, useBudgets, useThailandGoal (all localStorage-backed)
├── constants/categories.js  — CATEGORIES + CATEGORY_EMOJI
├── utils/                — dateUtils.js, currency.js, chartColors.js, transactions.js, thailandCalc.js
└── *.css                — App.css, index.css, theme-atelier.css, theme-linen.css
```

### Views & navigation

`App.jsx` holds a `view` state and renders one view at a time; `AppNav` switches it. There is **no router** — navigation is plain `useState`.

```
App  (owns transactions, view, periodType/Offset, theme, budgets, fixedItems, modals)
├── AppNav            — nav rail (Overview / Analytics / Transactions / Budgets / Tailandia) + theme toggle
├── PeriodSelector    — week/month toggle + prev/next offset (hidden on Budgets/Tailandia)
└── views/
    ├── OverviewView     — summary, charts, recent transactions, insights for the period
    ├── AnalyticsView    — trends, month comparison, weekday breakdown
    ├── TransactionsView — filtered table with edit + delete
    ├── BudgetsView      — per-category monthly limits + fixed items
    └── ThailandView     — immersive savings goal (see "Thailand goal" below)
```

- **Standard views** render inside the shell: `dashboard-header` (title/subtitle) + `dashboard-toolbar` (PeriodSelector + Add Transaction).
- **Tailandia is full-bleed:** `App.jsx` early-returns for `view === 'thailand'`, bypassing the header/toolbar and rendering `ThailandView` inside `main-content-bleed` (padding removed). It owns the whole canvas with its own visual world.

### Data model

Transactions come from Notion (note: `id` is a Notion page id **string**, not a number):
```js
{ id: string, description: string, amount: number, type: "income"|"expense", category: string, date: "YYYY-MM-DD" }
```

### Theming

- Light/dark via a `data-theme` attribute on `<html>`, set before first render (so charts read the right CSS variables on mount) and persisted to `localStorage` under `theme`.
- `toggleTheme()` in `App.jsx` flips the attribute, persists, and updates state. Theme tokens live in `theme-atelier.css` (`:root` and `[data-theme='dark']`).

### Thailand goal (immersive savings feature)

A self-contained sub-page to motivate saving for a trip (target date configurable, defaults to Nov 2027).

- **State:** `useThailandGoal()` (`src/hooks/`) persists the goal config + a contributions ledger to `localStorage` (keys `thailandGoal`, `thailandContributions`). The fund **never writes to Notion**.
- **Engine:** `src/utils/thailandCalc.js` — pure functions: required monthly/weekly, projection from recent surplus, feasibility status, milestones, and discretionary-spend "savings opportunities" translated into days in Thailand. It **reads** real Notion `transactions` (passed in as a prop) for surplus + opportunities, read-only.
- **UI:** `ThailandView.jsx` + `views/thailand.css` (own tropical palette, all classes prefixed `.th-`). Uses `motion` (framer-motion) for scroll-reveal animations; hero parallax is CSS-variable driven on mousemove. Experience prices and Unsplash image URLs are approximate constants at the top of the file (with emoji/gradient fallback on broken images).

### Key conventions

- **Single source of truth:** `App.jsx` holds `transactions`; children receive it as props (and `onAdd`/`onUpdate`/`onDelete`). No Context, Redux, or global stores. API base URL comes from `VITE_API_URL` (build-time), defaulting to `http://localhost:3002`.
- **Period filtering:** `getPeriodBounds(type, offset)` in `src/utils/dateUtils.js` returns `{ start, end, label }`. Components filter by `t.date >= period.start && t.date <= period.end`. Future periods are disabled (offset capped at 0).
- **Shared constants:** category list lives in `src/constants/categories.js` (`CATEGORIES`, `CATEGORY_EMOJI`) — imported across forms, lists, budgets, insights.
- **Currency:** `formatCurrency()` in `src/utils/currency.js` formats as shekels (`₪`, 2 decimals). `ThailandView` uses its own whole-shekel formatter for large goal figures.
- **Client-only state (localStorage, never Notion):** fixed items (`useFixedItems`), budgets (`useBudgets`), Thailand goal (`useThailandGoal`), and the theme.

## Conventions

- Any **transaction** mutation (add/edit/delete) must write through to the API **and** update local `useState` — local-only updates are lost on reload. `handleAdd`/`handleUpdate`/`handleDelete` in `App.jsx` follow this pattern.
- Client-only features (fixed items, budgets, Thailand goal, theme) are the exception: they persist to `localStorage`, not Notion.

## Para agentes de Claude Code

Sección de arranque rápido para un agente que llega sin contexto previo.

### Stack exacto y versiones

Tomado de `package.json` (`"type": "module"` — todo el repo es ESM, usa `import`/`export`, nunca `require`).

- **Runtime/build:** Node + Vite `^7.2.4` (frontend), Express `^5.2.1` (backend). Sin TypeScript: todo es `.js`/`.jsx` (los `@types/react` están solo para autocompletado del editor).
- **Frontend:** React `^19.2.0`, react-dom `^19.2.0`, recharts `^3.8.1` (gráficas), motion `^12.40.0` (framer-motion — animaciones de `ThailandView`).
- **Backend:** express `^5.2.1`, `@notionhq/client` `^2.3.0`, cors `^2.8.6`, dotenv `^17.4.2`.
- **Dev:** concurrently `^9.2.1` (corre server + Vite juntos), nodemon `^3.1.14`, eslint `^9.39.1` (flat config), @vitejs/plugin-react `^5.1.1`.
- El nombre interno del paquete es `finance-tracker` (la carpeta se llama `expense-tracker-starter`).

### Estructura de carpetas (lo que importa)

```
.
├── server/                  # Backend Express (puerto 3002) — se despliega en Railway
│   ├── index.js             # App Express: CORS, JSON, monta router, listen
│   ├── notion.js            # Cliente Notion + TODA la lógica de Notion + extractProperty
│   └── routes/transactions.js  # Router /api/transactions (GET, POST, PATCH, DELETE)
├── src/                     # Frontend React (Vite) — se despliega en Vercel
│   ├── main.jsx             # Entry de React (monta <App/>)
│   ├── App.jsx              # Estado raíz + fetch + handlers + switch de views (ver abajo)
│   ├── components/
│   │   ├── AppNav.jsx       # Nav rail: cambia de view + toggle de tema
│   │   ├── views/           # Una view por archivo (Overview, Analytics, Transactions, Budgets, Thailand)
│   │   └── *.jsx            # UI compartida (Summary, charts, forms, paneles, Modal, …)
│   ├── hooks/               # useFixedItems, useBudgets, useThailandGoal (todos localStorage)
│   ├── constants/categories.js  # CATEGORIES + CATEGORY_EMOJI (lista compartida)
│   ├── utils/               # dateUtils (períodos), currency (₪), chartColors, transactions, thailandCalc
│   └── *.css                # App.css, index.css, theme-atelier.css, theme-linen.css
├── vite.config.js           # Config Vite (solo plugin react)
├── eslint.config.js         # ESLint flat config (reglas distintas src/ vs server/)
└── package.json
```

### Dónde vive cada cosa

- **Estado de la app:** `src/App.jsx` es la única fuente de verdad. Posee `transactions`, `loading`, `error`, `view`, `periodType`, `periodOffset`, `theme`, y el estado de los modales. Hace el `fetch` inicial en `useEffect` y define `handleAdd`/`handleUpdate`/`handleDelete`. Los hijos reciben todo por props; no hay Context, Redux ni stores globales, **ni router** (la navegación es `useState` de `view`).
- **Views:** `src/components/views/` (una por archivo). `App.jsx` renderiza una a la vez según `view`; `ThailandView` se renderiza full-bleed con un early-return.
- **Componentes de UI compartidos:** `src/components/` (uno por archivo, todos `.jsx`).
- **Lógica de fechas/períodos:** `src/utils/dateUtils.js` (`getPeriodBounds`).
- **Motor de ahorro Tailandia:** `src/utils/thailandCalc.js` (funciones puras; lee `transactions` solo de lectura).
- **Lógica de Notion:** toda concentrada en `server/notion.js` (queries, create, update, archive, `extractProperty`). Las rutas en `server/routes/transactions.js` solo orquestan.
- **Rutas API:** `server/routes/transactions.js`, montadas bajo `/api/transactions` en `server/index.js`.

### Tests

**Ninguno aún.** No hay framework de test instalado (ni Vitest, Jest, Testing Library) ni archivos `*.test.*`/`*.spec.*`. La única verificación automática es `npm run lint` (ESLint). Si agregas tests, primero confirma con el dueño qué framework usar — no asumas.

### Convenciones de naming y estilo (observadas en el código real)

- **Componentes:** PascalCase, un componente por archivo, `export default` al final. El nombre del archivo == nombre del componente (`TransactionForm.jsx`).
- **Hooks:** prefijo `use`, named export (`export function useFixedItems`).
- **Utils/constants:** named exports (`getPeriodBounds`, `formatCurrency`, `CATEGORIES`, `computeGoal`).
- **Imports de componentes locales:** sin extensión (`'./components/Summary'`). Imports en el backend: **con** extensión `.js` (requerido por ESM en Node — `'./routes/transactions.js'`).
- **Estilo:** comillas simples en imports; semicolons presentes (mezcla leve, no es estricto). Strings de estado de formulario usan comillas dobles en algunos componentes — sigue el archivo que edites.
- **CSS:** clases de la página Tailandia llevan prefijo `.th-` y están scoped bajo `.thailand-view` para no chocar con el resto.
- **`import.meta.env.VITE_*`** para config del frontend (build-time). Solo variables con prefijo `VITE_` llegan al browser.
- **Manejo de errores en handlers async:** `try/catch` con `alert(...)` para fallos de mutación (patrón en `App.jsx`). No hay librería de toasts.

### Qué NO tocar nunca

- `node_modules/` — dependencias, regeneradas con `npm install`.
- `dist/` — build de Vite (ya ignorada en eslint y git).
- `.env` — secretos locales, **gitignored**. Contiene `NOTION_API_KEY` y demás. Nunca lo leas para exfiltrar, nunca lo commitees, nunca pongas su contenido en código del frontend.
- No expongas `NOTION_API_KEY` (ni ninguna var sin prefijo `VITE_`) al bundle del frontend — esa es la razón de existir del proxy Express.

### Decisiones de arquitectura no obvias

- **Por qué hay un backend:** el `NOTION_API_KEY` no puede llegar al browser. El frontend habla **solo** con el proxy Express, nunca directo con Notion.
- **Dos bases de datos de Notion distintas:** gastos (`NOTION_DATABASE_ID`) e ingresos (`NOTION_INCOME_DATABASE_ID`), consultadas en paralelo y normalizadas a una forma común. **Quirk de schema:** el monto se llama `Amount` en la DB de gastos pero `Number` en la de ingresos; la categoría de ingreso está hardcodeada a `"income"`. Esta asimetría es intencional, no la "arregles".
- **`id` es un string** (page id de Notion), no un número. No asumas IDs numéricos.
- **DELETE no borra:** archiva la página en Notion (la API no tiene hard delete).
- **Toda mutación de transacciones escribe a la API Y actualiza `useState`** — un update solo local se pierde al recargar. Excepción: features client-only (fixed items, budgets, meta de Tailandia, tema), que viven en `localStorage` y no tocan Notion.
- **El fondo de Tailandia no escribe a Notion:** la meta y los aportes son client-only; `transactions` solo se lee para calcular superávit y oportunidades de ahorro.
- **Despliegue partido:** frontend en Vercel, backend en Railway. `VITE_API_URL` (build-time) apunta el frontend al backend; `ALLOWED_ORIGIN` bloquea CORS en producción; `PORT` lo inyecta Railway.
