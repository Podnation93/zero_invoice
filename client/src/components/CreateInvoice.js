import React, { useState } from 'react';

function CreateInvoice() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('draft');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoice = {
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      invoice_date: invoiceDate,
      due_date: dueDate,
      total: total,
      status: status
    };
    fetch('http://localhost:5000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newInvoice)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Invoice created:', data);
        // Reset form
        setInvoiceNumber('');
        setCustomerName('');
        setCustomerEmail('');
        setInvoiceDate('');
        setDueDate('');
        setTotal(0);
        setStatus('draft');
      })
      .catch(error => console.error('Error creating invoice:', error));
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Invoice Number:</label>
          <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
        <div>
          <label>Customer Name:</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label>Customer Email:</label>
          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
        <div>
          <label>Invoice Date:</label>
          <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
        <div>
          <label>Due Date:</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label>Total:</label>
          <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
}

export default CreateInvoice;
