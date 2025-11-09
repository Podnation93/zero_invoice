import React, { useState, useEffect } from 'react';
import EditQuote from './EditQuote';

function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/quotes')
      .then(response => response.json())
      .then(data => setQuotes(data.data))
      .catch(error => console.error('Error fetching quotes:', error));
  }, []);

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/quotes/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setQuotes(quotes.filter(quote => quote.id !== id));
      })
      .catch(error => console.error('Error deleting quote:', error));
  };

  const handleEdit = (quote) => {
    setSelectedQuote(quote);
  };

  const handleUpdate = (updatedQuote) => {
    fetch(`http://localhost:5000/api/quotes/${updatedQuote.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedQuote)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Quote updated:', data);
        setQuotes(quotes.map(quote => (quote.id === updatedQuote.id ? updatedQuote : quote)));
        setSelectedQuote(null);
      })
      .catch(error => console.error('Error updating quote:', error));
  };

  return (
    <div>
      <h2>Quotes</h2>
      {selectedQuote && <EditQuote quote={selectedQuote} onUpdate={handleUpdate} onCancel={() => setSelectedQuote(null)} />}
      <table>
        <thead>
          <tr>
            <th>Quote Number</th>
            <th>Customer Name</th>
            <th>Quote Date</th>
            <th>Expiry Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(quote => (
            <tr key={quote.id}>
              <td>{quote.quote_number}</td>
              <td>{quote.customer_name}</td>
              <td>{quote.quote_date}</td>
              <td>{quote.expiry_date}</td>
              <td>{quote.total}</td>
              <td>{quote.status}</td>
              <td>
                <button onClick={() => handleEdit(quote)}>Edit</button>
                <button onClick={() => handleDelete(quote.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Quotes;
