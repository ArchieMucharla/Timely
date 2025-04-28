const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
//  const { user_id, event_name, event_date, event_description, source_name, category_ids, source_year, author } = req.body;
const { source_name, source_year, author } = req.body;

// If source_name is provided, proceed with the query
if (source_name) {
  try {
    const cleanSourceYear = source_year === '' ? null : source_year;

    // Query to find the source by source_name, author, and source_year
    [sourceResult] = await db.query(
      `SELECT source_id FROM Sources 
       WHERE source_name = ? AND author = ? AND 
       ((source_year IS NULL AND ? IS NULL) OR source_year = ?)`,
      [source_name, author, cleanSourceYear, cleanSourceYear]
    );

    let source_id;
    // If no matching source, insert a new one
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

    res.json({ message: 'Source processed successfully', source_id });

  } catch (err) {
    console.error('Error creating source:', err.message);
    res.status(500).json({ message: 'Error creating source' });
  }
} else {
  console.log('No source name provided. Skipping source query.');
  res.json({ message: 'No source name provided, skipping source query.' });
}
});

module.exports = router;