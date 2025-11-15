import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Handle invalid numbers
  if (!isFinite(amount)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl fails
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Formats a date string or Date object
 * @param date - The date to format (string or Date)
 * @param formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    // Check if date is valid
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }

    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Formats a number as an invoice number
 * @param number - The invoice number
 * @returns Formatted invoice number string
 */
export function formatInvoiceNumber(number: number): string {
  // Handle invalid numbers
  if (!isFinite(number) || number < 0) {
    return 'INV-000001';
  }
  return `INV-${String(Math.floor(number)).padStart(6, '0')}`;
}

/**
 * Generates a unique invoice number based on existing invoices
 * @param existingInvoices - Array of existing invoices
 * @returns Next available invoice number
 */
export function generateInvoiceNumber(existingInvoices: any[]): string {
  // Handle empty array
  if (!existingInvoices || existingInvoices.length === 0) {
    return formatInvoiceNumber(1);
  }

  // Find highest invoice number
  const highestNumber = existingInvoices.reduce((max, invoice) => {
    if (invoice.invoiceNumber) {
      const match = invoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
    }
    return max;
  }, 0);

  return formatInvoiceNumber(highestNumber + 1);
}

/**
 * Formats a phone number to US format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (maxLength <= 0) return text;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Sanitizes text to prevent XSS attacks
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
