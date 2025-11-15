import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ImportResult, ImportStats, ExtractionOptions } from '../../types/import';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { pdfExtractorService } from '../../services/pdfExtractorService';
import { invoiceParserService } from '../../services/invoiceParserService';
import { useAppContext } from '../../context/AppContext';
import { ImportPreview } from './ImportPreview';
import { v4 as uuidv4 } from 'uuid';

interface BulkInvoiceImportProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const BulkInvoiceImport: React.FC<BulkInvoiceImportProps> = ({ onComplete, onCancel }) => {
  const { customers, items } = useAppContext();
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [_options] = useState<ExtractionOptions>({
    useAI: true,
    autoMatchCustomers: true,
    autoMatchItems: true,
    createNewCustomers: true,
    createNewItems: true,
  });

  // Calculate statistics
  const stats: ImportStats = {
    total: importResults.length,
    pending: importResults.filter((r) => r.status === 'pending').length,
    processing: importResults.filter((r) => r.status === 'processing').length,
    ready: importResults.filter((r) => r.status === 'ready').length,
    success: importResults.filter((r) => r.status === 'success').length,
    failed: importResults.filter((r) => r.status === 'failed').length,
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newResults: ImportResult[] = Array.from(files).map((file) => ({
      id: uuidv4(),
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0,
      file,
    }));

    setImportResults((prev) => [...prev, ...newResults]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (id: string) => {
    setImportResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleProcessFiles = async () => {
    setIsProcessing(true);

    const pendingResults = importResults.filter((r) => r.status === 'pending');

    for (const result of pendingResults) {
      try {
        // Update status to processing
        setImportResults((prev) =>
          prev.map((r) => (r.id === result.id ? { ...r, status: 'processing', progress: 0 } : r))
        );

        // Validate PDF
        const isValid = await pdfExtractorService.validatePDF(result.file);
        if (!isValid) {
          throw new Error('Invalid PDF file');
        }

        // Extract text
        const extractionResult = await pdfExtractorService.extractText(result.file, (progress) => {
          setImportResults((prev) =>
            prev.map((r) => (r.id === result.id ? { ...r, progress: progress * 0.5 } : r))
          );
        });

        // Update progress to 50%
        setImportResults((prev) =>
          prev.map((r) => (r.id === result.id ? { ...r, progress: 50 } : r))
        );

        // Parse invoice data
        const extractedInvoice = await invoiceParserService.parseInvoice(
          extractionResult.text,
          customers,
          items
        );

        // Update to ready status
        setImportResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? {
                  ...r,
                  status: 'ready',
                  progress: 100,
                  extractedInvoice,
                }
              : r
          )
        );
      } catch (error) {
        console.error(`Error processing ${result.fileName}:`, error);

        setImportResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? {
                  ...r,
                  status: 'failed',
                  progress: 0,
                  error: error instanceof Error ? error.message : 'Failed to process file',
                }
              : r
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleShowPreview = () => {
    const hasReadyInvoices = importResults.some((r) => r.status === 'ready');
    if (hasReadyInvoices) {
      setShowPreview(true);
    }
  };

  const handleRemoveFailed = () => {
    setImportResults((prev) => prev.filter((r) => r.status !== 'failed'));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: ImportResult['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="text-gray-400" size={20} />;
      case 'processing':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      case 'ready':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusColor = (status: ImportResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  if (showPreview) {
    return (
      <ImportPreview
        importResults={importResults.filter((r) => r.status === 'ready')}
        onComplete={onComplete}
        onCancel={() => setShowPreview(false)}
        onUpdateResult={(id, updates) => {
          setImportResults((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
          );
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bulk Invoice Import
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload multiple PDF invoices to import them automatically using AI-powered extraction
          </p>

          {/* Upload Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${
                isDragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Drag and drop PDF files here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">or</p>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Supports multiple PDF files. Maximum file size: 10MB per file.
            </p>
          </div>

          {/* Statistics */}
          {importResults.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {stats.pending}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.processing}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Processing</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.ready}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Ready</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.success}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Success</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {stats.failed}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
              </div>
            </div>
          )}

          {/* File List */}
          {importResults.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Files ({importResults.length})
                </h3>
                {stats.failed > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleRemoveFailed}>
                    Remove Failed
                  </Button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {importResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    {getStatusIcon(result.status)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.fileName}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(result.fileSize)}
                      </p>

                      {result.status === 'processing' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${result.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {result.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {result.error}
                        </p>
                      )}

                      {result.extractedInvoice && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>
                            Invoice: {result.extractedInvoice.extractedData.invoiceNumber || 'N/A'}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            Confidence: {(result.extractedInvoice.confidence * 100).toFixed(0)}%
                          </span>
                          {result.extractedInvoice.errors.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-red-600 dark:text-red-400">
                                {result.extractedInvoice.errors.length} error(s)
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveFile(result.id)}
                      disabled={result.status === 'processing'}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>

            <div className="flex gap-3">
              {stats.pending > 0 && (
                <Button
                  variant="primary"
                  onClick={handleProcessFiles}
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  Process Files ({stats.pending})
                </Button>
              )}

              {stats.ready > 0 && (
                <Button variant="primary" onClick={handleShowPreview} disabled={isProcessing}>
                  Review & Import ({stats.ready})
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
