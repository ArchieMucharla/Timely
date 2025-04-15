const express = require('express');
const pool = require('../db');
const router = express.Router();

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

module.exports = router;
