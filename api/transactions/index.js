// Vercel serverless function: /api/transactions (GET, POST)
// Reuses the Notion logic from server/notion.js — the Express server in server/
// is still used for local dev (npm run dev).
import { fetchTransactions, createTransaction } from '../../server/notion.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await fetchTransactions());
    }
    if (req.method === 'POST') {
      const id = await createTransaction(req.body);
      return res.json({ id });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
