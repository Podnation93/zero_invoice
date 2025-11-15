import jsPDF from 'jspdf';
import type { Invoice, Template, LayoutBlock } from '../types';
import { format } from 'date-fns';

/**
 * PDF Generation Service for Zero Invoice
 * Generates professional PDF invoices based on customizable templates
 */

interface PDFRenderContext {
  doc: jsPDF;
  invoice: Invoice;
  template: Template;
  currentY: number;
  pageWidth: number;
  pageHeight: number;
}

/**
 * Generates a PDF invoice and returns it as a Blob
 * @param invoice - The invoice data to render
 * @param template - The template schema to use for layout
 * @returns Promise resolving to a PDF Blob
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  template: Template
): Promise<Blob> {
  try {
    // Initialize jsPDF with A4 dimensions
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const context: PDFRenderContext = {
      doc,
      invoice,
      template,
      currentY: 0,
      pageWidth,
      pageHeight,
    };

    // Set default font
    const fontFamily = template.schemaJSON.styles.fontFamily;
    doc.setFont(fontFamily);

    // Render all layout blocks in order
    await renderLayoutBlocks(context);

    // Convert to Blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Renders all layout blocks from the template
 */
async function renderLayoutBlocks(context: PDFRenderContext): Promise<void> {
  const { template } = context;
  const blocks = [...template.schemaJSON.layout];

  // Sort blocks by Y position for proper rendering order
  blocks.sort((a, b) => a.position.y - b.position.y);

  let lastItemsBlockY = 0;
  let itemsBlockHeight = 0;

  for (const block of blocks) {
    // Handle dynamic Y positioning for blocks after items
    if (block.type === 'items') {
      const height = await renderBlock(context, block);
      lastItemsBlockY = block.position.y;
      itemsBlockHeight = height;
    } else if (block.position.y === 0 && block.type !== 'logo' && block.type !== 'header') {
      // Dynamic positioning for totals and notes
      const adjustedBlock = {
        ...block,
        position: {
          ...block.position,
          y: lastItemsBlockY + itemsBlockHeight + 10,
        },
      };
      await renderBlock(context, adjustedBlock);
    } else {
      await renderBlock(context, block);
    }
  }
}

/**
 * Renders a single layout block based on its type
 * @returns The height of the rendered block
 */
async function renderBlock(
  context: PDFRenderContext,
  block: LayoutBlock
): Promise<number> {
  const { doc: _doc } = context;

  switch (block.type) {
    case 'logo':
      return renderLogoBlock(context, block);
    case 'header':
      return renderHeaderBlock(context, block);
    case 'customer':
      return renderCustomerBlock(context, block);
    case 'items':
      return renderItemsBlock(context, block);
    case 'totals':
      return renderTotalsBlock(context, block);
    case 'notes':
      return renderNotesBlock(context, block);
    case 'footer':
      return renderFooterBlock(context, block);
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return 0;
  }
}

/**
 * Renders the logo block
 */
function renderLogoBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc } = context;
  const { position, size, config } = block;

  // Draw placeholder for logo
  if (config.showBorder) {
    doc.setDrawColor(config.borderColor || '#d1d5db');
    doc.setLineWidth(0.5);
    doc.rect(position.x, position.y, size.width, size.height);
  }

  // Add placeholder text
  doc.setFontSize(10);
  doc.setTextColor('#9ca3af');
  const text = config.placeholder || 'Logo';
  const textWidth = doc.getTextWidth(text);
  const textX = position.x + (size.width - textWidth) / 2;
  const textY = position.y + size.height / 2;
  doc.text(text, textX, textY);

  return size.height;
}

/**
 * Renders the header block with invoice number and dates
 */
function renderHeaderBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, invoice, template } = context;
  const { position, size, config } = block;

  let currentY = position.y;

  // Background color if specified
  if (config.backgroundColor) {
    doc.setFillColor(config.backgroundColor);
    doc.rect(position.x, position.y, size.width, size.height, 'F');
  }

  // Set text color
  doc.setTextColor(config.textColor || '#000000');

  // Title
  doc.setFontSize(config.titleSize || 32);
  doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
  const title = config.titleText || 'INVOICE';

  if (config.alignment === 'center') {
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, position.x + (size.width - titleWidth) / 2, currentY + 15);
  } else if (config.alignment === 'right') {
    doc.text(title, position.x + size.width, currentY + 15, { align: 'right' });
  } else {
    doc.text(title, position.x, currentY + 15);
  }

  currentY += 20;

  // Invoice details
  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');
  doc.setFontSize(template.schemaJSON.styles.fontSize.body);

  if (config.showInvoiceNumber) {
    const invText = `Invoice #${invoice.invoiceNumber}`;
    if (config.alignment === 'right') {
      doc.text(invText, position.x + size.width, currentY, { align: 'right' });
    } else if (config.alignment === 'center') {
      const invWidth = doc.getTextWidth(invText);
      doc.text(invText, position.x + (size.width - invWidth) / 2, currentY);
    } else {
      doc.text(invText, position.x, currentY);
    }
    currentY += 6;
  }

  if (config.showDates) {
    const dateFormat = config.dateFormat || 'MMM dd, yyyy';
    const issueText = `Issue Date: ${format(new Date(invoice.issueDate), dateFormat)}`;
    const dueText = `Due Date: ${format(new Date(invoice.dueDate), dateFormat)}`;

    if (config.alignment === 'right') {
      doc.text(issueText, position.x + size.width, currentY, { align: 'right' });
      currentY += 5;
      doc.text(dueText, position.x + size.width, currentY, { align: 'right' });
    } else if (config.alignment === 'center') {
      const issueWidth = doc.getTextWidth(issueText);
      doc.text(issueText, position.x + (size.width - issueWidth) / 2, currentY);
      currentY += 5;
      const dueWidth = doc.getTextWidth(dueText);
      doc.text(dueText, position.x + (size.width - dueWidth) / 2, currentY);
    } else {
      doc.text(issueText, position.x, currentY);
      currentY += 5;
      doc.text(dueText, position.x, currentY);
    }
    currentY += 5;
  }

  if (config.showStatus) {
    const statusText = `Status: ${invoice.status.toUpperCase()}`;
    doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');

    if (config.alignment === 'right') {
      doc.text(statusText, position.x + size.width, currentY, { align: 'right' });
    } else if (config.alignment === 'center') {
      const statusWidth = doc.getTextWidth(statusText);
      doc.text(statusText, position.x + (size.width - statusWidth) / 2, currentY);
    } else {
      doc.text(statusText, position.x, currentY);
    }
  }

  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');
  doc.setTextColor('#000000');

  return size.height;
}

/**
 * Renders the customer information block
 */
function renderCustomerBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, invoice, template } = context;
  const { position, size, config } = block;
  const customer = invoice.customerSnapshot;

  let currentY = position.y;

  // Background
  if (config.backgroundColor && config.backgroundColor !== 'transparent') {
    doc.setFillColor(config.backgroundColor);
    doc.rect(position.x, position.y, size.width, size.height, 'F');
  }

  // Border
  if (config.showBorder) {
    doc.setDrawColor(config.borderColor || '#d1d5db');
    doc.setLineWidth(0.5);
    doc.rect(position.x, position.y, size.width, size.height);
  }

  const padding = config.padding || 0;
  currentY += padding + 5;

  doc.setTextColor('#000000');
  doc.setFontSize(template.schemaJSON.styles.fontSize.body);

  // Title
  if (config.title) {
    doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
    doc.text(config.title, position.x + padding, currentY);
    currentY += 6;
  }

  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  // Customer name
  doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
  doc.text(customer.name, position.x + padding, currentY);
  currentY += 5;
  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  // Email
  if (config.showEmail && customer.email) {
    doc.text(customer.email, position.x + padding, currentY);
    currentY += 5;
  }

  // Phone
  if (config.showPhone && customer.phone) {
    doc.text(customer.phone, position.x + padding, currentY);
    currentY += 5;
  }

  // Address
  if (config.showAddress) {
    const { street, city, state, zipCode, country } = customer.billingAddress;
    doc.text(street, position.x + padding, currentY);
    currentY += 5;
    doc.text(`${city}, ${state} ${zipCode}`, position.x + padding, currentY);
    currentY += 5;
    doc.text(country, position.x + padding, currentY);
  }

  return size.height;
}

/**
 * Renders the line items table
 */
function renderItemsBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, invoice, template } = context;
  const { position, size, config } = block;
  const items = invoice.lineItems;

  let currentY = position.y;
  const tableWidth = size.width;
  const rowHeight = config.rowPadding || 8;

  // Calculate column widths
  const columns = config.columns || [];
  const colWidths = columns.map((col: any) => (tableWidth * col.width) / 100);

  // Header row
  doc.setFillColor(config.headerBackgroundColor || '#000000');
  doc.rect(position.x, currentY, tableWidth, rowHeight, 'F');

  doc.setTextColor(config.headerTextColor || '#ffffff');
  doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
  doc.setFontSize(template.schemaJSON.styles.fontSize.body);

  let currentX = position.x;
  columns.forEach((col: any, index: number) => {
    const text = col.label;
    const colWidth = colWidths[index];

    if (col.align === 'right') {
      doc.text(text, currentX + colWidth - 2, currentY + rowHeight - 2, { align: 'right' });
    } else if (col.align === 'center') {
      doc.text(text, currentX + colWidth / 2, currentY + rowHeight - 2, { align: 'center' });
    } else {
      doc.text(text, currentX + 2, currentY + rowHeight - 2);
    }

    currentX += colWidth;
  });

  currentY += rowHeight;

  // Data rows
  doc.setTextColor('#000000');
  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  items.forEach((item, rowIndex) => {
    // Alternate row colors
    if (config.alternateRowColors && rowIndex % 2 === 1) {
      doc.setFillColor('#f9fafb');
      doc.rect(position.x, currentY, tableWidth, rowHeight, 'F');
    }

    // Row borders
    if (config.showBorders) {
      doc.setDrawColor(config.borderColor || '#e5e7eb');
      doc.setLineWidth(0.1);
      doc.line(position.x, currentY + rowHeight, position.x + tableWidth, currentY + rowHeight);
    }

    currentX = position.x;
    columns.forEach((col: any, colIndex: number) => {
      const colWidth = colWidths[colIndex];
      let value = '';

      switch (col.field) {
        case 'name':
          value = item.name;
          break;
        case 'quantity':
          value = item.quantity.toString();
          break;
        case 'unitPrice':
          value = formatCurrency(item.unitPrice, config.currencySymbol || '$');
          break;
        case 'total':
          value = formatCurrency(item.total, config.currencySymbol || '$');
          break;
      }

      if (col.align === 'right') {
        doc.text(value, currentX + colWidth - 2, currentY + rowHeight - 2, { align: 'right' });
      } else if (col.align === 'center') {
        doc.text(value, currentX + colWidth / 2, currentY + rowHeight - 2, { align: 'center' });
      } else {
        doc.text(value, currentX + 2, currentY + rowHeight - 2);
      }

      currentX += colWidth;
    });

    currentY += rowHeight;

    // Show description if enabled
    if (config.showDescriptions && item.description) {
      doc.setFontSize(template.schemaJSON.styles.fontSize.small);
      doc.setTextColor('#6b7280');
      doc.text(item.description, position.x + 2, currentY + 3);
      currentY += 5;
      doc.setFontSize(template.schemaJSON.styles.fontSize.body);
      doc.setTextColor('#000000');
    }
  });

  // Border around header if specified
  if (config.showHeaderBorder) {
    doc.setDrawColor(config.headerBorderColor || '#000000');
    doc.setLineWidth(0.5);
    doc.line(position.x, position.y + rowHeight, position.x + tableWidth, position.y + rowHeight);
  }

  const totalHeight = currentY - position.y;
  return totalHeight;
}

/**
 * Renders the totals block
 */
function renderTotalsBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, invoice, template } = context;
  const { position, size, config } = block;

  let currentY = position.y;
  const padding = config.padding || 6;
  const lineHeight = 6;

  // Border
  if (config.showBorder) {
    doc.setDrawColor(config.borderColor || '#d1d5db');
    doc.setLineWidth(0.5);
    doc.rect(position.x, position.y, size.width, size.height);
  }

  currentY += padding;

  doc.setFontSize(template.schemaJSON.styles.fontSize.body);
  doc.setTextColor('#000000');

  const currencySymbol = config.currencySymbol || '$';

  // Subtotal
  if (config.showSubtotal) {
    doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');
    doc.text('Subtotal:', position.x + padding, currentY);
    doc.text(
      formatCurrency(invoice.subtotal, currencySymbol),
      position.x + size.width - padding,
      currentY,
      { align: 'right' }
    );
    currentY += lineHeight;
  }

  // Tax
  if (config.showTax) {
    doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');
    doc.text(`Tax (${invoice.taxRate}%):`, position.x + padding, currentY);
    doc.text(
      formatCurrency(invoice.tax, currencySymbol),
      position.x + size.width - padding,
      currentY,
      { align: 'right' }
    );
    currentY += lineHeight;
  }

  // Total
  if (config.showTotal) {
    currentY += 2;

    // Total background
    if (config.totalBackgroundColor && config.totalBackgroundColor !== 'transparent') {
      doc.setFillColor(config.totalBackgroundColor);
      doc.rect(position.x, currentY - 4, size.width, lineHeight + 2, 'F');
    }

    // Total border
    if (config.showTotalBorder) {
      doc.setDrawColor(config.totalBorderColor || '#000000');
      doc.setLineWidth(0.8);
      doc.line(position.x + padding, currentY - 2, position.x + size.width - padding, currentY - 2);
    }

    doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
    doc.setFontSize(template.schemaJSON.styles.fontSize.body + 1);
    doc.setTextColor(config.totalTextColor || '#000000');

    doc.text('Total:', position.x + padding, currentY);
    doc.text(
      formatCurrency(invoice.total, currencySymbol),
      position.x + size.width - padding,
      currentY,
      { align: 'right' }
    );
  }

  doc.setTextColor('#000000');
  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  return size.height;
}

/**
 * Renders the notes block
 */
function renderNotesBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, invoice, template } = context;
  const { position, size, config } = block;

  let currentY = position.y;
  const padding = config.padding || 0;

  // Border
  if (config.showBorder) {
    doc.setDrawColor(config.borderColor || '#d1d5db');
    doc.setLineWidth(0.5);
    doc.rect(position.x, position.y, size.width, size.height);
  }

  currentY += padding + 5;

  doc.setFontSize(config.fontSize || template.schemaJSON.styles.fontSize.body);
  doc.setTextColor(config.textColor || '#000000');

  // Title
  if (config.title) {
    doc.setFont(template.schemaJSON.styles.fontFamily, 'bold');
    doc.text(config.title, position.x + padding, currentY);
    currentY += 6;
  }

  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  // Notes text
  const notes = invoice.notes || config.placeholder || '';
  if (notes) {
    const lines = doc.splitTextToSize(notes, size.width - (padding * 2));
    doc.text(lines, position.x + padding, currentY);
  }

  doc.setTextColor('#000000');

  return size.height;
}

/**
 * Renders the footer block
 */
function renderFooterBlock(context: PDFRenderContext, block: LayoutBlock): number {
  const { doc, template } = context;
  const { position, size, config } = block;

  // Border
  if (config.showBorder) {
    doc.setDrawColor(config.borderColor || '#e5e7eb');
    doc.setLineWidth(0.5);
    doc.line(position.x, position.y, position.x + size.width, position.y);
  }

  doc.setFontSize(config.fontSize || template.schemaJSON.styles.fontSize.small);
  doc.setTextColor(config.textColor || '#6b7280');
  doc.setFont(template.schemaJSON.styles.fontFamily, 'normal');

  const text = config.text || '';
  const textY = position.y + 8;

  if (config.alignment === 'center') {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, position.x + (size.width - textWidth) / 2, textY);
  } else if (config.alignment === 'right') {
    doc.text(text, position.x + size.width, textY, { align: 'right' });
  } else {
    doc.text(text, position.x, textY);
  }

  doc.setTextColor('#000000');

  return size.height;
}

/**
 * Formats a number as currency
 */
function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Downloads the PDF file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens the PDF in a new window/tab for preview
 */
export function previewPDF(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Note: URL will be revoked when the window is closed
  setTimeout(() => URL.revokeObjectURL(url), 60000); // Clean up after 1 minute
}
