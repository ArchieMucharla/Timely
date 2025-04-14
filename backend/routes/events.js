const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔍 GET /api/events
router.get('/', async (req, res) => {
  const { category, startYear, endYear, q } = req.query;

  let sql = `
    SELECT e.*, GROUP_CONCAT(c.category_name) as categories
    FROM Events e
    LEFT JOIN EventCategory ec ON e.event_id = ec.event_id
    LEFT JOIN Categories c ON ec.category_id = c.category_id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    const ids = category.split(',').map(id => parseInt(id.trim())).filter(Boolean);
    if (ids.length > 0) {
      sql += ` AND ec.category_id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }
  }

  if (startYear) {
    sql += ' AND YEAR(e.event_date) >= ?';
    params.push(startYear);
  }
  if (endYear) {
    sql += ' AND YEAR(e.event_date) <= ?';
    params.push(endYear);
  }
  if (q) {
    sql += ' AND (e.event_name LIKE ? OR e.event_description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' GROUP BY e.event_id ORDER BY e.event_date';

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching events:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
    const { user_id, event_name, event_date, event_description, category_ids } = req.body;
  
    if (!user_id || !event_name || !event_date || !category_ids?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
  
      const [result] = await conn.query(
        'INSERT INTO Events (user_id, event_name, event_date, event_description) VALUES (?, ?, ?, ?)',
        [user_id, event_name, event_date, event_description]
      );
  
      const eventId = result.insertId;
      const values = category_ids.map((catId) => [eventId, catId]);
      await conn.query('INSERT INTO EventCategory (event_id, category_id) VALUES ?', [values]);
  
      await conn.commit();
      res.status(201).json({ message: 'Event created', event_id: eventId });
    } catch (err) {
      await conn.rollback();
      console.error('❌ Error creating event:', err.message);
      res.status(500).json({ error: 'Failed to create event' });
    } finally {
      conn.release();
    }
  });
  
// GET /events/trending
router.get('/trending', async (req, res) => {
  // logic to fetch trending events
});

// DELETE /events/:id
router.delete('/:id', async (req, res) => {
  // logic to delete user's own event
});

// GET /events/:id
router.get('/:id', async (req, res) => {
  // logic to get single event detail
});

module.exports = router;