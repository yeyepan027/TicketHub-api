import express from 'express';
import purchasesRouter from './routes/purchases.js';
import eventsRouter from './routes/events.js';

const app = express();
app.use(express.json());

// Use /api prefix for RESTful compliance
app.use('/api', purchasesRouter);
app.use('/api', eventsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
