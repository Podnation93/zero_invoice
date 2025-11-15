import type { Customer } from './customer';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface LineItem {
  id: string;
  itemId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerSnapshot: Customer;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: InvoiceStatus;
  templateId: string;
  dueDate: string;
  issueDate: string;
  notes?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  customerId: string;
  lineItems: LineItem[];
  taxRate: number;
  dueDate: string;
  issueDate: string;
  notes: string;
  status: InvoiceStatus;
  templateId: string;
}
