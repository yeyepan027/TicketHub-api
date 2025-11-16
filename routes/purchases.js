import express from 'express';
import { sql, pool } from '../db.js';

const router = express.Router();

/**
 * POST /api/purchases
 * Save a new purchase into Purchases table
 */
router.post('/purchases', async (req, res) => {
  const { EventID, Tickets, CustomerName, Email, CreditCard, ShowId } = req.body;

  try {
    // Validate required fields
    if (!EventID || !Tickets || !CustomerName || !Email || !CreditCard || !ShowId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Additional validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (Tickets <= 0) {
      return res.status(400).json({ error: 'Tickets must be greater than zero' });
    }

    const query = `
      INSERT INTO Purchases (EventID, Tickets, CustomerName, Email, CreditCard, PurchaseDate, ShowId)
      VALUES (@EventID, @Tickets, @CustomerName, @Email, @CreditCard, GETDATE(), @ShowId)
    `;

    const request = pool.request();
    request.input('EventID', sql.Int, EventID);
    request.input('Tickets', sql.Int, Tickets);
    request.input('CustomerName', sql.NVarChar, CustomerName);
    request.input('Email', sql.NVarChar, Email);
    request.input('CreditCard', sql.NVarChar, CreditCard);
    request.input('ShowId', sql.Int, ShowId);

    await request.query(query);

    res.status(201).json({ message: 'Purchase saved successfully' });
  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).json({ error: 'Error saving purchase' });
  }
});

export default router;