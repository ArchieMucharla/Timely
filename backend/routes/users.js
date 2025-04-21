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
  const [rows] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);

  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user.user_id;
  req.session.username = user.username;
  req.session.role = user.role;
  

  res.json({ message: 'Login successful', userId: user.user_id });
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
  if (req.session.userId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// GET /users/me/events (protected)
router.get('/me/events', isAuthenticated, async (req, res) => {
  const [events] = await db.execute(
    'SELECT * FROM Events WHERE user_id = ?',
    [req.session.userId]
  );
  res.json(events);
});

// DELETE /users/me (protected)
router.delete('/me', isAuthenticated, async (req, res) => {
  try {
    await db.execute('DELETE FROM Users WHERE user_id = ?', [req.session.userId]);
    req.session.destroy(() => res.clearCookie('user_sid'));
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /users/me — check current session
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({
    userId: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  });
});

  
// GET show how many events each user created
router.get('/user-leader-board', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.user_id AS id,
        u.username,
        COUNT(e.event_id) AS event_count
      FROM Users u
      LEFT JOIN Events e ON u.user_id = e.user_id
      GROUP BY u.user_id, u.username
      ORDER BY u.event_count DESC;
    `);
    //console.log('✅ Result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('🔥 SQL error: ', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;
