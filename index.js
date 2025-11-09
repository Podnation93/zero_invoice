const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

const db = require('./database.js');

const quotesRouter = require('./routes/quotes');
app.use('/api/quotes', quotesRouter);

const invoicesRouter = require('./routes/invoices');
app.use('/api/invoices', invoicesRouter);

// API routes
app.get('/', (req, res) => {
  res.send('Welcome to the zero_invoice API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
