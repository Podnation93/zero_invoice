import React, { useState, useEffect } from 'react';
import type { Invoice, InvoiceFormData, InvoiceStatus, LineItem } from '../../types';
import { Button, Input, Select, Textarea, Card } from '../common';
import { LineItemsTable } from './LineItemsTable';
import { useAppContext } from '../../context/AppContext';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency, generateInvoiceNumber } from '../../utils/formatting';
import { invoiceSchema } from '../../utils/validation';
import { v4 as uuidv4 } from 'uuid';
import { Save, X } from 'lucide-react';
import { z } from 'zod';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onSave,
  onCancel,
}) => {
  const { customers, items, invoices, templates } = useAppContext();

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: invoice?.customerId || '',
    lineItems: invoice?.lineItems || [],
    taxRate: invoice?.taxRate || 0,
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: invoice?.notes || '',
    status: invoice?.status || 'draft',
    templateId: invoice?.templateId || (templates.length > 0 ? templates[0].id : ''),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [lineItemErrors, setLineItemErrors] = useState<{ [key: number]: { [field: string]: string } }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save draft functionality
  useEffect(() => {
    if (formData.status === 'draft' && formData.customerId && formData.lineItems.length > 0) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [formData]);

  const handleAutoSave = () => {
    if (formData.status === 'draft' && invoice) {
      // Only auto-save existing drafts
      try {
        const validatedData = validateForm(true);
        if (validatedData) {
          const updatedInvoice = createInvoiceObject(validatedData);
          onSave(updatedInvoice);
        }
      } catch (error) {
        // Silently fail auto-save, user can still manually save
      }
    }
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineItemsChange = (lineItems: LineItem[]) => {
    setFormData((prev) => ({
      ...prev,
      lineItems,
    }));

    // Clear line items error
    if (errors.lineItems) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.lineItems;
        return newErrors;
      });
    }
    setLineItemErrors({});
  };

  const validateForm = (isAutoSave: boolean = false): InvoiceFormData | null => {
    try {
      const validatedData = invoiceSchema.parse(formData);
      setErrors({});
      setLineItemErrors({});
      return validatedData as InvoiceFormData;
    } catch (error) {
      if (!isAutoSave && error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        const newLineItemErrors: { [key: number]: { [field: string]: string } } = {};

        error.issues.forEach((err) => {
          const path = err.path.join('.');

          // Check if error is for a line item
          if (err.path[0] === 'lineItems' && typeof err.path[1] === 'number') {
            const lineItemIndex = err.path[1];
            const field = err.path[2] as string;

            if (!newLineItemErrors[lineItemIndex]) {
              newLineItemErrors[lineItemIndex] = {};
            }
            newLineItemErrors[lineItemIndex][field] = err.message;
          } else {
            newErrors[path] = err.message;
          }
        });

        setErrors(newErrors);
        setLineItemErrors(newLineItemErrors);
      }
      return null;
    }
  };

  const createInvoiceObject = (validatedData: InvoiceFormData): Invoice => {
    const selectedCustomer = customers.find((c) => c.id === validatedData.customerId);
    if (!selectedCustomer) {
      throw new Error('Customer not found');
    }

    const { subtotal, tax, total } = calculateInvoiceTotals(
      validatedData.lineItems,
      validatedData.taxRate
    );

    const now = new Date().toISOString();

    return {
      id: invoice?.id || uuidv4(),
      invoiceNumber: invoice?.invoiceNumber || generateInvoiceNumber(invoices),
      customerId: validatedData.customerId,
      customerSnapshot: selectedCustomer,
      lineItems: validatedData.lineItems,
      subtotal,
      tax,
      taxRate: validatedData.taxRate,
      total,
      status: validatedData.status,
      templateId: validatedData.templateId,
      dueDate: validatedData.dueDate,
      issueDate: validatedData.issueDate,
      notes: validatedData.notes,
      createdAt: invoice?.createdAt || now,
      updatedAt: now,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const validatedData = validateForm();
      if (!validatedData) {
        setIsSaving(false);
        return;
      }

      const invoiceObject = createInvoiceObject(validatedData);
      onSave(invoiceObject);
    } catch (error) {
      console.error('Error saving invoice:', error);
      setErrors({ submit: 'Failed to save invoice. Please try again.' });
      setIsSaving(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData((prev) => ({ ...prev, status: 'draft' }));
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 0);
  };

  const { subtotal, tax, total } = calculateInvoiceTotals(formData.lineItems, formData.taxRate);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invoice Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer *"
              options={customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={formData.customerId}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              placeholder="Select a customer"
              error={errors.customerId}
            />

            <Select
              label="Template *"
              options={templates.map((template) => ({
                value: template.id,
                label: template.name,
              }))}
              value={formData.templateId}
              onChange={(e) => handleInputChange('templateId', e.target.value)}
              placeholder="Select a template"
              error={errors.templateId}
            />

            <Input
              label="Issue Date *"
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              error={errors.issueDate}
            />

            <Input
              label="Due Date *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              error={errors.dueDate}
            />

            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
              error={errors.taxRate}
            />

            <Select
              label="Status *"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as InvoiceStatus)}
              error={errors.status}
            />
          </div>

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or terms..."
            rows={3}
          />
        </div>
      </Card>

      <Card>
        <LineItemsTable
          lineItems={formData.lineItems}
          onChange={handleLineItemsChange}
          items={items}
          errors={lineItemErrors}
        />
        {errors.lineItems && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.lineItems}</p>
        )}
      </Card>

      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invoice Summary
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax ({formData.taxRate}%):
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(tax)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total:
                </span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {errors.submit && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel} type="button">
          <X size={18} className="mr-2" />
          Cancel
        </Button>

        {formData.status === 'draft' && (
          <Button
            variant="secondary"
            onClick={handleSaveAsDraft}
            type="button"
            disabled={isSaving}
          >
            <Save size={18} className="mr-2" />
            Save Draft
          </Button>
        )}

        <Button variant="primary" type="submit" loading={isSaving}>
          <Save size={18} className="mr-2" />
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};
