import React, { useState } from 'react';

function EditQuote({ quote, onUpdate, onCancel }) {
  const [quoteNumber, setQuoteNumber] = useState(quote.quote_number);
  const [customerName, setCustomerName] = useState(quote.customer_name);
  const [customerEmail, setCustomerEmail] = useState(quote.customer_email);
  const [quoteDate, setQuoteDate] = useState(quote.quote_date);
  const [expiryDate, setExpiryDate] = useState(quote.expiry_date);
  const [total, setTotal] = useState(quote.total);
  const [status, setStatus] = useState(quote.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedQuote = {
      ...quote,
      quote_number: quoteNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      quote_date: quoteDate,
      expiry_date: expiryDate,
      total: total,
      status: status
    };
    onUpdate(updatedQuote);
  };

  return (
    <div>
      <h2>Edit Quote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Quote Number:</label>
          <input type="text" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
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
          <label>Quote Date:</label>
          <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
        </div>
        <div>
          <label>Expiry Date:</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button type="submit">Update Quote</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default EditQuote;
