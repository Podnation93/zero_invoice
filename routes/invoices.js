const express = require('express');
const router = express.Router();
const db = require('../database.js');

// Get all invoices
router.get('/', (req, res) => {
  const sql = "SELECT * FROM invoices";
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

// Get a single invoice by id
router.get('/:id', (req, res) => {
  const sql = "SELECT * FROM invoices WHERE id = ?";
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

// Create a new invoice
router.post('/', (req, res) => {
  const errors = [];
  if (!req.body.invoice_number) {
    errors.push("No invoice_number specified");
  }
  if (!req.body.customer_name) {
    errors.push("No customer_name specified");
  }
  if (!req.body.invoice_date) {
    errors.push("No invoice_date specified");
  }
  if (!req.body.due_date) {
    errors.push("No due_date specified");
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
    invoice_number: req.body.invoice_number,
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    invoice_date: req.body.invoice_date,
    due_date: req.body.due_date,
    total: req.body.total,
    status: req.body.status
  };
  const sql = 'INSERT INTO invoices (invoice_number, customer_name, customer_email, invoice_date, due_date, total, status) VALUES (?,?,?,?,?,?,?)';
  const params = [data.invoice_number, data.customer_name, data.customer_email, data.invoice_date, data.due_date, data.total, data.status];
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

// Update an invoice
router.put('/:id', (req, res) => {
  const data = {
    invoice_number: req.body.invoice_number,
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    invoice_date: req.body.invoice_date,
    due_date: req.body.due_date,
    total: req.body.total,
    status: req.body.status
  };
  db.run(
    `UPDATE invoices set 
       invoice_number = COALESCE(?,invoice_number), 
       customer_name = COALESCE(?,customer_name), 
       customer_email = COALESCE(?,customer_email),
       invoice_date = COALESCE(?,invoice_date),
       due_date = COALESCE(?,due_date),
       total = COALESCE(?,total),
       status = COALESCE(?,status)
       WHERE id = ?`,
    [data.invoice_number, data.customer_name, data.customer_email, data.invoice_date, data.due_date, data.total, data.status, req.params.id],
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

// Delete an invoice
router.delete('/:id', (req, res) => {
  db.run(
    'DELETE FROM invoices WHERE id = ?',
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
