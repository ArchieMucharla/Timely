const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db'); // Your MySQL connection (pool or promise wrapper)


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  
    try {
      const hashed = await bcrypt.hash(password, 10);
      await db.execute('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashed]);
      res.status(201).json({ message: 'User registered' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  

// POST /users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Fetch user by username
  const [rows] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];

  req.session.user_id = user.user_id;
  req.session.username = user.username;
  req.session.role = user.role;

  // Update last_active timestamp
  await db.execute('UPDATE Users SET last_active = NOW() WHERE user_id = ?', [user.user_id]);
  

  res.json({ message: 'Login successful', user_id: user.user_id });
});

// POST /users/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('user_sid');
    res.json({ message: 'Logged out' });
  });
});

// Middleware for protected routes
function isAuthenticated(req, res, next) {
  if (req.session.user_id) {
    req.user = req.session.user_id;
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// GET /users/me/events (protected)
router.get('/me/events', isAuthenticated, async (req, res) => {
  /*const [events] = await db.execute(
    'SELECT * FROM Events WHERE user_id = ?',
    [req.session.user_id]
  );*/
  const [events] = await db.execute(
    `SELECT 
      e.event_id,
      e.user_id,
      e.event_name,
      e.event_date,
      e.event_description,
      e.source_id,
      GROUP_CONCAT(c.category_name SEPARATOR ', ') AS categories
    FROM Events e
    JOIN  EventCategory ec ON e.event_id = ec.event_id
    JOIN Categories c ON ec.category_id = c.category_id
    WHERE e.user_id = ?
    GROUP BY   e.event_id;`, 
    [req.session.user_id]
  );
  res.json(events);
});

// DELETE /users/me (protected)
router.delete('/me', isAuthenticated, async (req, res) => {
  try {
    await db.execute('DELETE FROM Users WHERE user_id = ?', [req.session.user_id]);
    req.session.destroy(() => res.clearCookie('user_sid'));
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /users/me — check current session
router.get('/me', (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({
    user_id: req.session.user_id,
    username: req.session.username,
    role: req.session.role,
  });
});

  // GET http://localhost:5050/api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const query = `
      SELECT
        u.user_id,
        u.username,
        COUNT(DISTINCT e.event_id) AS events_created,
        COUNT(DISTINCT ucp.category_id) AS categories_followed,
        (COUNT(DISTINCT e.event_id) + COUNT(DISTINCT ucp.category_id)) AS activity_score
      FROM Users u
      LEFT JOIN Events e ON u.user_id = e.user_id
      LEFT JOIN UserCategoryPreferences ucp ON u.user_id = ucp.user_id
      GROUP BY u.user_id, u.username
      HAVING activity_score > 0
      ORDER BY activity_score DESC
      LIMIT 15;
    `;

    console.log("Running leaderboard SQL...");
    const [results] = await db.query(query);
    console.log("Got results:", results.length);

    res.json(results);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /users/me/categories — get preferred category IDs
router.get('/me/categories', async (req, res) => {
  if (!req.session.user_id) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.execute(
      'SELECT category_id FROM UserCategoryPreferences WHERE user_id = ?',
      [req.session.user_id]
    );
    const categoryIds = rows.map(r => r.category_id);
    res.json(categoryIds);
  } catch (err) {
    console.error('Error fetching user preferred categories:', err.message);
    res.status(500).json({ error: 'Could not fetch preferences' });
  }
});
// POST /users/me/categories — save preferred category IDs
router.post('/me/categories', async (req, res) => {
  if (!req.session.user_id) return res.status(401).json({ error: 'Not logged in' });

  const { category_ids } = req.body;
  if (!Array.isArray(category_ids)) {
    return res.status(400).json({ error: 'category_ids must be an array' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Delete old preferences
    await conn.execute(
      'DELETE FROM UserCategoryPreferences WHERE user_id = ?',
      [req.session.user_id]
    );

    // Insert new preferences
    if (category_ids.length > 0) {
      const values = category_ids.map(id => [req.session.user_id, id]);
      await conn.query(
        'INSERT INTO UserCategoryPreferences (user_id, category_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ message: 'Preferences updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error saving preferences:', err.message);
    res.status(500).json({ error: 'Failed to update preferences' });
  } finally {
    conn.release();
  }
});


module.exports = router;
module.exports.isAuthenticated = isAuthenticated;
