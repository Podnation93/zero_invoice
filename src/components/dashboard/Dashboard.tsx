import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MetricCards } from './MetricCards';
import { RecentInvoices } from './RecentInvoices';
import { QuickActions } from './QuickActions';
import { Card } from '../common';
import { formatCurrency } from '../../utils/formatting';
import type { InvoiceStatus } from '../../types';

export const Dashboard: React.FC = () => {
  const { invoices, customers, setCurrentView } = useAppContext();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const outstandingAmount = invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalRevenue,
      outstandingAmount,
      invoicesCount: invoices.length,
      customersCount: customers.length,
    };
  }, [invoices, customers]);

  // Calculate invoice status breakdown
  const statusBreakdown = useMemo(() => {
    const breakdown: Record<InvoiceStatus, number> = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
    };

    invoices.forEach((inv) => {
      breakdown[inv.status]++;
    });

    return breakdown;
  }, [invoices]);

  // Calculate monthly revenue data (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const months: { month: string; revenue: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();

      const revenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.issueDate);
          return (
            inv.status === 'paid' &&
            invDate.getMonth() === date.getMonth() &&
            invDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      months.push({ month: `${monthName} ${year}`, revenue });
    }

    return months;
  }, [invoices]);

  // Get max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const handleViewInvoice = (invoiceId: string) => {
    setCurrentView(`invoice-${invoiceId}`);
  };

  const handleNewInvoice = () => {
    setCurrentView('new-invoice');
  };

  const handleNewCustomer = () => {
    setCurrentView('new-customer');
  };

  const handleNewItem = () => {
    setCurrentView('new-item');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      {/* Metric Cards */}
      <MetricCards
        totalRevenue={metrics.totalRevenue}
        outstandingAmount={metrics.outstandingAmount}
        invoicesCount={metrics.invoicesCount}
        customersCount={metrics.customersCount}
      />

      {/* Charts and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Revenue Overview
            </h2>
            <div className="space-y-4">
              {monthlyRevenue.map((data, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                    {data.month}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{
                            width: `${(data.revenue / maxRevenue) * 100}%`,
                            minWidth: data.revenue > 0 ? '2rem' : '0',
                          }}
                        >
                          {data.revenue > 0 && (
                            <span className="text-xs font-medium text-white">
                              {formatCurrency(data.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {monthlyRevenue.every((m) => m.revenue === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No revenue data yet. Start creating and marking invoices as paid!
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions
            onNewInvoice={handleNewInvoice}
            onNewCustomer={handleNewCustomer}
            onNewItem={handleNewItem}
          />
        </div>
      </div>

      {/* Invoice Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Invoice Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {statusBreakdown.draft}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sent</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {statusBreakdown.sent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {statusBreakdown.paid}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {statusBreakdown.overdue}
              </span>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="mt-6">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {statusBreakdown.draft > 0 && (
                <div
                  className="bg-gray-400 dark:bg-gray-500"
                  style={{
                    width: `${(statusBreakdown.draft / invoices.length) * 100}%`,
                  }}
                  title={`Draft: ${statusBreakdown.draft}`}
                />
              )}
              {statusBreakdown.sent > 0 && (
                <div
                  className="bg-blue-500"
                  style={{
                    width: `${(statusBreakdown.sent / invoices.length) * 100}%`,
                  }}
                  title={`Sent: ${statusBreakdown.sent}`}
                />
              )}
              {statusBreakdown.paid > 0 && (
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(statusBreakdown.paid / invoices.length) * 100}%`,
                  }}
                  title={`Paid: ${statusBreakdown.paid}`}
                />
              )}
              {statusBreakdown.overdue > 0 && (
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(statusBreakdown.overdue / invoices.length) * 100}%`,
                  }}
                  title={`Overdue: ${statusBreakdown.overdue}`}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Top Customer */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Top Customers
          </h2>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No customers yet. Add your first customer to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {customers.slice(0, 5).map((customer) => {
                const customerInvoices = invoices.filter(
                  (inv) => inv.customerId === customer.id
                );
                const totalRevenue = customerInvoices
                  .filter((inv) => inv.status === 'paid')
                  .reduce((sum, inv) => sum + inv.total, 0);
                const invoiceCount = customerInvoices.length;

                return (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => setCurrentView(`customer-${customer.id}`)}
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total revenue
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Invoices */}
      <RecentInvoices invoices={invoices} onViewInvoice={handleViewInvoice} />
    </div>
  );
};
