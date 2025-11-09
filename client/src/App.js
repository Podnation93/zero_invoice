import React from 'react';
import './App.css';
import Invoices from './components/Invoices';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to zero_invoice</h1>
      </header>
      <main>
        <Invoices />
      </main>
    </div>
  );
}

export default App;
