# Finance Tracker

Single-page React app to track personal income and expenses, backed by Notion.
The frontend (Vite/React) talks to a small Express proxy that reads and writes two
Notion databases — the Notion API key never reaches the browser.

## Architecture

```
┌────────────┐      HTTP /api/transactions      ┌────────────┐      Notion API      ┌────────┐
│  Frontend  │ ───────────────────────────────► │  Backend   │ ───────────────────► │ Notion │
│ React/Vite │                                  │  Express   │                      │  DBs   │
│  (Vercel)  │ ◄─────────────────────────────── │ (Railway)  │ ◄─────────────────── │        │
└────────────┘                                  └────────────┘                      └────────┘
```

- `src/` — frontend. See `components/`, `hooks/`, `utils/`, `constants/`.
- `server/` — Express backend (`index.js`, `notion.js`, `routes/transactions.js`).

## Local development

1. Copy the env template and fill in your Notion credentials:
   ```bash
   cp .env.example .env
   ```
   Set `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_INCOME_DATABASE_ID`.
   Leave `VITE_API_URL` unset — it defaults to `http://localhost:3002`.
2. Install dependencies and start both processes:
   ```bash
   npm install
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend:  http://localhost:3002

## Scripts

| Script            | Description                                          |
|-------------------|------------------------------------------------------|
| `npm run dev`     | Run backend (nodemon) + Vite together                |
| `npm run server`  | Run only the Express backend                         |
| `npm run start`   | Start the backend (used by Railway in production)    |
| `npm run build`   | Production build of the frontend                     |
| `npm run preview` | Preview the production build                         |
| `npm run lint`    | Run ESLint                                            |

## API

Base path `/api/transactions`:

| Method   | Path                  | Description                              |
|----------|-----------------------|------------------------------------------|
| `GET`    | `/api/transactions`   | List all transactions (income + expense) |
| `POST`   | `/api/transactions`   | Create a transaction                     |
| `DELETE` | `/api/transactions/:id` | Archive a transaction in Notion        |

## Deployment

Frontend and backend deploy separately. **Do not commit secrets** — `.env` is
gitignored; set variables in each platform's dashboard instead.

### Backend → Railway

1. Create a project from this repo. Railway runs `npm start` (→ `server/index.js`).
2. Set environment variables (Railway → Variables):
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`
   - `NOTION_INCOME_DATABASE_ID`
   - `ALLOWED_ORIGIN` = your Vercel URL (e.g. `https://your-app.vercel.app`)
   - `PORT` is injected automatically by Railway.
3. Note the public backend URL Railway gives you.

### Frontend → Vercel

1. Import the repo. Build command `npm run build`, output `dist`.
2. Set `VITE_API_URL` = the Railway backend URL (no trailing slash).
   This is a **build-time** variable — redeploy after changing it.

## Notes

- Notion schema quirk: the expense DB stores the amount in a property named
  `Amount`; the income DB uses `Number`.
- Fixed/recurring items are stored client-side in `localStorage`, not in Notion.
