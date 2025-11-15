import React, { useState } from 'react';
import type { Invoice, InvoiceStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Header } from '../layout/Header';
import { InvoiceList } from './InvoiceList';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceDetails } from './InvoiceDetails';
import { BulkInvoiceImport } from './BulkInvoiceImport';
import { ConfirmModal } from '../common/Modal';
import { generateInvoicePDF, downloadPDF } from '../../services/pdfService';
import { Upload } from 'lucide-react';
import { Button } from '../common/Button';

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'import';

export const InvoicesPage: React.FC = () => {
  const { invoices, setInvoices, templates } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setViewMode('create');
  };

  const handleBulkImport = () => {
    setViewMode('import');
  };

  const handleImportComplete = () => {
    setViewMode('list');
  };

  const handleImportCancel = () => {
    setViewMode('list');
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('view');
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('edit');
  };

  const handleEditFromDetails = () => {
    if (selectedInvoice) {
      setViewMode('edit');
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceToDelete.id);
      setInvoices(updatedInvoices);
      setShowDeleteConfirm(false);
      setInvoiceToDelete(null);

      // If we were viewing the deleted invoice, go back to list
      if (selectedInvoice?.id === invoiceToDelete.id) {
        setSelectedInvoice(null);
        setViewMode('list');
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setInvoiceToDelete(null);
  };

  const handleSave = (invoice: Invoice) => {
    if (selectedInvoice) {
      // Update existing invoice
      const updatedInvoices = invoices.map((inv) =>
        inv.id === invoice.id ? invoice : inv
      );
      setInvoices(updatedInvoices);
    } else {
      // Create new invoice
      setInvoices([...invoices, invoice]);
    }

    // Return to list view
    setSelectedInvoice(null);
    setViewMode('list');
  };

  const handleCancel = () => {
    setSelectedInvoice(null);
    setViewMode('list');
  };

  const handleStatusChange = (status: InvoiceStatus) => {
    if (selectedInvoice) {
      const updatedInvoice: Invoice = {
        ...selectedInvoice,
        status,
        updatedAt: new Date().toISOString(),
      };

      const updatedInvoices = invoices.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      );

      setInvoices(updatedInvoices);
      setSelectedInvoice(updatedInvoice);
    }
  };

  const handleDownload = async () => {
    if (!selectedInvoice) return;

    try {
      // Find the template for this invoice
      const template = templates.find(t => t.id === selectedInvoice.templateId);

      if (!template) {
        alert('Template not found. Please assign a template to this invoice before downloading.');
        return;
      }

      // Generate PDF
      const pdfBlob = await generateInvoicePDF(selectedInvoice, template);

      // Download the PDF
      const filename = `${selectedInvoice.invoiceNumber}.pdf`;
      downloadPDF(pdfBlob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <InvoiceList
            invoices={invoices}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        );

      case 'create':
      case 'edit':
        return (
          <div className="max-w-5xl mx-auto">
            <InvoiceForm
              invoice={selectedInvoice || undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        );

      case 'view':
        return selectedInvoice ? (
          <div className="max-w-5xl mx-auto">
            <InvoiceDetails
              invoice={selectedInvoice}
              onEdit={handleEditFromDetails}
              onDelete={() => handleDeleteClick(selectedInvoice)}
              onStatusChange={handleStatusChange}
              onDownload={handleDownload}
            />
          </div>
        ) : null;

      case 'import':
        return (
          <BulkInvoiceImport
            onComplete={handleImportComplete}
            onCancel={handleImportCancel}
          />
        );

      default:
        return null;
    }
  };

  const getHeaderProps = () => {
    switch (viewMode) {
      case 'list':
        return {
          title: 'Invoices',
          subtitle: `Manage your invoices and track payments`,
          action: {
            label: 'Create Invoice',
            onClick: handleCreateNew,
          },
        };

      case 'create':
        return {
          title: 'Create Invoice',
          subtitle: 'Fill in the details to create a new invoice',
        };

      case 'edit':
        return {
          title: 'Edit Invoice',
          subtitle: selectedInvoice
            ? `Editing ${selectedInvoice.invoiceNumber}`
            : 'Edit invoice details',
        };

      case 'view':
        return {
          title: 'Invoice Details',
          subtitle: selectedInvoice
            ? `Viewing ${selectedInvoice.invoiceNumber}`
            : 'View invoice details',
        };

      case 'import':
        return {
          title: 'Bulk Import',
          subtitle: 'Import multiple invoices from PDF files',
        };

      default:
        return {
          title: 'Invoices',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header {...getHeaderProps()} />

      <div className="px-8 py-6">
        {/* Import Button for List View */}
        {viewMode === 'list' && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="secondary"
              onClick={handleBulkImport}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Import PDFs
            </Button>
          </div>
        )}

        {renderContent()}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message={
          invoiceToDelete
            ? `Are you sure you want to delete invoice ${invoiceToDelete.invoiceNumber}? This action cannot be undone.`
            : 'Are you sure you want to delete this invoice?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
