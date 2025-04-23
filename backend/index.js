const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const app = express();
const PORT = 5050;

// 🔒 Session store (uses .env DB config)
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 🛠 Middleware
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  key: 'user_sid',
  secret: process.env.SESSION_SECRET || 'secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    httpOnly: true,
    secure: false,
  }
}));


// 📦 Route mounting
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));       
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sources', require('./routes/sources'));
app.use('/api/admin', require('./routes/admin'));
// 🔍 Root check
app.get('/', (req, res) => {
  res.send('Timeline backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
