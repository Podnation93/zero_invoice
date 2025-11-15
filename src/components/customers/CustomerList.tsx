import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Customer } from '../../types';
import { Header } from '../layout/Header';
import { Button } from '../common/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../common/Table';
import { ConfirmModal } from '../common/Modal';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { Input } from '../common/Input';

interface CustomerListProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onCreateNew: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onEdit, onView, onCreateNew }) => {
  const { customers, setCustomers } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null,
  });

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.billingAddress.city.toLowerCase().includes(query)
    );
  });

  const handleDeleteClick = (customer: Customer) => {
    setDeleteModal({ isOpen: true, customer });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.customer) {
      const updatedCustomers = customers.filter((c) => c.id !== deleteModal.customer!.id);
      setCustomers(updatedCustomers);
      setDeleteModal({ isOpen: false, customer: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, customer: null });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Customers"
        subtitle={`${customers.length} total customer${customers.length !== 1 ? 's' : ''}`}
        action={{
          label: 'Add Customer',
          onClick: onCreateNew,
        }}
      />

      <div className="px-8 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search customers by name, email, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery
                ? 'No customers found matching your search.'
                : 'No customers yet. Create your first customer to get started.'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={onCreateNew}>
                Add Your First Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hoverable>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">{customer.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">
                        {customer.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">
                        {customer.billingAddress.city}, {customer.billingAddress.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDate(customer.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(customer)}
                          title="View details"
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                          title="Edit customer"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(customer)}
                          title="Delete customer"
                        >
                          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteModal.customer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
