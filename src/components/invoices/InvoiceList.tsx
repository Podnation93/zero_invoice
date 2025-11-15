import React, { useState, useMemo } from 'react';
import type { Invoice, InvoiceStatus } from '../../types';
import { Card, Button, Input, Select, ConfirmModal } from '../common';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { getInvoiceStatusBadge } from '../common/Badge';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onView,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; invoice: Invoice | null }>({
    isOpen: false,
    invoice: null,
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'customer', label: 'Customer' },
  ];

  const handleDeleteClick = (invoice: Invoice) => {
    setDeleteModal({ isOpen: true, invoice });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.invoice) {
      onDelete(deleteModal.invoice);
      setDeleteModal({ isOpen: false, invoice: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, invoice: null });
  };

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    // Handle empty invoices array
    if (!invoices || invoices.length === 0) {
      return [];
    }

    let filtered = [...invoices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice?.invoiceNumber?.toLowerCase().includes(query) ||
          invoice?.customerSnapshot?.name?.toLowerCase().includes(query) ||
          invoice?.customerSnapshot?.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice?.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.issueDate || 0).getTime() - new Date(b.issueDate || 0).getTime();
          break;
        case 'amount':
          compareValue = (a.total || 0) - (b.total || 0);
          break;
        case 'customer':
          compareValue = (a.customerSnapshot?.name || '').localeCompare(b.customerSnapshot?.name || '');
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [invoices, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = invoices.length;
    const draft = invoices.filter((inv) => inv.status === 'draft').length;
    const sent = invoices.filter((inv) => inv.status === 'sent').length;
    const paid = invoices.filter((inv) => inv.status === 'paid').length;
    const overdue = invoices.filter((inv) => inv.status === 'overdue').length;

    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const outstanding = invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    return { total, draft, sent, paid, overdue, totalRevenue, outstanding };
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Invoices
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Total Revenue
            </p>
            <p className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-green-700 dark:text-green-300">
              {stats.paid} paid invoices
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Outstanding
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatCurrency(stats.outstanding)}
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              {stats.sent + stats.overdue} unpaid invoices
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <div>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.draft}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by invoice number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            />

            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'customer')}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSortOrder}
              title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice List */}
      {filteredAndSortedInvoices.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery || statusFilter !== 'all'
                ? 'No invoices found matching your filters.'
                : 'No invoices yet. Create your first invoice to get started!'}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {invoice.customerSnapshot.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.customerSnapshot.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.issueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(invoice.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getInvoiceStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView(invoice)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(invoice)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit invoice"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(invoice)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete invoice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredAndSortedInvoices.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredAndSortedInvoices.length} of {invoices.length} invoice(s)
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${deleteModal.invoice?.invoiceNumber || ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
