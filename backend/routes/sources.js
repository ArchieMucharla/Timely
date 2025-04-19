const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { user_id, event_name, event_date, event_description, source_name, category_ids, source_year, author } = req.body;

  console.log('✅ POST /api/sources hit');
  try {
    const cleanSourceYear = source_year === '' ? null : source_year;

    [sourceResult] = await db.query(
      `SELECT source_id FROM Sources 
       WHERE source_name = ? AND author = ? AND 
       ((source_year IS NULL AND ? IS NULL) OR source_year = ?)`,
      [source_name, author, cleanSourceYear, cleanSourceYear]
    );

    let source_id;
    // If author is different, treat as new source!
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

 //   3. Insert the event with the newly acquired source_id
    const [insertEventResult] = await db.query(
      `INSERT INTO Events (user_id, event_name, event_date, event_description, source_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, event_name, event_date, event_description, source_id]
    );

    const event_id = insertEventResult.insertId;
    console.log('Inserted event with ID:', event_id);

 //   4. Insert the categories associated with this event (Many-to-Many relationship)
    for (let category_id of category_ids) {
      await db.query(
        `INSERT INTO EventCategory (event_id, category_id) VALUES (?, ?)`,
        [event_id, category_id]
      );
    }

    res.status(201).json({ event_id, message: "Event created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error from backend while creating event" });
  }
});

module.exports = router;
