const express = require('express');
const pool = require('../db');
const router = express.Router();
//const db = require('../db'); 
//const verifyDev = require('../middleware/verifyDev');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error getting categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /categories
router.post('/', async (req, res) => {
  // dev-only: create new category (possibly with parent_id)
  // undone
});

// DELETE /categories/:id
router.delete('/:id', async (req, res) => {
  // dev-only: delete category
  // undone
});

// GET http://localhost:5050/api/categories/leaderboard
router.get('/leaderboard', async (req, res) => {
  //not sure if the SQL query is doing what it should but this has outputs 
  //so it should be enough to make the front end while i think about what
  //the SQL should actually do!
  try {
    const query = `
      SELECT ranked.category_name, ranked.event_count
      FROM (
        SELECT c.category_name, COUNT(*) AS event_count,
              COUNT(DISTINCT e.user_id) AS distinct_users,
              RANK() OVER (PARTITION BY c.category_name ORDER BY COUNT(*) DESC) AS ranking
        FROM Events e
        JOIN EventCategory ec ON e.event_id = ec.event_id
        JOIN Categories c ON ec.category_id = c.category_id
        JOIN Sources s ON e.source_id = s.source_id
        GROUP BY c.category_name
      ) AS ranked
      WHERE ranked.ranking = 1
      AND ranked.distinct_users > (
        SELECT AVG(distinct_user_count)
        FROM (
            SELECT COUNT(DISTINCT e.user_id) AS distinct_user_count
            FROM Events e
            JOIN EventCategory ec ON e.event_id = ec.event_id
            GROUP BY ec.category_id
        ) AS category_users
      )
      ORDER BY ranked.event_count DESC, ranked.category_name
      LIMIT 15;
    `;
    console.log("Running categories leaderboard SQL...");
    const [results] = await pool.query(query);
    console.log("Got results:", results.length);
    res.json(results);
  } catch (err) {
    console.error('Categories leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories leaderboard' });
  }
});

module.exports = router;
