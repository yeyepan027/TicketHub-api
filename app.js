import express from 'express';
import purchasesRouter from './routes/purchases.js';
import eventsRouter from './routes/events.js';
import cors from 'cors';

const app = express();

// Enable CORS para sa React app
app.use(cors({
  origin: ['http://localhost:5173', 'https://<your-react-app>.azurestaticapps.net'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api', purchasesRouter);
app.use('/api', eventsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});