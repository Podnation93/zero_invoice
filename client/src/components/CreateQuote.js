import React, { useState } from 'react';

function CreateQuote() {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quoteDate, setQuoteDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('draft');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuote = {
      quote_number: quoteNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      quote_date: quoteDate,
      expiry_date: expiryDate,
      total: total,
      status: status
    };
    fetch('http://localhost:5000/api/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuote)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Quote created:', data);
        // Reset form
        setQuoteNumber('');
        setCustomerName('');
        setCustomerEmail('');
        setQuoteDate('');
        setExpiryDate('');
        setTotal(0);
        setStatus('draft');
      })
      .catch(error => console.error('Error creating quote:', error));
  };

  return (
    <div>
      <h2>Create Quote</h2>
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
        <button type="submit">Create Quote</button>
      </form>
    </div>
  );
}

export default CreateQuote;
