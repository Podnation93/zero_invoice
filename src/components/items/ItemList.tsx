import React, { useState } from 'react';
import { Pencil, Trash2, Package } from 'lucide-react';
import type { Item } from '../../types/item';
import { useAppContext } from '../../context/AppContext';
import { Header } from '../layout/Header';
import { Button } from '../common/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../common/Table';
import { ConfirmModal } from '../common/Modal';
import { ItemForm } from './ItemForm';

export const ItemList: React.FC = () => {
  const { items, setItems } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: Item | null }>({
    isOpen: false,
    item: null,
  });

  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: Item) => {
    setDeleteConfirm({ isOpen: true, item });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      setItems(items.filter((item) => item.id !== deleteConfirm.item!.id));
      setDeleteConfirm({ isOpen: false, item: null });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Item Catalog"
        subtitle="Manage your products and services"
        action={{
          label: 'Add Item',
          onClick: handleAddItem,
        }}
      />

      <div className="p-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Package size={32} className="text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No items yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first product or service.
            </p>
            <Button variant="primary" onClick={handleAddItem}>
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell align="right">Unit Price</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Updated</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400 max-w-md truncate">
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.unitPrice)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDate(item.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          title="Edit item"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          title="Delete item"
                        >
                          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
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

      {isFormOpen && (
        <ItemForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          editingItem={editingItem}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
