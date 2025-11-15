import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * PDF Extractor Service
 * Handles extraction of text content from PDF files using PDF.js
 */

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
  };
}

export class PDFExtractorService {
  /**
   * Extracts text from a PDF file
   * @param file - The PDF file to extract text from
   * @param onProgress - Optional callback for progress updates (0-100)
   * @returns Promise resolving to extracted text and metadata
   */
  async extractText(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<PDFExtractionResult> {
    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Extract metadata
      const metadata = await this.extractMetadata(pdf);

      // Extract text from all pages
      const pageCount = pdf.numPages;
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item) => {
            if ('str' in item) {
              return (item as TextItem).str;
            }
            return '';
          })
          .join(' ');

        textParts.push(pageText);

        // Report progress
        if (onProgress) {
          const progress = Math.round((pageNum / pageCount) * 100);
          onProgress(progress);
        }
      }

      return {
        text: textParts.join('\n\n'),
        pageCount,
        metadata,
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extracts metadata from a PDF document
   */
  private async extractMetadata(pdf: any): Promise<PDFExtractionResult['metadata']> {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info;

      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
      };
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error);
      return {};
    }
  }

  /**
   * Extracts text from multiple PDF files in parallel
   * @param files - Array of PDF files to process
   * @param onFileProgress - Callback for individual file progress
   * @param maxConcurrent - Maximum number of concurrent extractions
   * @returns Promise resolving to array of extraction results
   */
  async extractTextFromMultiple(
    files: File[],
    onFileProgress?: (fileName: string, progress: number) => void,
    maxConcurrent: number = 3
  ): Promise<Map<string, PDFExtractionResult>> {
    const results = new Map<string, PDFExtractionResult>();
    const errors = new Map<string, Error>();

    // Process files in batches
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (file) => {
        try {
          const result = await this.extractText(file, (progress) => {
            if (onFileProgress) {
              onFileProgress(file.name, progress);
            }
          });

          results.set(file.name, result);
        } catch (error) {
          errors.set(file.name, error as Error);
          console.error(`Failed to extract text from ${file.name}:`, error);
        }
      });

      await Promise.all(batchPromises);
    }

    if (errors.size > 0) {
      console.warn(`${errors.size} file(s) failed to process:`, Array.from(errors.keys()));
    }

    return results;
  }

  /**
   * Validates if a file is a valid PDF
   * @param file - File to validate
   * @returns true if file appears to be a PDF
   */
  async validatePDF(file: File): Promise<boolean> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Check PDF magic number (header)
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...Array.from(uint8Array.slice(0, 5)));

      return header === '%PDF-';
    } catch {
      return false;
    }
  }

  /**
   * Checks if multiple files are valid PDFs
   * @param files - Files to validate
   * @returns Map of filename to validation result
   */
  async validateMultiplePDFs(files: File[]): Promise<Map<string, boolean>> {
    const validationResults = new Map<string, boolean>();

    const promises = files.map(async (file) => {
      const isValid = await this.validatePDF(file);
      validationResults.set(file.name, isValid);
    });

    await Promise.all(promises);
    return validationResults;
  }
}

// Export singleton instance
export const pdfExtractorService = new PDFExtractorService();
