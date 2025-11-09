import React, { useState, useEffect } from 'react';
import EditInvoice from './EditInvoice';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data.data))
      .catch(error => console.error('Error fetching invoices:', error));
  }, []);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/invoices/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      })
      .catch(error => console.error('Error deleting invoice:', error));
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleUpdate = (updatedInvoice) => {
    fetch(`http://localhost:5000/api/invoices/${updatedInvoice.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedInvoice)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Invoice updated:', data);
        setInvoices(invoices.map(invoice => (invoice.id === updatedInvoice.id ? updatedInvoice : invoice)));
        setSelectedInvoice(null);
      })
      .catch(error => console.error('Error updating invoice:', error));
  };

  return (
    <div>
      <h2>Invoices</h2>
      {selectedInvoice && <EditInvoice invoice={selectedInvoice} onUpdate={handleUpdate} onCancel={() => setSelectedInvoice(null)} />}
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
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
              <td>
                <button onClick={() => handleEdit(invoice)}>Edit</button>
                <button onClick={() => handleDelete(invoice.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Invoices;
