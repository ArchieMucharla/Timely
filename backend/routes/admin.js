const express = require('express');
const router = express.Router();
const verifyDev = require('../middleware/verifyDev');
const db = require('../db'); // adjust if your DB file is named differently

// GET /admin/users - fetch all users
router.get('/users', verifyDev, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, role FROM Users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE /admin/users/:id - delete a user by ID
router.delete('/users/:id', verifyDev, async (req, res) => {
  const userId = req.params.id;
  try {
    const [result] = await db.execute('DELETE FROM Users WHERE id = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /admin/add-category - add a new category
router.post('/add-category', verifyDev, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });

  try {
    await db.execute('INSERT INTO Categories (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// DELETE /admin/delete-category/:id - only delete if category is empty
router.delete('/delete-category/:id', verifyDev, async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Check if the category has any associated events
    const [used] = await db.execute(
      'SELECT COUNT(*) AS count FROM EventCategory WHERE category_id = ?',
      [categoryId]
    );

    if (used[0].count > 0) {
      return res.status(400).json({
        error: 'Category cannot be deleted because it is associated with one or more events.'
      });
    }

    // Delete the category since it's unused
    const [result] = await db.execute(
      'DELETE FROM Categories WHERE id = ?',
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, message: 'Empty category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
