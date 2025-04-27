const express = require('express');
const router = express.Router();
const verifyDev = require('../middleware/verifyDev');
const db = require('../db');

console.log('✅ admin.js loaded');

// GET /admin/users?search=... - filter users by ID or username
router.get('/users', verifyDev, async (req, res) => {
  const { search } = req.query;
  console.log('👀 incoming search:', search);

  try {
    let query = 'SELECT user_id, username, role FROM Users';
    const params = [];

    if (search) {
      const isNumeric = !isNaN(search);
      if (isNumeric) {
        query += ' WHERE user_id = ?';
        params.push(search);
      } else {
        query += ' WHERE username LIKE ?';
        params.push(`%${search}%`);
      }
    }

    console.log('📦 Query:', query);
    console.log('📦 Params:', params);

    const [rows] = await db.execute(query, params);

    console.log('✅ Result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('🔥 SQL error in /admin/users:', err);
    res.status(500).json({ error: 'Failed to search users' });
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

// GET /admin/events?search=... - filter events by ID or title
router.get('/events', verifyDev, async (req, res) => {
  const { search } = req.query;

  try {
    let query = 'SELECT event_id, event_name, user_id FROM Events';
    const params = [];

    if (search) {
      query += ' WHERE event_id = ? OR event_name LIKE ?';
      params.push(search, `%${search}%`);
    }

    console.log('📦 Query:', query);
    console.log('📦 Params:', params);

    const [rows] = await db.execute(query, params);

    console.log('✅ Result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('🔥 SQL error in /admin/users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET /admin/categories-by-event-count - count how many events each category has
router.get('/categories-by-event-count', verifyDev, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.category_id, c.category_name, COUNT(ec.event_id) AS event_count
      FROM Categories c
      LEFT JOIN EventCategory ec ON c.category_id = ec.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY event_count DESC
    `);
    
    console.log('✅ Result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('🔥 SQL error in /admin/users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// DELETE /admin/delete-category/:id - only delete if category is unused
router.delete('/delete-category/:id', verifyDev, async (req, res) => {
  const categoryId = req.params.id;

  try {
    const [used] = await db.execute(
      'SELECT COUNT(*) AS count FROM EventCategory WHERE category_id = ?',
      [categoryId]
    );

    if (used[0].count > 0) {
      return res.status(400).json({
        error: 'Category cannot be deleted because it is associated with one or more events.'
      });
    }

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

// Admin route to mark inactive users for deletion
router.post('/mark-inactive-users', async (req, res) => {
  try {
    // Update users to mark them for deletion if they haven't been active for 90 days
    const result = await db.query(`
      UPDATE Users
      SET status = 'pending_deletion'
      WHERE last_active < NOW() - INTERVAL 90 DAY
    `);

    console.log(`Users marked for deletion.`);

    // Fetch the usernames of users marked for deletion
    const [users] = await db.query(`
      SELECT username
      FROM Users
      WHERE status = 'pending_deletion'
      AND last_active < NOW() - INTERVAL 90 DAY
    `);

    if (users.length > 0) {
      const usernames = users.map(user => user.username);
      console.log('Users marked for deletion:', usernames);

      // Return the list of usernames
      res.status(200).json({ 
        message: `Users marked for deletion.`,
        users: usernames
      });
    } else {
      res.status(200).json({ 
        message: 'No users were marked for deletion.',
        users: []
      });
    }

  } catch (err) {
    console.error('Error marking inactive users:', err);
    res.status(500).json({ error: 'Failed to mark inactive users for deletion.' });
  }
});

router.post('/delete-inactive-users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT *
      FROM Users
      WHERE status = 'pending_deletion'
      AND last_active < NOW() - INTERVAL 90 DAY
    `);

    if (users.length > 0) {
      const usernames = users.map(user => user.username);

      await db.query(`
        DELETE FROM Users
        WHERE status = 'pending_deletion'
        AND last_active < NOW() - INTERVAL 90 DAY
      `);

      console.log('Users deleted:', usernames);

      res.status(200).json({ 
        message: `Users deleted.`,
        users: usernames
      });
    } else {
      res.status(200).json({ 
        message: 'No users to delete.',
        users: []
      });
    }

  } catch (err) {
    console.error('Error deleting inactive users:', err);
    res.status(500).json({ error: 'Failed to delete inactive users.' });
  }
});


module.exports = router;
