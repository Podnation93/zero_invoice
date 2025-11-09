const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// API routes
app.get('/', (req, res) => {
  res.send('Welcome to the zero_invoice API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
