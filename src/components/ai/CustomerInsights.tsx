import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { Customer, Invoice } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Card, MetricCard } from '../common/Card';
import { Button } from '../common/Button';

interface CustomerInsightsProps {
  customer: Customer;
  invoices: Invoice[];
  className?: string;
}

export const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  customer,
  invoices,
  className = '',
}) => {
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Calculate metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const avgInvoiceAmount = invoices.length > 0 ? totalRevenue / invoices.length : 0;
  const paymentRate =
    invoices.length > 0 ? ((paidInvoices.length / invoices.length) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (!geminiService.isConfigured()) {
      setError(
        'AI service is not configured. Please set up your Gemini API key in environment variables.'
      );
    }
  }, []);

  const handleGenerateInsights = async () => {
    if (invoices.length === 0) {
      setError('No invoice history available for this customer.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const aiInsights = await geminiService.generateCustomerInsights(customer, invoices);
      setInsights(aiInsights);
      setHasGenerated(true);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate customer insights');
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = geminiService.isConfigured();
  const hasInvoices = invoices.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Customer Analytics
            </h3>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{customer.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div>Email: {customer.email}</div>
            {customer.phone && <div>Phone: {customer.phone}</div>}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<DollarSign size={20} className="text-green-600" />}
          />
          <MetricCard
            title="Total Invoices"
            value={invoices.length}
            icon={<FileText size={20} className="text-blue-600" />}
          />
          <MetricCard
            title="Paid Invoices"
            value={paidInvoices.length}
            icon={<CheckCircle size={20} className="text-green-600" />}
          />
          <MetricCard
            title="Overdue"
            value={overdueInvoices.length}
            icon={
              overdueInvoices.length > 0 ? (
                <AlertTriangle size={20} className="text-red-600" />
              ) : (
                <CheckCircle size={20} className="text-green-600" />
              )
            }
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Average Invoice</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ${avgInvoiceAmount.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Payment Rate</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {paymentRate}%
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI-Powered Insights
            </h3>
          </div>
          {hasGenerated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateInsights}
              loading={isLoading}
            >
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </Button>
          )}
        </div>

        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3 mb-4">
            <AlertCircle
              size={20}
              className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">AI Service Not Configured</p>
              <p>
                To use AI-powered customer insights, please set the VITE_GEMINI_API_KEY environment
                variable with your Google Gemini API key.
              </p>
            </div>
          </div>
        )}

        {/* No Invoices Warning */}
        {!hasInvoices && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3 mb-4">
            <AlertCircle
              size={20}
              className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">No Invoice History</p>
              <p>This customer doesn't have any invoices yet. Create invoices to see AI insights.</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 mb-4">
            <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        {/* Generate Button */}
        {!hasGenerated && !isLoading && (
          <Button
            variant="primary"
            fullWidth
            onClick={handleGenerateInsights}
            loading={isLoading}
            disabled={!isConfigured || !hasInvoices || isLoading}
          >
            <Sparkles size={20} className="mr-2" />
            Generate AI Insights
          </Button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing customer data...</p>
          </div>
        )}

        {/* Generated Insights */}
        {insights && !isLoading && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {insights}
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            {overdueInvoices.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Payment Risk Detected
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      This customer has {overdueInvoices.length} overdue invoice
                      {overdueInvoices.length > 1 ? 's' : ''}. Consider following up for payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Positive Indicator */}
            {parseFloat(paymentRate) === 100 && invoices.length >= 3 && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                      Excellent Payment History
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      This customer has a 100% on-time payment rate. They're a reliable partner!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Understanding Insights:
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• AI analyzes payment patterns and revenue trends</li>
            <li>• Use insights to improve customer relationships</li>
            <li>• Refresh insights periodically for updated analysis</li>
            <li>• Consider insights when setting payment terms</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
