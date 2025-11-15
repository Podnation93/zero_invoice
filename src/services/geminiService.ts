import type { Invoice, Customer, LayoutBlock } from '../types';
import { format } from 'date-fns';

/**
 * Google Gemini AI Service for Zero Invoice
 * Provides AI-powered features including email drafting, customer insights, and template suggestions
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    safetyRatings: any[];
  }[];
  promptFeedback?: {
    safetyRatings: any[];
  };
}

/**
 * Rate limiting queue to prevent API throttling
 */
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval = 1000; // Minimum 1 second between requests

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Rate limiting: wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
    }

    const request = this.queue.shift();
    if (request) {
      this.lastRequestTime = Date.now();
      await request();
    }

    this.processQueue();
  }
}

const requestQueue = new RequestQueue();

/**
 * GeminiService class - Handles all AI-powered features
 */
export class GeminiService {
  private apiKey: string | null;

  constructor() {
    // Read API key from environment variable
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  }

  /**
   * Checks if the service is configured with a valid API key
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Makes a request to the Gemini API with rate limiting
   */
  private async makeRequest(prompt: string, config?: Partial<GeminiRequest['generationConfig']>): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    return requestQueue.enqueue(async () => {
      try {
        const requestBody: GeminiRequest = {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            ...config,
          },
        };

        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Gemini API request failed: ${response.status} ${response.statusText}. ${
              errorData.error?.message || ''
            }`
          );
        }

        const data: GeminiResponse = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response generated from Gemini API');
        }

        const candidate = data.candidates[0];
        if (candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
          throw new Error(`Response generation stopped unexpectedly: ${candidate.finishReason}`);
        }

        return candidate.content.parts[0].text;
      } catch (error) {
        console.error('Gemini API error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred while calling Gemini API');
      }
    });
  }

  /**
   * Generates a professional email draft for sending an invoice
   * @param invoice - The invoice to create an email for
   * @returns Promise resolving to the email draft text
   */
  async generateEmailDraft(invoice: Invoice): Promise<string> {
    const prompt = `Generate a professional email to send an invoice to a customer.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Customer Name: ${invoice.customerSnapshot.name}
- Total Amount: $${invoice.total.toFixed(2)}
- Due Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
- Status: ${invoice.status}

Requirements:
- Keep it professional and friendly
- Include a clear subject line marked with "Subject:"
- Mention the invoice number and total amount
- Include the due date
- Thank them for their business
- Keep it concise (3-4 paragraphs maximum)
- Don't include sender signature or contact details (those will be added separately)

Format the response with "Subject:" followed by the subject line, then a blank line, then the email body.`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.8,
        maxOutputTokens: 512,
      });

      return response.trim();
    } catch (error) {
      console.error('Error generating email draft:', error);
      // Return a fallback template if API fails
      return this.getFallbackEmailDraft(invoice);
    }
  }

  /**
   * Generates customer insights based on their invoice history
   * @param customer - The customer to analyze
   * @param invoices - Array of invoices for this customer
   * @returns Promise resolving to customer insights text
   */
  async generateCustomerInsights(customer: Customer, invoices: Invoice[]): Promise<string> {
    if (invoices.length === 0) {
      return 'No invoice history available for this customer yet.';
    }

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const avgInvoiceAmount = totalRevenue / invoices.length;

    const invoiceSummary = invoices
      .slice(0, 5)
      .map(
        inv =>
          `- Invoice ${inv.invoiceNumber}: $${inv.total.toFixed(2)}, Status: ${inv.status}, Date: ${format(
            new Date(inv.issueDate),
            'MMM dd, yyyy'
          )}`
      )
      .join('\n');

    const prompt = `Analyze this customer's invoice history and provide actionable business insights.

Customer Information:
- Name: ${customer.name}
- Email: ${customer.email}
- Total Invoices: ${invoices.length}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Paid Invoices: ${paidInvoices.length}
- Overdue Invoices: ${overdueInvoices.length}
- Average Invoice Amount: $${avgInvoiceAmount.toFixed(2)}

Recent Invoices:
${invoiceSummary}

Please provide:
1. Payment reliability assessment
2. Revenue trend analysis
3. Risk assessment (if any overdue invoices)
4. Recommendations for account management
5. Opportunities for upselling or engagement

Keep the insights concise and actionable. Use bullet points for clarity.`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 800,
      });

      return response.trim();
    } catch (error) {
      console.error('Error generating customer insights:', error);
      return this.getFallbackCustomerInsights(customer, invoices);
    }
  }

  /**
   * Suggests improvements to the current template layout
   * @param currentLayout - The current layout blocks
   * @returns Promise resolving to suggested layout blocks
   */
  async suggestTemplateLayout(currentLayout: LayoutBlock[]): Promise<LayoutBlock[]> {
    const layoutDescription = currentLayout
      .map(
        block =>
          `- ${block.type}: position(${block.position.x}, ${block.position.y}), size(${block.size.width}x${block.size.height})`
      )
      .join('\n');

    const prompt = `As a professional invoice designer, analyze this invoice template layout and suggest improvements.

Current Layout:
${layoutDescription}

Available block types: logo, header, customer, items, totals, notes, footer
Page size: 210mm x 297mm (A4)

Please suggest 3 specific improvements focusing on:
1. Visual hierarchy and readability
2. Professional appearance
3. Optimal use of space
4. Better positioning of critical elements (totals, due date, etc.)

For each suggestion, explain:
- What to change
- Why it improves the design
- Specific positioning recommendations

Keep suggestions practical and implementation-ready.`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.8,
        maxOutputTokens: 1024,
      });

      // Note: This returns text suggestions, not actual modified layout blocks
      // In a real implementation, you might want to parse the suggestions
      // and apply them programmatically, but for now we return the original
      // layout with the suggestions as a separate output
      console.log('Layout suggestions:', response);

      // For now, return the original layout unchanged
      // In a production app, you'd want to either:
      // 1. Parse the AI suggestions and modify the layout
      // 2. Present the suggestions to the user for manual application
      return currentLayout;
    } catch (error) {
      console.error('Error suggesting template layout:', error);
      throw new Error('Failed to generate layout suggestions. Please try again later.');
    }
  }

  /**
   * Generates a summary of an invoice for quick insights
   * @param invoice - The invoice to summarize
   * @returns Promise resolving to a brief summary
   */
  async generateInvoiceSummary(invoice: Invoice): Promise<string> {
    const itemCount = invoice.lineItems.length;
    const itemsSummary = invoice.lineItems
      .map(item => `${item.name} (${item.quantity}x $${item.unitPrice.toFixed(2)})`)
      .join(', ');

    const prompt = `Create a concise 2-sentence summary of this invoice for quick reference.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Customer: ${invoice.customerSnapshot.name}
- Items (${itemCount}): ${itemsSummary}
- Total: $${invoice.total.toFixed(2)}
- Status: ${invoice.status}
- Due Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}

Create a brief, informative summary that captures the key points.`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 150,
      });

      return response.trim();
    } catch (error) {
      console.error('Error generating invoice summary:', error);
      return `Invoice ${invoice.invoiceNumber} for ${invoice.customerSnapshot.name}: ${itemCount} item(s) totaling $${invoice.total.toFixed(2)}, ${invoice.status}, due ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}.`;
    }
  }

  /**
   * Fallback email draft when API is unavailable
   */
  private getFallbackEmailDraft(invoice: Invoice): string {
    return `Subject: Invoice ${invoice.invoiceNumber} - Payment Due ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}

Dear ${invoice.customerSnapshot.name},

I hope this message finds you well. Please find attached invoice ${invoice.invoiceNumber} for the amount of $${invoice.total.toFixed(2)}.

Payment is due by ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}. If you have any questions regarding this invoice, please don't hesitate to reach out.

Thank you for your business. We appreciate your partnership and look forward to continuing to work with you.`;
  }

  /**
   * Fallback customer insights when API is unavailable
   */
  private getFallbackCustomerInsights(customer: Customer, invoices: Invoice[]): string {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const paymentRate = invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0;

    let insights = `Customer Insights for ${customer.name}:\n\n`;
    insights += `Revenue Summary:\n`;
    insights += `- Total Revenue: $${totalRevenue.toFixed(2)}\n`;
    insights += `- Total Invoices: ${invoices.length}\n`;
    insights += `- Average Invoice: $${(totalRevenue / invoices.length).toFixed(2)}\n\n`;

    insights += `Payment Reliability:\n`;
    insights += `- Payment Rate: ${paymentRate.toFixed(1)}%\n`;
    insights += `- Paid Invoices: ${paidInvoices.length}\n`;
    insights += `- Overdue Invoices: ${overdueInvoices.length}\n\n`;

    if (overdueInvoices.length > 0) {
      insights += `Risk Assessment:\n`;
      insights += `- Customer has ${overdueInvoices.length} overdue invoice(s)\n`;
      insights += `- Consider follow-up for outstanding payments\n`;
    } else if (paymentRate === 100) {
      insights += `Status: Excellent payment history - reliable customer\n`;
    }

    return insights;
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();

// Export the class for testing or custom instantiation
export default GeminiService;
