import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Customer, Item, Invoice, Template } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  items: Item[];
  setItems: (items: Item[]) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('zero-invoice-customers', []);
  const [items, setItems] = useLocalStorage<Item[]>('zero-invoice-items', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('zero-invoice-invoices', []);
  const [templates, setTemplates] = useLocalStorage<Template[]>('zero-invoice-templates', []);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('zero-invoice-darkmode', false);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const value: AppContextType = {
    customers,
    setCustomers,
    items,
    setItems,
    invoices,
    setInvoices,
    templates,
    setTemplates,
    darkMode,
    toggleDarkMode,
    currentView,
    setCurrentView,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
