import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Edit2,
  User,
  Package,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { ImportResult } from '../../types/import';
import type { Invoice, Customer } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface ImportPreviewProps {
  importResults: ImportResult[];
  onComplete: () => void;
  onCancel: () => void;
  onUpdateResult: (id: string, updates: Partial<ImportResult>) => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  importResults,
  onComplete,
  onCancel,
  onUpdateResult,
}) => {
  const { customers, setCustomers, items, setItems, invoices, setInvoices, templates } =
    useAppContext();

  const [selectedResults, setSelectedResults] = useState<Set<string>>(
    new Set(importResults.map((r) => r.id))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResults(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedResults.size === importResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(importResults.map((r) => r.id)));
    }
  };

  const handleImport = async () => {
    setIsImporting(true);

    const selectedImports = importResults.filter((r) => selectedResults.has(r.id));
    const newCustomers: Customer[] = [];
    const newItems: any[] = [];
    const newInvoices: Invoice[] = [];

    for (const result of selectedImports) {
      if (!result.extractedInvoice) continue;

      const { extractedData, customerMatch, itemMatches } = result.extractedInvoice;

      // Handle customer creation/matching
      let customerId: string;
      let customerSnapshot: Customer;

      if (customerMatch?.existingCustomerId) {
        // Use existing customer
        customerId = customerMatch.existingCustomerId;
        const existingCustomer = customers.find((c) => c.id === customerId);
        if (existingCustomer) {
          customerSnapshot = existingCustomer;
        } else {
          // Fallback: create new customer
          customerSnapshot = createCustomerFromData(extractedData);
          customerId = customerSnapshot.id;
          newCustomers.push(customerSnapshot);
        }
      } else {
        // Create new customer
        customerSnapshot = createCustomerFromData(extractedData);
        customerId = customerSnapshot.id;
        newCustomers.push(customerSnapshot);
      }

      // Handle line items and item catalog matching
      const lineItems = extractedData.lineItems?.map((item) => {
        const matchInfo = itemMatches?.[item.name];

        if (matchInfo?.existingItemId) {
          // Match found in catalog
          const catalogItem = items.find((i) => i.id === matchInfo.existingItemId);
          if (catalogItem) {
            return {
              ...item,
              itemId: catalogItem.id,
            };
          }
        } else if (matchInfo?.isNew) {
          // Create new catalog item
          const newItem = {
            id: uuidv4(),
            name: item.name,
            description: item.description,
            unitPrice: item.unitPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newItems.push(newItem);

          return {
            ...item,
            itemId: newItem.id,
          };
        }

        return item;
      }) || [];

      // Create invoice
      const defaultTemplate = templates[0]?.id || 'default';

      const invoice: Invoice = {
        id: uuidv4(),
        invoiceNumber: extractedData.invoiceNumber || `INV-${Date.now()}`,
        customerId,
        customerSnapshot,
        lineItems,
        subtotal: extractedData.subtotal || 0,
        tax: extractedData.tax || 0,
        taxRate: extractedData.taxRate || 0,
        total: extractedData.total || 0,
        status: extractedData.status || 'draft',
        templateId: defaultTemplate,
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date().toISOString().split('T')[0],
        notes: extractedData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newInvoices.push(invoice);

      // Mark as success
      onUpdateResult(result.id, { status: 'success' });
    }

    // Update context with new data
    if (newCustomers.length > 0) {
      setCustomers([...customers, ...newCustomers]);
    }
    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
    }
    if (newInvoices.length > 0) {
      setInvoices([...invoices, ...newInvoices]);
    }

    setIsImporting(false);
    onComplete();
  };

  const createCustomerFromData = (_extractedData: any): Customer => {
    // Try to extract customer info from extracted data or create placeholder
    const now = new Date().toISOString();

    return {
      id: uuidv4(),
      name: 'Imported Customer', // This should be populated from _extractedData
      email: 'customer@example.com', // This should be populated from _extractedData
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      createdAt: now,
      updatedAt: now,
    };
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
          <CheckCircle size={12} />
          High ({(confidence * 100).toFixed(0)}%)
        </span>
      );
    } else if (confidence >= 0.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
          <AlertTriangle size={12} />
          Medium ({(confidence * 100).toFixed(0)}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs">
          <AlertCircle size={12} />
          Low ({(confidence * 100).toFixed(0)}%)
        </span>
      );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Review Imported Invoices
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Review and edit extracted invoice data before importing
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedResults.size} of {importResults.length} selected
              </div>
            </div>
          </div>

          {/* Select All */}
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedResults.size === importResults.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All
              </span>
            </label>
          </div>

          {/* Invoice Preview Cards */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {importResults.map((result) => {
              if (!result.extractedInvoice) return null;

              const { extractedData, confidence, errors, warnings, customerMatch } =
                result.extractedInvoice;

              return (
                <div
                  key={result.id}
                  className={`
                    border-2 rounded-lg p-4 transition-all
                    ${
                      selectedResults.has(result.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedResults.has(result.id)}
                      onChange={() => toggleSelection(result.id)}
                      className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText size={20} className="text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {extractedData.invoiceNumber || 'No Invoice Number'}
                            </h3>
                            {getConfidenceBadge(confidence)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            From: {result.fileName}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(result.id)}
                        >
                          <Edit2 size={16} className="mr-1" />
                          Edit
                        </Button>
                      </div>

                      {/* Invoice Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Customer */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User size={16} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Customer
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Imported Customer
                          </p>
                          {customerMatch?.isNew ? (
                            <p className="text-xs text-blue-600 dark:text-blue-400">New</p>
                          ) : (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Matched ({(customerMatch?.matchConfidence || 0) * 100}%)
                            </p>
                          )}
                        </div>

                        {/* Dates */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Dates
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Issue: {formatDate(extractedData.issueDate)}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Due: {formatDate(extractedData.dueDate)}
                          </p>
                        </div>

                        {/* Items */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={16} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Line Items
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {extractedData.lineItems?.length || 0} items
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Subtotal: ${extractedData.subtotal?.toFixed(2) || '0.00'}
                          </p>
                        </div>

                        {/* Total */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign size={16} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Total
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ${extractedData.total?.toFixed(2) || '0.00'}
                          </p>
                          {extractedData.tax ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tax: ${extractedData.tax.toFixed(2)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Errors and Warnings */}
                      {(errors.length > 0 || warnings.length > 0) && (
                        <div className="space-y-2">
                          {errors.length > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <AlertCircle size={16} className="text-red-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                  Errors:
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                                  {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {warnings.length > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                              <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                  Warnings:
                                </p>
                                <ul className="text-xs text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                                  {warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={onCancel} disabled={isImporting}>
              Back
            </Button>

            <Button
              variant="primary"
              onClick={handleImport}
              loading={isImporting}
              disabled={selectedResults.size === 0 || isImporting}
            >
              Import {selectedResults.size} Invoice{selectedResults.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal - Placeholder for future implementation */}
      {editingId && (
        <Modal
          isOpen={true}
          onClose={() => setEditingId(null)}
          title="Edit Invoice Data"
          size="lg"
        >
          <div className="text-gray-600 dark:text-gray-400">
            <p>Edit functionality coming soon...</p>
            <p className="text-sm mt-2">
              You can manually edit the invoice after import from the invoice details page.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setEditingId(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
