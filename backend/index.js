const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // 🪄 allow cross-origin requests

const PORT = 5050;

(async () => {
  try {
    console.log('🔧 Connecting to DB...');
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Connected to DB');

    app.get('/', (req, res) => {
      res.send('Backend is up!');
    });

    // 🔹 Get all categories
    app.get('/api/categories', async (req, res) => {
      try {
        const [rows] = await pool.query('SELECT * FROM Categories');
        res.json(rows);
      } catch (err) {
        console.error('❌ Error fetching categories:', err.message);
        res.status(500).json({ error: 'Query failed' });
      }
    });

    // 🔹 Get events by category
    app.get('/api/events-by-category/:categoryId', async (req, res) => {
      const categoryId = req.params.categoryId;
      try {
        const [rows] = await pool.query(`
          SELECT e.event_id, e.event_name, e.event_date, e.event_description
          FROM Events e
          JOIN EventCategory ec ON e.event_id = ec.event_id
          WHERE ec.category_id = ?
        `, [categoryId]);
        res.json(rows);
      } catch (err) {
        console.error('❌ Error fetching events:', err.message);
        res.status(500).json({ error: 'Query failed' });
      }
    });

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Fatal error starting app:', err.message);
    process.exit(1);
  }
})();
