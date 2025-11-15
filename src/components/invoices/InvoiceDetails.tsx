import React from 'react';
import type { Invoice } from '../../types';
import { Card, Button } from '../common';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { getInvoiceStatusBadge } from '../common/Badge';
import { Edit, Trash2, Download, Send, DollarSign } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'sent' | 'paid' | 'overdue') => void;
  onDownload?: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  onEdit,
  onDelete,
  onStatusChange,
  onDownload,
}) => {
  const canMarkAsSent = invoice.status === 'draft';
  const canMarkAsPaid = invoice.status === 'sent' || invoice.status === 'overdue';

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {invoice.invoiceNumber}
            </h2>
            <div className="mt-2 flex items-center space-x-3">
              {getInvoiceStatusBadge(invoice.status)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canMarkAsSent && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange('sent')}
              >
                <Send size={16} className="mr-1" />
                Mark as Sent
              </Button>
            )}

            {canMarkAsPaid && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange('paid')}
              >
                <DollarSign size={16} className="mr-1" />
                Mark as Paid
              </Button>
            )}

            {onDownload && (
              <Button variant="secondary" size="sm" onClick={onDownload}>
                <Download size={16} className="mr-1" />
                Download
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={onEdit}>
              <Edit size={16} className="mr-1" />
              Edit
            </Button>

            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {invoice.customerSnapshot.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {invoice.customerSnapshot.email}
              </p>
            </div>
            {invoice.customerSnapshot.phone && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {invoice.customerSnapshot.phone}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Billing Address</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {invoice.customerSnapshot.billingAddress.street}
                <br />
                {invoice.customerSnapshot.billingAddress.city},{' '}
                {invoice.customerSnapshot.billingAddress.state}{' '}
                {invoice.customerSnapshot.billingAddress.zipCode}
                <br />
                {invoice.customerSnapshot.billingAddress.country}
              </p>
            </div>
          </div>
        </Card>

        {/* Invoice Details */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Invoice Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Issue Date</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {formatDate(invoice.issueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tax Rate</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {invoice.taxRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {formatDate(invoice.updatedAt)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Line Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b dark:border-gray-700 last:border-0"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 border-t dark:border-gray-700 pt-4">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-64">
              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tax ({invoice.taxRate}%):
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(invoice.tax)}
              </span>
            </div>
            <div className="flex justify-between w-64 border-t dark:border-gray-700 pt-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Total:
              </span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Notes
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {invoice.notes}
          </p>
        </Card>
      )}

      {/* AI Summary */}
      {invoice.aiSummary && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            AI Summary
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {invoice.aiSummary}
          </p>
        </Card>
      )}
    </div>
  );
};
