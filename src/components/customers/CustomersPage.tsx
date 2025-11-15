import React, { useState } from 'react';
import type { Customer } from '../../types';
import { CustomerList } from './CustomerList';
import { CustomerForm } from './CustomerForm';
import { CustomerProfile } from './CustomerProfile';

type ViewMode = 'list' | 'profile';

export const CustomersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleCreateNew = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('profile');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  return (
    <>
      {viewMode === 'list' ? (
        <CustomerList onEdit={handleEdit} onView={handleView} onCreateNew={handleCreateNew} />
      ) : (
        selectedCustomer && (
          <CustomerProfile
            customer={selectedCustomer}
            onBack={handleBackToList}
            onEdit={handleEdit}
          />
        )
      )}

      <CustomerForm isOpen={isFormOpen} onClose={handleFormClose} customer={editingCustomer} />
    </>
  );
};
