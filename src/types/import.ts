import type { Invoice } from './invoice';

/**
 * Represents extracted invoice data from a PDF with metadata
 */
export interface ExtractedInvoice {
  rawText: string;
  extractedData: Partial<Invoice>;
  confidence: number;
  errors: string[];
  warnings: string[];
  customerMatch?: {
    existingCustomerId?: string;
    isNew: boolean;
    matchConfidence: number;
  };
  itemMatches?: {
    [itemName: string]: {
      existingItemId?: string;
      isNew: boolean;
      matchConfidence: number;
    };
  };
}

/**
 * Status of a single file import
 */
export type ImportStatus = 'pending' | 'processing' | 'success' | 'failed' | 'ready';

/**
 * Result of processing a single PDF file
 */
export interface ImportResult {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportStatus;
  extractedInvoice?: ExtractedInvoice;
  error?: string;
  progress: number;
  file: File;
}

/**
 * Statistics for bulk import operation
 */
export interface ImportStats {
  total: number;
  pending: number;
  processing: number;
  ready: number;
  success: number;
  failed: number;
}

/**
 * Options for PDF extraction
 */
export interface ExtractionOptions {
  useAI: boolean;
  autoMatchCustomers: boolean;
  autoMatchItems: boolean;
  createNewCustomers: boolean;
  createNewItems: boolean;
}
