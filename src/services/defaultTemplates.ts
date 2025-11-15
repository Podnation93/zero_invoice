import type { Template, TemplateSchema } from '../types';

/**
 * Returns the default invoice templates for the Zero Invoice application.
 * Includes three professionally designed templates: Modern, Classic, and Minimal.
 */
export function getDefaultTemplates(): Template[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'template-modern',
      name: 'Modern',
      isDefault: true,
      schemaJSON: getModernTemplateSchema(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'template-classic',
      name: 'Classic',
      isDefault: true,
      schemaJSON: getClassicTemplateSchema(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'template-minimal',
      name: 'Minimal',
      isDefault: true,
      schemaJSON: getMinimalTemplateSchema(),
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Modern Template - Bold colors, clean lines, contemporary design
 */
function getModernTemplateSchema(): TemplateSchema {
  return {
    layout: [
      {
        id: 'logo-block',
        type: 'logo',
        position: { x: 20, y: 20 },
        size: { width: 80, height: 80 },
        config: {
          alignment: 'left',
          showBorder: false,
          placeholder: 'Company Logo',
        },
      },
      {
        id: 'header-block',
        type: 'header',
        position: { x: 110, y: 20 },
        size: { width: 180, height: 80 },
        config: {
          alignment: 'right',
          showInvoiceNumber: true,
          showDates: true,
          dateFormat: 'MMM dd, yyyy',
          titleText: 'INVOICE',
          titleSize: 32,
          showStatus: true,
        },
      },
      {
        id: 'customer-block',
        type: 'customer',
        position: { x: 20, y: 120 },
        size: { width: 130, height: 60 },
        config: {
          title: 'Bill To:',
          showEmail: true,
          showPhone: true,
          showAddress: true,
          backgroundColor: '#f8f9fa',
          padding: 10,
        },
      },
      {
        id: 'items-block',
        type: 'items',
        position: { x: 20, y: 200 },
        size: { width: 270, height: 0 }, // Height is dynamic
        config: {
          columns: [
            { field: 'name', label: 'Description', width: 45 },
            { field: 'quantity', label: 'Qty', width: 15, align: 'center' },
            { field: 'unitPrice', label: 'Rate', width: 20, align: 'right' },
            { field: 'total', label: 'Amount', width: 20, align: 'right' },
          ],
          showDescriptions: true,
          alternateRowColors: true,
          headerBackgroundColor: '#2563eb',
          headerTextColor: '#ffffff',
          rowPadding: 8,
        },
      },
      {
        id: 'totals-block',
        type: 'totals',
        position: { x: 170, y: 0 }, // Y position is dynamic, set after items
        size: { width: 120, height: 60 },
        config: {
          alignment: 'right',
          showSubtotal: true,
          showTax: true,
          showTotal: true,
          totalBackgroundColor: '#2563eb',
          totalTextColor: '#ffffff',
          currencySymbol: '$',
          padding: 8,
        },
      },
      {
        id: 'notes-block',
        type: 'notes',
        position: { x: 20, y: 0 }, // Y position is dynamic
        size: { width: 140, height: 40 },
        config: {
          title: 'Notes:',
          placeholder: 'Thank you for your business!',
          fontSize: 10,
          showBorder: false,
        },
      },
      {
        id: 'footer-block',
        type: 'footer',
        position: { x: 20, y: 277 }, // Bottom of page
        size: { width: 270, height: 20 },
        config: {
          text: 'Questions? Contact us at support@company.com',
          alignment: 'center',
          fontSize: 9,
          textColor: '#6b7280',
          showBorder: true,
          borderColor: '#e5e7eb',
        },
      },
    ],
    styles: {
      primaryColor: '#2563eb',
      fontFamily: 'helvetica',
      fontSize: {
        header: 24,
        body: 11,
        small: 9,
      },
      spacing: {
        padding: 20,
        margin: 10,
      },
    },
  };
}

/**
 * Classic Template - Traditional, formal, professional
 */
function getClassicTemplateSchema(): TemplateSchema {
  return {
    layout: [
      {
        id: 'header-block',
        type: 'header',
        position: { x: 20, y: 20 },
        size: { width: 270, height: 60 },
        config: {
          alignment: 'center',
          showInvoiceNumber: true,
          showDates: true,
          dateFormat: 'MMMM dd, yyyy',
          titleText: 'INVOICE',
          titleSize: 36,
          showStatus: true,
          backgroundColor: '#1f2937',
          textColor: '#ffffff',
          padding: 15,
        },
      },
      {
        id: 'logo-block',
        type: 'logo',
        position: { x: 105, y: 90 },
        size: { width: 80, height: 80 },
        config: {
          alignment: 'center',
          showBorder: true,
          borderColor: '#d1d5db',
          placeholder: 'Company Logo',
        },
      },
      {
        id: 'customer-block',
        type: 'customer',
        position: { x: 20, y: 180 },
        size: { width: 130, height: 60 },
        config: {
          title: 'Billing Information',
          showEmail: true,
          showPhone: true,
          showAddress: true,
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          showBorder: true,
          padding: 12,
        },
      },
      {
        id: 'items-block',
        type: 'items',
        position: { x: 20, y: 250 },
        size: { width: 270, height: 0 },
        config: {
          columns: [
            { field: 'name', label: 'Item Description', width: 50 },
            { field: 'quantity', label: 'Quantity', width: 15, align: 'center' },
            { field: 'unitPrice', label: 'Unit Price', width: 17.5, align: 'right' },
            { field: 'total', label: 'Total', width: 17.5, align: 'right' },
          ],
          showDescriptions: true,
          alternateRowColors: false,
          headerBackgroundColor: '#1f2937',
          headerTextColor: '#ffffff',
          rowPadding: 10,
          showBorders: true,
          borderColor: '#d1d5db',
        },
      },
      {
        id: 'totals-block',
        type: 'totals',
        position: { x: 170, y: 0 },
        size: { width: 120, height: 70 },
        config: {
          alignment: 'right',
          showSubtotal: true,
          showTax: true,
          showTotal: true,
          totalBackgroundColor: '#1f2937',
          totalTextColor: '#ffffff',
          currencySymbol: '$',
          padding: 10,
          showBorder: true,
          borderColor: '#d1d5db',
        },
      },
      {
        id: 'notes-block',
        type: 'notes',
        position: { x: 20, y: 0 },
        size: { width: 140, height: 35 },
        config: {
          title: 'Payment Terms & Notes:',
          placeholder: 'Payment is due within 30 days. Thank you for your business.',
          fontSize: 10,
          showBorder: true,
          borderColor: '#d1d5db',
          padding: 8,
        },
      },
      {
        id: 'footer-block',
        type: 'footer',
        position: { x: 20, y: 277 },
        size: { width: 270, height: 20 },
        config: {
          text: 'This invoice is computer generated and is valid without signature.',
          alignment: 'center',
          fontSize: 8,
          textColor: '#6b7280',
          showBorder: false,
        },
      },
    ],
    styles: {
      primaryColor: '#1f2937',
      fontFamily: 'times',
      fontSize: {
        header: 22,
        body: 11,
        small: 9,
      },
      spacing: {
        padding: 20,
        margin: 12,
      },
    },
  };
}

/**
 * Minimal Template - Clean, simple, space-efficient
 */
function getMinimalTemplateSchema(): TemplateSchema {
  return {
    layout: [
      {
        id: 'logo-block',
        type: 'logo',
        position: { x: 20, y: 15 },
        size: { width: 60, height: 60 },
        config: {
          alignment: 'left',
          showBorder: false,
          placeholder: 'Logo',
        },
      },
      {
        id: 'header-block',
        type: 'header',
        position: { x: 90, y: 15 },
        size: { width: 200, height: 60 },
        config: {
          alignment: 'right',
          showInvoiceNumber: true,
          showDates: true,
          dateFormat: 'MM/dd/yyyy',
          titleText: 'Invoice',
          titleSize: 28,
          showStatus: false,
        },
      },
      {
        id: 'customer-block',
        type: 'customer',
        position: { x: 20, y: 85 },
        size: { width: 120, height: 50 },
        config: {
          title: 'To:',
          showEmail: true,
          showPhone: false,
          showAddress: true,
          backgroundColor: 'transparent',
          padding: 0,
        },
      },
      {
        id: 'items-block',
        type: 'items',
        position: { x: 20, y: 150 },
        size: { width: 270, height: 0 },
        config: {
          columns: [
            { field: 'name', label: 'Description', width: 50 },
            { field: 'quantity', label: 'Qty', width: 10, align: 'center' },
            { field: 'unitPrice', label: 'Price', width: 20, align: 'right' },
            { field: 'total', label: 'Total', width: 20, align: 'right' },
          ],
          showDescriptions: false,
          alternateRowColors: false,
          headerBackgroundColor: 'transparent',
          headerTextColor: '#000000',
          rowPadding: 6,
          showBorders: false,
          showHeaderBorder: true,
          headerBorderColor: '#000000',
        },
      },
      {
        id: 'totals-block',
        type: 'totals',
        position: { x: 190, y: 0 },
        size: { width: 100, height: 50 },
        config: {
          alignment: 'right',
          showSubtotal: false,
          showTax: true,
          showTotal: true,
          totalBackgroundColor: 'transparent',
          totalTextColor: '#000000',
          currencySymbol: '$',
          padding: 6,
          showBorder: false,
          showTotalBorder: true,
          totalBorderColor: '#000000',
        },
      },
      {
        id: 'notes-block',
        type: 'notes',
        position: { x: 20, y: 0 },
        size: { width: 160, height: 30 },
        config: {
          title: '',
          placeholder: 'Thank you!',
          fontSize: 10,
          showBorder: false,
          textColor: '#6b7280',
        },
      },
      {
        id: 'footer-block',
        type: 'footer',
        position: { x: 20, y: 282 },
        size: { width: 270, height: 15 },
        config: {
          text: 'info@company.com',
          alignment: 'center',
          fontSize: 9,
          textColor: '#9ca3af',
          showBorder: false,
        },
      },
    ],
    styles: {
      primaryColor: '#000000',
      fontFamily: 'helvetica',
      fontSize: {
        header: 20,
        body: 10,
        small: 8,
      },
      spacing: {
        padding: 15,
        margin: 8,
      },
    },
  };
}
