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
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    const transactions = response.results.map((page, index) => {
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

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
