import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transactionsRouter from './routes/transactions.js';

const app = express();

// In production set ALLOWED_ORIGIN to the deployed frontend URL to lock down CORS.
// Left unset locally, CORS allows all origins for convenience.
const corsOptions = process.env.ALLOWED_ORIGIN
  ? { origin: process.env.ALLOWED_ORIGIN }
  : undefined;
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/transactions', transactionsRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
