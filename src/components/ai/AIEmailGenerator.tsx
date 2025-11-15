import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, Copy, Send, AlertCircle, CheckCircle } from 'lucide-react';
import type { Invoice } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Card } from '../common/Card';

interface AIEmailGeneratorProps {
  invoice: Invoice;
  onClose?: () => void;
  className?: string;
}

export const AIEmailGenerator: React.FC<AIEmailGeneratorProps> = ({
  invoice,
  onClose,
  className = '',
}) => {
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  useEffect(() => {
    if (!geminiService.isConfigured()) {
      setError('AI service is not configured. Please set up your Gemini API key in environment variables.');
    }
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setCopied(false);

    try {
      const draft = await geminiService.generateEmailDraft(invoice);
      setEmailDraft(draft);

      // Parse subject and body
      const subjectMatch = draft.match(/Subject:\s*(.+?)(?:\n\n|\n)/i);
      if (subjectMatch) {
        setSubject(subjectMatch[1].trim());
        setBody(draft.substring(draft.indexOf('\n\n') + 2).trim());
      } else {
        setSubject(`Invoice ${invoice.invoiceNumber}`);
        setBody(draft);
      }
    } catch (err) {
      console.error('Error generating email:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate email draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const handleSendEmail = () => {
    // Create mailto link with pre-filled content
    const mailtoLink = `mailto:${invoice.customerSnapshot.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const isConfigured = geminiService.isConfigured();

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Email Generator
            </h3>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Invoice Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Invoice:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Customer:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {invoice.customerSnapshot.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                ${invoice.total.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {invoice.customerSnapshot.email}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">AI Service Not Configured</p>
              <p>
                To use AI-powered email generation, please set the VITE_GEMINI_API_KEY environment
                variable with your Google Gemini API key.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        {/* Generate Button */}
        {!emailDraft && (
          <Button
            variant="primary"
            fullWidth
            onClick={handleGenerate}
            loading={isLoading}
            disabled={!isConfigured || isLoading}
          >
            <Sparkles size={20} className="mr-2" />
            {isLoading ? 'Generating Email...' : 'Generate Email Draft'}
          </Button>
        )}

        {/* Generated Email */}
        {emailDraft && !isLoading && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Body
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Success Message */}
            {copied && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Copied to clipboard!
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSendEmail} fullWidth>
                <Send size={18} className="mr-2" />
                Open in Email Client
              </Button>
              <Button variant="secondary" onClick={handleCopy}>
                <Copy size={18} className="mr-2" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="ghost" onClick={handleGenerate} loading={isLoading}>
                <Sparkles size={18} className="mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Tips:</h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Edit the generated email to match your tone and style</li>
            <li>• Add personal touches or specific details about the project</li>
            <li>• Review all information before sending</li>
            <li>• The email will open in your default email client</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
