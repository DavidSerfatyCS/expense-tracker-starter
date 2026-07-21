// Vercel serverless function: /api/transactions/:id (PATCH, DELETE)
import { updateTransaction, deleteTransaction } from '../../server/notion.js';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'PATCH') {
      await updateTransaction(id, req.body);
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await deleteTransaction(id);
      return res.json({ ok: true });
    }
    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
