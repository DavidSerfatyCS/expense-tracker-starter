import 'dotenv/config';
import { Client } from '@notionhq/client';
import express from 'express';
import cors from 'cors';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const app = express();
app.use(cors());

function extractProperty(properties, name) {
  const prop = properties[name];
  if (!prop) return null;
  switch (prop.type) {
    case 'title':       return prop.title[0]?.plain_text ?? null;
    case 'rich_text':   return prop.rich_text[0]?.plain_text ?? null;
    case 'number':      return prop.number;
    case 'select':      return prop.select?.name ?? null;
    case 'date':        return prop.date?.start ?? null;
    default:            return null;
  }
}

app.get('/api/transactions', async (req, res) => {
  try {
    const [expenseRes, incomeRes] = await Promise.all([
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        sorts: [{ property: 'Date', direction: 'descending' }],
      }),
      notion.databases.query({
        database_id: process.env.NOTION_INCOME_DATABASE_ID,
        sorts: [{ property: 'Date', direction: 'descending' }],
      }),
    ]);

    const expenses = expenseRes.results.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        description: extractProperty(props, 'Name') ?? 'Untitled',
        amount: extractProperty(props, 'Amount') ?? 0,
        category: (extractProperty(props, 'Category') ?? 'other').toLowerCase(),
        date: extractProperty(props, 'Date') ?? '',
        type: 'expense',
      };
    });

    const income = incomeRes.results.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        description: extractProperty(props, 'Name') ?? 'Untitled',
        amount: extractProperty(props, 'Number') ?? 0,
        category: 'income',
        date: extractProperty(props, 'Date') ?? '',
        type: 'income',
      };
    });

    const all = [...expenses, ...income].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
