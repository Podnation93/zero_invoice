import type { Invoice, LineItem } from '../types';
import type { Customer, Item } from '../types';
import type { ExtractedInvoice } from '../types/import';
import { geminiService } from './geminiService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Invoice Parser Service
 * Intelligently parses invoice text using AI (Gemini) with fallback to pattern matching
 */

interface ParsedInvoiceData {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  lineItems: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  total?: number;
  notes?: string;
}

export class InvoiceParserService {
  /**
   * Parses invoice text using AI or pattern matching
   */
  async parseInvoice(
    text: string,
    existingCustomers: Customer[],
    existingItems: Item[]
  ): Promise<ExtractedInvoice> {
    let parsedData: ParsedInvoiceData;
    let confidence = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Try AI parsing first if available
      if (geminiService.isConfigured()) {
        const aiResult = await this.parseWithAI(text);
        parsedData = aiResult.data;
        confidence = aiResult.confidence;
      } else {
        // Fallback to pattern matching
        parsedData = this.parseWithPatterns(text);
        confidence = 0.6; // Lower confidence for pattern matching
        warnings.push('AI parsing not available. Using pattern matching with lower accuracy.');
      }
    } catch (error) {
      console.error('AI parsing failed, falling back to pattern matching:', error);
      parsedData = this.parseWithPatterns(text);
      confidence = 0.5;
      warnings.push('AI parsing failed. Using pattern matching fallback.');
    }

    // Validate required fields
    if (!parsedData.invoiceNumber) {
      errors.push('Invoice number not found');
    }
    if (!parsedData.customerName) {
      errors.push('Customer name not found');
    }
    if (!parsedData.total) {
      errors.push('Total amount not found');
    }
    if (parsedData.lineItems.length === 0) {
      warnings.push('No line items found');
    }

    // Match customer
    const customerMatch = this.matchCustomer(parsedData, existingCustomers);

    // Match items
    const itemMatches = this.matchItems(parsedData.lineItems, existingItems);

    // Convert to partial Invoice object
    const extractedData = this.convertToInvoiceData(parsedData, customerMatch);

    return {
      rawText: text,
      extractedData,
      confidence,
      errors,
      warnings,
      customerMatch,
      itemMatches,
    };
  }

  /**
   * Parse invoice using Gemini AI
   */
  private async parseWithAI(text: string): Promise<{ data: ParsedInvoiceData; confidence: number }> {
    const prompt = `Analyze this invoice text and extract structured data. Return ONLY a valid JSON object with no additional text or markdown formatting.

Invoice Text:
${text}

Extract and return a JSON object with these fields:
{
  "invoiceNumber": "string or null",
  "issueDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "customerName": "string or null",
  "customerEmail": "string or null",
  "customerAddress": {
    "street": "string or null",
    "city": "string or null",
    "state": "string or null",
    "zipCode": "string or null",
    "country": "string or null"
  },
  "lineItems": [
    {
      "name": "string",
      "description": "string",
      "quantity": number,
      "unitPrice": number
    }
  ],
  "subtotal": number or null,
  "tax": number or null,
  "taxRate": number or null (as decimal, e.g., 0.08 for 8%),
  "total": number or null,
  "notes": "string or null"
}

Important:
- Extract dates in YYYY-MM-DD format
- Convert all amounts to numbers (no currency symbols)
- Tax rate should be decimal (e.g., 0.08 for 8%)
- Set fields to null if not found
- Ensure lineItems is an array (empty if none found)
- Return ONLY the JSON object, no markdown code blocks or extra text`;

    try {
      const response = await geminiService['makeRequest'](prompt, {
        temperature: 0.3, // Lower temperature for more consistent extraction
        maxOutputTokens: 2048,
      });

      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanedResponse);

      // Calculate confidence based on how many fields were extracted
      const fieldCount = Object.values(parsed).filter(
        (v) => v !== null && v !== undefined && v !== ''
      ).length;
      const totalFields = 10; // Approximate number of important fields
      const confidence = Math.min(0.95, 0.5 + (fieldCount / totalFields) * 0.5);

      return {
        data: parsed,
        confidence,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Parse invoice using regex patterns (fallback)
   */
  private parseWithPatterns(text: string): ParsedInvoiceData {
    const data: ParsedInvoiceData = {
      lineItems: [],
    };

    // Invoice number patterns
    const invoicePatterns = [
      /invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
      /inv\s*#?\s*:?\s*([A-Z0-9-]+)/i,
      /invoice\s+number\s*:?\s*([A-Z0-9-]+)/i,
      /#\s*([A-Z0-9-]+)/,
    ];

    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.invoiceNumber = match[1];
        break;
      }
    }

    // Date patterns
    const datePatterns = [
      /date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /issued?\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.issueDate = this.normalizeDate(match[1]);
        break;
      }
    }

    // Due date
    const duePatterns = [
      /due\s+date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      /payment\s+due\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    ];

    for (const pattern of duePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.dueDate = this.normalizeDate(match[1]);
        break;
      }
    }

    // Total amount patterns
    const totalPatterns = [
      /total\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
      /amount\s+due\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
      /balance\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.total = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Email pattern
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      data.customerEmail = emailMatch[1];
    }

    // Try to extract customer name (first capitalized line that's not a keyword)
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const skipKeywords = ['invoice', 'bill to', 'ship to', 'from', 'total', 'subtotal', 'date'];

    for (const line of lines) {
      if (
        line.length > 3 &&
        line.length < 100 &&
        /^[A-Z]/.test(line) &&
        !skipKeywords.some((kw) => line.toLowerCase().includes(kw)) &&
        !/^\d/.test(line) &&
        !line.includes('@')
      ) {
        data.customerName = line;
        break;
      }
    }

    // Try to extract line items (simple pattern: description followed by quantity and price)
    const itemPattern = /([A-Za-z\s]+)\s+(\d+)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)/g;
    let itemMatch;

    while ((itemMatch = itemPattern.exec(text)) !== null) {
      data.lineItems.push({
        name: itemMatch[1].trim(),
        description: itemMatch[1].trim(),
        quantity: parseInt(itemMatch[2]),
        unitPrice: parseFloat(itemMatch[3].replace(/,/g, '')),
      });
    }

    return data;
  }

  /**
   * Normalize date string to YYYY-MM-DD format
   */
  private normalizeDate(dateStr: string): string {
    try {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        let [a, b, c] = parts;

        // If year is 2 digits, convert to 4
        if (c.length === 2) {
          c = '20' + c;
        }
        if (a.length === 2 && a.length === b.length && c.length === 4) {
          // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US invoices
          return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
        }
        if (a.length === 4) {
          // YYYY-MM-DD
          return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
        }
      }

      // Try to parse with Date object
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      return new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Match extracted customer data with existing customers
   */
  private matchCustomer(
    parsedData: ParsedInvoiceData,
    existingCustomers: Customer[]
  ): ExtractedInvoice['customerMatch'] {
    if (!parsedData.customerName) {
      return {
        isNew: true,
        matchConfidence: 0,
      };
    }

    // Try exact name match first
    const exactMatch = existingCustomers.find(
      (c) => c.name.toLowerCase() === parsedData.customerName!.toLowerCase()
    );

    if (exactMatch) {
      return {
        existingCustomerId: exactMatch.id,
        isNew: false,
        matchConfidence: 1.0,
      };
    }

    // Try email match
    if (parsedData.customerEmail) {
      const emailMatch = existingCustomers.find(
        (c) => c.email.toLowerCase() === parsedData.customerEmail!.toLowerCase()
      );

      if (emailMatch) {
        return {
          existingCustomerId: emailMatch.id,
          isNew: false,
          matchConfidence: 0.95,
        };
      }
    }

    // Try fuzzy name match
    const nameLower = parsedData.customerName.toLowerCase();
    const fuzzyMatches = existingCustomers.filter((c) => {
      const customerNameLower = c.name.toLowerCase();
      return (
        customerNameLower.includes(nameLower) ||
        nameLower.includes(customerNameLower) ||
        this.calculateSimilarity(nameLower, customerNameLower) > 0.7
      );
    });

    if (fuzzyMatches.length === 1) {
      return {
        existingCustomerId: fuzzyMatches[0].id,
        isNew: false,
        matchConfidence: 0.7,
      };
    }

    // No match found
    return {
      isNew: true,
      matchConfidence: 0,
    };
  }

  /**
   * Match extracted line items with existing catalog items
   */
  private matchItems(
    lineItems: ParsedInvoiceData['lineItems'],
    existingItems: Item[]
  ): ExtractedInvoice['itemMatches'] {
    const matches: ExtractedInvoice['itemMatches'] = {};

    for (const lineItem of lineItems) {
      const nameLower = lineItem.name.toLowerCase();

      // Exact name match
      const exactMatch = existingItems.find(
        (item) => item.name.toLowerCase() === nameLower
      );

      if (exactMatch) {
        matches[lineItem.name] = {
          existingItemId: exactMatch.id,
          isNew: false,
          matchConfidence: 1.0,
        };
        continue;
      }

      // Fuzzy match
      const fuzzyMatches = existingItems.filter((item) => {
        const itemNameLower = item.name.toLowerCase();
        return (
          itemNameLower.includes(nameLower) ||
          nameLower.includes(itemNameLower) ||
          this.calculateSimilarity(nameLower, itemNameLower) > 0.7
        );
      });

      if (fuzzyMatches.length === 1) {
        matches[lineItem.name] = {
          existingItemId: fuzzyMatches[0].id,
          isNew: false,
          matchConfidence: 0.7,
        };
        continue;
      }

      // No match - mark as new
      matches[lineItem.name] = {
        isNew: true,
        matchConfidence: 0,
      };
    }

    return matches;
  }

  /**
   * Calculate similarity between two strings (simple Levenshtein-like)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between two strings
   */
  private getEditDistance(str1: string, str2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= str1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[str2.length] = lastValue;
      }
    }
    return costs[str2.length];
  }

  /**
   * Convert parsed data to partial Invoice object
   */
  private convertToInvoiceData(
    parsedData: ParsedInvoiceData,
    _customerMatch: ExtractedInvoice['customerMatch']
  ): Partial<Invoice> {
    const now = new Date().toISOString();

    // Create line items
    const lineItems: LineItem[] = parsedData.lineItems.map((item) => ({
      id: uuidv4(),
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    // Calculate totals if not provided
    const calculatedSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const subtotal = parsedData.subtotal || calculatedSubtotal;
    const tax = parsedData.tax || 0;
    const total = parsedData.total || subtotal + tax;
    const taxRate = parsedData.taxRate || (subtotal > 0 ? tax / subtotal : 0);

    return {
      invoiceNumber: parsedData.invoiceNumber || `INV-${Date.now()}`,
      issueDate: parsedData.issueDate || now.split('T')[0],
      dueDate: parsedData.dueDate || now.split('T')[0],
      lineItems,
      subtotal,
      tax,
      taxRate,
      total,
      notes: parsedData.notes,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
  }
}

// Export singleton instance
export const invoiceParserService = new InvoiceParserService();
