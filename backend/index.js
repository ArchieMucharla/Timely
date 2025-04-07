const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5050;

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());

// 🧩 Import routes
app.use('/api/events', require('./routes/events'));
//app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
//app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('Timeline backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
