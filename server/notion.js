import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Maps a Notion property of any supported type to a plain JS value.
function extractProperty(properties, name) {
  const prop = properties[name];
  if (!prop) return null;
  switch (prop.type) {
    case 'title':     return prop.title[0]?.plain_text ?? null;
    case 'rich_text': return prop.rich_text[0]?.plain_text ?? null;
    case 'number':    return prop.number;
    case 'select':    return prop.select?.name ?? null;
    case 'date':      return prop.date?.start ?? null;
    default:          return null;
  }
}

// Reads both Notion databases and returns a single, date-sorted transaction list.
// Note the schema quirk: expenses store the amount in `Amount`, income in `Number`.
export async function fetchTransactions() {
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

  const expenses = expenseRes.results.map((page) => ({
    id: page.id,
    description: extractProperty(page.properties, 'Name') ?? 'Untitled',
    amount: extractProperty(page.properties, 'Amount') ?? 0,
    category: (extractProperty(page.properties, 'Category') ?? 'other').toLowerCase(),
    date: extractProperty(page.properties, 'Date') ?? '',
    type: 'expense',
  }));

  const income = incomeRes.results.map((page) => ({
    id: page.id,
    description: extractProperty(page.properties, 'Name') ?? 'Untitled',
    amount: extractProperty(page.properties, 'Number') ?? 0,
    category: 'income',
    date: extractProperty(page.properties, 'Date') ?? '',
    type: 'income',
  }));

  return [...expenses, ...income].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Creates a transaction in the income or expense database depending on `type`.
export async function createTransaction({ description, amount, type, category, date }) {
  const databaseId = type === 'income'
    ? process.env.NOTION_INCOME_DATABASE_ID
    : process.env.NOTION_DATABASE_ID;
  const amountProperty = type === 'income' ? 'Number' : 'Amount';

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: description } }] },
      [amountProperty]: { number: Number(amount) },
      Category: { select: { name: category } },
      Date: { date: { start: date } },
    },
  });

  return page.id;
}

// Notion has no hard delete via the API; archiving removes the page from the database view.
export async function deleteTransaction(id) {
  await notion.pages.update({ page_id: id, archived: true });
}
