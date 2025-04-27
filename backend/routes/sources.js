const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
//  const { user_id, event_name, event_date, event_description, source_name, category_ids, source_year, author } = req.body;
  const { source_name, source_year, author } = req.body;

  console.log('✅ POST /api/sources hit');
  const cleanSourceYear = source_year === '' ? null : source_year;

  [sourceResult] = await db.query(
    `SELECT source_id FROM Sources 
     WHERE source_name = ? AND author = ? AND 
     ((source_year IS NULL AND ? IS NULL) OR source_year = ?)`,
[source_name, author, cleanSourceYear, cleanSourceYear]
);

  let source_id;
  // If author is different, treat as new source!
  try {
    if (sourceResult.length === 0) {
      console.log('Inserting source with year:', cleanSourceYear);
      const [insertSourceResult] = await db.query(
        `INSERT INTO Sources (source_name, author, source_year) VALUES (?, ?, ?)`,
      [source_name, author, cleanSourceYear]
      );
      
      console.log('Inserted new source with ID:', insertSourceResult.insertId);
      source_id = insertSourceResult.insertId;

    } else {
      source_id = sourceResult[0].source_id;
      console.log('Using existing source with ID:', source_id);
    }
    console.log('Source lookup result:', sourceResult);
  } catch(err) {
    console.error('Failed to update last_active after event creation:', err);
  }
  try {
    await db.query('CALL setUserActive(?)', [req.session.user_id]);
    console.log('called setUserActive()')
  } catch (err) {
    console.log('Failed to update last_active after event creation')
    console.error('Failed to update last_active after event creation:', err);
  }
  res.status(200).json({ message: 'Create Source successful',
    source_id: source_id,
    source_name: source_name,
    source_year: source_year,
    author: author
  });
});

module.exports = router;