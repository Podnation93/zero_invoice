import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Customer } from '../../types';
import { Header } from '../layout/Header';
import { Card, MetricCard } from '../common/Card';
import { Button } from '../common/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../common/Table';
import { getInvoiceStatusBadge } from '../common/Badge';
import { ArrowLeft, Mail, Phone, MapPin, FileText, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface CustomerProfileProps {
  customer: Customer;
  onBack: () => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onBack, onEdit }) => {
  const { invoices } = useAppContext();

  // Get all invoices for this customer
  const customerInvoices = useMemo(() => {
    return invoices.filter((invoice) => invoice.customerId === customer.id);
  }, [invoices, customer.id]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalInvoices = customerInvoices.length;
    const totalRevenue = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = customerInvoices.filter((inv) => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingInvoices = customerInvoices.filter(
      (inv) => inv.status === 'sent' || inv.status === 'overdue'
    );
    const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = customerInvoices.filter((inv) => inv.status === 'overdue');
    const overdueRevenue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices: paidInvoices.length,
      paidRevenue,
      pendingInvoices: pendingInvoices.length,
      pendingRevenue,
      overdueInvoices: overdueInvoices.length,
      overdueRevenue,
      averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
    };
  }, [customerInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        title={customer.name}
        subtitle="Customer Details"
        action={{
          label: 'Edit Customer',
          onClick: () => onEdit(customer),
        }}
      />

      <div className="px-8 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Customers
          </Button>
        </div>

        {/* Customer Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="text-gray-400 mr-3 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    <a
                      href={`mailto:${customer.email}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {customer.email}
                    </a>
                  </p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-start">
                  <Phone className="text-gray-400 mr-3 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      <a
                        href={`tel:${customer.phone}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {customer.phone}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <MapPin className="text-gray-400 mr-3 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Billing Address</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {customer.billingAddress.street}
                    <br />
                    {customer.billingAddress.city}, {customer.billingAddress.state}{' '}
                    {customer.billingAddress.zipCode}
                    <br />
                    {customer.billingAddress.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-gray-400 mr-3 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer Since</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalInvoices}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Invoice</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(analytics.averageInvoiceValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalInvoices > 0
                    ? Math.round((analytics.paidInvoices / analytics.totalInvoices) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            icon={<DollarSign className="text-primary-600" size={24} />}
          />
          <MetricCard
            title="Paid Revenue"
            value={formatCurrency(analytics.paidRevenue)}
            icon={<TrendingUp className="text-green-600" size={24} />}
          />
          <MetricCard
            title="Pending Revenue"
            value={formatCurrency(analytics.pendingRevenue)}
            icon={<Clock className="text-yellow-600" size={24} />}
          />
          <MetricCard
            title="Overdue Revenue"
            value={formatCurrency(analytics.overdueRevenue)}
            icon={<FileText className="text-red-600" size={24} />}
          />
        </div>

        {/* Invoices Table */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Invoice History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All invoices for this customer
            </p>
          </div>

          {customerInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                No invoices yet for this customer.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Issue Date</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell align="right">Amount</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {customerInvoices
                    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                    .map((invoice) => (
                      <TableRow key={invoice.id} hoverable>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 dark:text-gray-400">
                            {formatDate(invoice.issueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 dark:text-gray-400">
                            {formatDate(invoice.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                        <TableCell align="right">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(invoice.total)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
