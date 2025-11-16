import express from 'express';
import { sql, pool } from '../db.js';

const router = express.Router();


//Helper function to format time as "8:00 pm"
const formatTime = (sqlTime) => {
  if (!sqlTime) return null;
  const dateObj = new Date(sqlTime);
  let hours = dateObj.getUTCHours();
  let minutes = dateObj.getUTCMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // convert 0 to 12
  minutes = minutes.toString().padStart(2, '0');
  return `${hours}:${minutes} ${ampm}`;
};


//Helper function to format date as "November 26, 2025"
const formatDate = (sqlDate) => {
  if (!sqlDate) return null;
  const dateObj = new Date(sqlDate);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};



/**
 * GET /api/events
 * Fetch all shows from Show table
 */
router.get('/events', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT s.Id, s.Title, s.Description, s.Date, s.Time, s.CreateDate, s.ImageFilename,
               c.Name AS CategoryName,
               l.Name AS LocationName,
               o.Name AS OwnerName
        FROM Show s
        JOIN Category c ON s.CategoryId = c.Id
        JOIN Location l ON s.LocationId = l.Id
        JOIN Owner o ON s.OwnerId = o.Id
        ORDER BY s.Date ASC
      `);
    
//Explicit mapping with formatted Date and Time
    const events = result.recordset.map(e => ({
      Id: e.Id,
      Title: e.Title,
      Description: e.Description,
      Date: formatDate(e.Date),
      Time: formatTime(e.Time),
      CreateDate: formatDate(e.CreateDate),
      ImageFilename: e.ImageFilename,
      CategoryName: e.CategoryName,
      LocationName: e.LocationName,
      OwnerName: e.OwnerName
    }));


    res.json(events)

  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).json({ error: 'Error fetching events' });
  }
});


/**
 * GET /api/events/:id
 * Fetch a single show by Id
 */
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .query(`
        SELECT s.Id, s.Title, s.Description, s.Date, s.Time, s.CreateDate, s.ImageFilename,
               c.Name AS CategoryName,
               l.Name AS LocationName,
               o.Name AS OwnerName
        FROM Show s
        JOIN Category c ON s.CategoryId = c.Id
        JOIN Location l ON s.LocationId = l.Id
        JOIN Owner o ON s.OwnerId = o.Id
        WHERE s.Id = @Id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = result.recordset[0];
    event.Time = formatTime(event.Time);
    event.Date = formatDate(event.Date);
    event.CreateDate = formatDate (event.CreateDate)
    res.json(event);

  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).json({ error: 'Error fetching event' });
  }
});

/**
 * GET /api/events/:id/purchases
 * Fetch all purchases linked to a specific event
 */
router.get('/events/:id/purchases', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.request()
      .input('ShowId', sql.Int, id)
      .query('SELECT * FROM Purchases WHERE ShowId = @ShowId ORDER BY PurchaseDate DESC');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No purchases found for this event' });
    }

    // Mask credit card before sending response
    const maskedData = result.recordset.map(p => ({
      ...p,
      CreditCard: p.CreditCard.replace(/\d(?=\d{4})/g, '*') // Show last 4 digits only
    }));

    res.json(maskedData);
  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).json({ error: 'Error fetching purchases for event' });
  }
});

export default router;