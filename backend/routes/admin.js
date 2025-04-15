const express = require('express');
const router = express.Router();

// GET /admin/users
router.get('/users', async (req, res) => {
  // logic to fetch all users
  // undone
});

// DELETE /admin/users/:id
router.delete('/users/:id', async (req, res) => {
  // logic to delete any user
  // undone
});

// DELETE /admin/events/:id
router.delete('/events/:id', async (req, res) => {
  // logic to delete any event
  // undone
});

// POST /admin/email
router.post('/email', async (req, res) => {
  // logic to send email to selected users
  // undone
});

module.exports = router;
