import React, { useState } from 'react';

function EditInvoice({ invoice, onUpdate, onCancel }) {
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number);
  const [customerName, setCustomerName] = useState(invoice.customer_name);
  const [customerEmail, setCustomerEmail] = useState(invoice.customer_email);
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date);
  const [dueDate, setDueDate] = useState(invoice.due_date);
  const [total, setTotal] = useState(invoice.total);
  const [status, setStatus] = useState(invoice.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedInvoice = {
      ...invoice,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      invoice_date: invoiceDate,
      due_date: dueDate,
      total: total,
      status: status
    };
    onUpdate(updatedInvoice);
  };

  return (
    <div>
      <h2>Edit Invoice</h2>
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
        <button type="submit">Update Invoice</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default EditInvoice;
