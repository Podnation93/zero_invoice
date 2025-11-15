import React, { useRef, useState } from 'react';
import { Card, Button } from '../common';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAppContext } from '../../context/AppContext';

/**
 * DataManagement Component
 * Provides export/import functionality and storage management
 */
export const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const { customers, items, invoices, templates } = useAppContext();

  const storageSize = storageService.getStorageSizeInMB();
  const totalRecords = customers.length + items.length + invoices.length + templates.length;

  /**
   * Exports all application data as JSON file
   */
  const handleExport = () => {
    try {
      const data = storageService.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `zero-invoice-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  /**
   * Handles file selection for import
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Processes imported file
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate imported data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      // Import data (will overwrite existing data)
      storageService.importData(data, true);

      // Reload page to reflect imported data
      setImportSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Failed to import data. Please check the file format.'
      );
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Clears all application data
   */
  const handleClearData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear ALL data? This will delete all customers, items, invoices, and templates. This action cannot be undone.\n\nIt is recommended to export your data first.'
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your last chance! Are you absolutely sure you want to delete everything?'
      );

      if (doubleConfirm) {
        try {
          storageService.clear();
          window.location.reload();
        } catch (error) {
          console.error('Clear data failed:', error);
          alert('Failed to clear data. Please try again.');
        }
      }
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Data Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export, import, or manage your application data
          </p>
        </div>

        {/* Storage Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Storage Information
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Current Usage: <strong>{storageSize} MB</strong>
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Total Records: <strong>{totalRecords}</strong> ({customers.length} customers, {items.length} items, {invoices.length} invoices, {templates.length} templates)
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {importSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Data imported successfully! Reloading...
            </p>
          </div>
        )}

        {importError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Import Error:</strong> {importError}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={handleExport}
            fullWidth
            className="flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            Export Data
          </Button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={handleImportClick}
              fullWidth
              disabled={importing}
              loading={importing}
              className="flex items-center justify-center"
            >
              <Upload size={18} className="mr-2" />
              Import Data
            </Button>
          </div>

          <Button
            variant="danger"
            onClick={handleClearData}
            fullWidth
            className="flex items-center justify-center"
          >
            <Trash2 size={18} className="mr-2" />
            Clear All Data
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            How to use:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Export:</strong> Download all your data as a JSON file for backup</li>
            <li><strong>Import:</strong> Restore data from a previously exported JSON file (overwrites current data)</li>
            <li><strong>Clear:</strong> Remove all data from the application (use with caution!)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
