import React, { useState } from 'react';
import './App.css';
import Invoices from './components/Invoices';
import CreateInvoice from './components/CreateInvoice';
import Quotes from './components/Quotes';
import CreateQuote from './components/CreateQuote';

function App() {
  const [view, setView] = useState('invoices');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to zero_invoice</h1>
        <nav>
          <button onClick={() => setView('invoices')}>Invoices</button>
          <button onClick={() => setView('quotes')}>Quotes</button>
        </nav>
      </header>
      <main>
        {view === 'invoices' && (
          <>
            <CreateInvoice />
            <Invoices />
          </>
        )}
        {view === 'quotes' && (
          <>
            <CreateQuote />
            <Quotes />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
