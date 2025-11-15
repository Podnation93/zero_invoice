import type { LineItem, Invoice } from '../types';

/**
 * Calculates the total for a single line item
 * @param quantity - The quantity of items
 * @param unitPrice - The price per unit
 * @returns The calculated total with 2 decimal places
 */
export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  // Handle edge cases
  if (!isFinite(quantity) || !isFinite(unitPrice) || quantity < 0 || unitPrice < 0) {
    return 0;
  }
  return Number((quantity * unitPrice).toFixed(2));
}

/**
 * Calculates the subtotal from an array of line items
 * @param lineItems - Array of line items
 * @returns The subtotal with 2 decimal places
 */
export function calculateSubtotal(lineItems: LineItem[]): number {
  // Handle empty array
  if (!lineItems || lineItems.length === 0) {
    return 0;
  }

  const sum = lineItems.reduce((acc, item) => {
    const itemTotal = isFinite(item.total) ? item.total : 0;
    return acc + itemTotal;
  }, 0);

  return Number(sum.toFixed(2));
}

/**
 * Calculates tax amount based on subtotal and tax rate
 * @param subtotal - The subtotal amount
 * @param taxRate - The tax rate as a percentage (0-100)
 * @returns The tax amount with 2 decimal places
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  // Handle edge cases
  if (!isFinite(subtotal) || !isFinite(taxRate) || subtotal < 0 || taxRate < 0) {
    return 0;
  }
  return Number((subtotal * (taxRate / 100)).toFixed(2));
}

/**
 * Calculates the final total (subtotal + tax)
 * @param subtotal - The subtotal amount
 * @param tax - The tax amount
 * @returns The total with 2 decimal places
 */
export function calculateTotal(subtotal: number, tax: number): number {
  // Handle edge cases
  if (!isFinite(subtotal) || !isFinite(tax)) {
    return 0;
  }
  return Number((subtotal + tax).toFixed(2));
}

/**
 * Calculates all invoice totals (subtotal, tax, total)
 * @param lineItems - Array of line items
 * @param taxRate - The tax rate as a percentage (0-100)
 * @returns Object containing subtotal, tax, and total
 */
export function calculateInvoiceTotals(
  lineItems: LineItem[],
  taxRate: number
): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = calculateSubtotal(lineItems);
  const tax = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, tax);

  return { subtotal, tax, total };
}

/**
 * Calculates total revenue from paid invoices for a customer
 * @param invoices - Array of customer invoices
 * @returns The total revenue with 2 decimal places
 */
export function calculateCustomerTotalRevenue(invoices: Invoice[]): number {
  if (!invoices || invoices.length === 0) {
    return 0;
  }

  const total = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => {
      const invTotal = isFinite(inv.total) ? inv.total : 0;
      return sum + invTotal;
    }, 0);

  return Number(total.toFixed(2));
}

/**
 * Calculates the average invoice amount
 * @param invoices - Array of invoices
 * @returns The average amount with 2 decimal places
 */
export function calculateAverageInvoiceAmount(invoices: Invoice[]): number {
  // Handle empty array (division by zero)
  if (!invoices || invoices.length === 0) {
    return 0;
  }

  const total = invoices.reduce((sum, inv) => {
    const invTotal = isFinite(inv.total) ? inv.total : 0;
    return sum + invTotal;
  }, 0);

  return Number((total / invoices.length).toFixed(2));
}
