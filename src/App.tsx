import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard';
import { CustomersPage } from './components/customers';
import { ItemList } from './components/items';
import { InvoicesPage } from './components/invoices';
import { TemplatesPage } from './components/templates';
import { getDefaultTemplates } from './services/defaultTemplates';

const AppContent: React.FC = () => {
  const { currentView, templates, setTemplates } = useAppContext();

  // Initialize default templates on first load
  useEffect(() => {
    if (templates.length === 0) {
      const defaultTemplates = getDefaultTemplates();
      setTemplates(defaultTemplates);
    }
  }, [templates.length, setTemplates]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <InvoicesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'items':
        return <ItemList />;
      case 'templates':
        return <TemplatesPage />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderView()}</Layout>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
