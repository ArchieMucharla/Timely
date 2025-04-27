const { isAuthenticated} = require('./users.js'); //to get userId in delete
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
    const { user_id, event_name, event_date, event_description, category_ids, source_id } = req.body;

    console.log('✅ POST /api/events hit');
  
    if (!user_id || !event_name || !event_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
  
      const [result] = await conn.query(
        'INSERT INTO Events (user_id, event_name, event_date, event_description, source_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, event_name, event_date, event_description, source_id]
      );
  
      const eventId = result.insertId;
      const values = category_ids.map((catId) => [eventId, catId]);
      await conn.query('INSERT INTO EventCategory (event_id, category_id) VALUES ?', [values]);
  
      await conn.commit();
      try {
        await conn.query('CALL setUserActive(?)', [req.session.user_id]);
        console.log('called setUserActive()')
      } catch (err) {
        console.log('Failed to update last_active after event creation')
        console.error('Failed to update last_active after event creation:', err);
      }
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
  let sql = `
    SELECT e.event_name, e.event_date, COUNT(DISTINCT ucp.user_id) AS interested_user_count
    FROM Events e 
    JOIN EventCategory ec ON e.event_id = ec.event_id
    JOIN UserCategoryPreferences ucp ON ec.category_id = ucp.category_id
    GROUP BY e.event_id, e.event_name, e.event_date
    HAVING COUNT(DISTINCT ucp.user_id) > 1
    ORDER BY interested_user_count DESC
    LIMIT 10;
    `;
    try {
      const [rows] = await pool.query(sql);
      res.json(rows);
    } catch (err) {
      console.error('❌ Error fetching trending events:', err.message);
      res.status(500).json({ error: 'Failed to fetch trending events' });
    }

});

// DELETE /events/:id
router.delete('/:id', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user;
  const conn = await pool.getConnection(); 
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT user_id FROM Events WHERE event_id=?;', [eventId]);
    if (rows.length === 0) {
      return res.status(404).json({error: 'Event not found'});
    }
    const eventUserId = rows[0].user_id;
    if (userId !== eventUserId) {
      return res.status(403).json({error: 'Can only delete events you have made.'});
    } 
    await conn.query('DELETE FROM Events WHERE event_id=?;', [eventId]);
    await conn.commit();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Failed to delete event' });
  } finally {
    conn.release();
  }
});

// GET /events/:id
router.get('/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM Events WHERE event_id=?;', [eventId]);
    if (rows.length === 0) {
      return res.status(404).json({error: 'Event not found'});
    }
    res.json(rows)
  } catch (err) {
    console.error('❌ Error fetching events:', err.message);
    res.status(500).json({error: 'Internal service error'});
  }
});

module.exports = router;