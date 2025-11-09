import React, { useState, useEffect } from 'react';

function Quotes() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/quotes')
      .then(response => response.json())
      .then(data => setQuotes(data.data))
      .catch(error => console.error('Error fetching quotes:', error));
  }, []);

  return (
    <div>
      <h2>Quotes</h2>
      <table>
        <thead>
          <tr>
            <th>Quote Number</th>
            <th>Customer Name</th>
            <th>Quote Date</th>
            <th>Expiry Date</th>
            <th>Total</th>
            <th>Status</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Quotes;
