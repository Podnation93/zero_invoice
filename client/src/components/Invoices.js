import React, { useState, useEffect } from 'react';

function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data.data))
      .catch(error => console.error('Error fetching invoices:', error));
  }, []);

  return (
    <div>
      <h2>Invoices</h2>
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.customer_name}</td>
              <td>{invoice.invoice_date}</td>
              <td>{invoice.due_date}</td>
              <td>{invoice.total}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Invoices;
