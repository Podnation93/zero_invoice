const express = require('express');
const router = express.Router();
const db = require('../database.js');

// Get all quotes
router.get('/', (req, res) => {
  const sql = "SELECT * FROM quotes";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Get a single quote by id
router.get('/:id', (req, res) => {
  const sql = "SELECT * FROM quotes WHERE id = ?";
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": row
    });
  });
});

// Create a new quote
router.post('/', (req, res) => {
  const errors = [];
  if (!req.body.quote_number) {
    errors.push("No quote_number specified");
  }
  if (!req.body.customer_name) {
    errors.push("No customer_name specified");
  }
  if (!req.body.quote_date) {
    errors.push("No quote_date specified");
  }
  if (!req.body.expiry_date) {
    errors.push("No expiry_date specified");
  }
  if (!req.body.total) {
    errors.push("No total specified");
  }
  if (!req.body.status) {
    errors.push("No status specified");
  }
  if (errors.length) {
    res.status(400).json({ "error": errors.join(",") });
    return;
  }
  const data = {
    quote_number: req.body.quote_number,
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    quote_date: req.body.quote_date,
    expiry_date: req.body.expiry_date,
    total: req.body.total,
    status: req.body.status
  };
  const sql = 'INSERT INTO quotes (quote_number, customer_name, customer_email, quote_date, expiry_date, total, status) VALUES (?,?,?,?,?,?,?)';
  const params = [data.quote_number, data.customer_name, data.customer_email, data.quote_date, data.expiry_date, data.total, data.status];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": data,
      "id": this.lastID
    });
  });
});

// Update a quote
router.put('/:id', (req, res) => {
  const data = {
    quote_number: req.body.quote_number,
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    quote_date: req.body.quote_date,
    expiry_date: req.body.expiry_date,
    total: req.body.total,
    status: req.body.status
  };
  db.run(
    `UPDATE quotes set 
       quote_number = COALESCE(?,quote_number), 
       customer_name = COALESCE(?,customer_name), 
       customer_email = COALESCE(?,customer_email),
       quote_date = COALESCE(?,quote_date),
       expiry_date = COALESCE(?,expiry_date),
       total = COALESCE(?,total),
       status = COALESCE(?,status)
       WHERE id = ?`,
    [data.quote_number, data.customer_name, data.customer_email, data.quote_date, data.expiry_date, data.total, data.status, req.params.id],
    function (err, result) {
      if (err) {
        res.status(400).json({ "error": res.message });
        return;
      }
      res.json({
        message: "success",
        data: data,
        changes: this.changes
      });
    });
});

// Delete a quote
router.delete('/:id', (req, res) => {
  db.run(
    'DELETE FROM quotes WHERE id = ?',
    req.params.id,
    function (err, result) {
      if (err) {
        res.status(400).json({ "error": res.message });
        return;
      }
      res.json({ "message": "deleted", changes: this.changes });
    });
});

module.exports = router;
