import { Router } from 'express';
import { fetchTransactions, createTransaction, deleteTransaction } from '../notion.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.json(await fetchTransactions());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await createTransaction(req.body);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
