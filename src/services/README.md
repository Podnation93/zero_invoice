# Zero Invoice Services

This directory contains the core service modules for the Zero Invoice application.

## Services Overview

### 1. defaultTemplates.ts
Provides three professionally designed invoice templates out of the box.

**Templates Included:**
- **Modern**: Bold blue theme with clean lines and contemporary design
- **Classic**: Traditional formal design with dark gray theme
- **Minimal**: Clean, space-efficient black and white design

**Usage:**
```typescript
import { getDefaultTemplates } from './services/defaultTemplates';

const templates = getDefaultTemplates();
// Returns array of 3 Template objects ready to use
```

**Features:**
- Complete layout schemas with all block types (logo, header, customer, items, totals, notes, footer)
- Customizable style configurations (colors, fonts, spacing)
- Responsive positioning and sizing

---

### 2. pdfService.ts
Production-ready PDF generation service using jsPDF.

**Main Functions:**
```typescript
// Generate PDF from invoice and template
const pdfBlob = await generateInvoicePDF(invoice, template);

// Download the PDF
downloadPDF(pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);

// Preview PDF in new window
previewPDF(pdfBlob);
```

**Features:**
- Dynamic rendering based on template schema
- Support for all block types
- Automatic layout calculation
- Currency and date formatting
- Dark mode styling support
- Professional table rendering with alternating rows
- Error handling and fallback templates

**Supported Block Types:**
- `logo` - Company logo placeholder
- `header` - Invoice title, number, dates, status
- `customer` - Bill-to information with address
- `items` - Line items table with descriptions
- `totals` - Subtotal, tax, and total calculations
- `notes` - Payment terms and custom notes
- `footer` - Footer text with contact information

---

### 3. geminiService.ts
Google Gemini AI integration for intelligent features.

**Setup:**
Add your Gemini API key to `.env`:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

**Usage:**
```typescript
import { geminiService } from './services/geminiService';

// Check if configured
if (geminiService.isConfigured()) {

  // Generate email draft
  const emailDraft = await geminiService.generateEmailDraft(invoice);

  // Get customer insights
  const insights = await geminiService.generateCustomerInsights(
    customer,
    invoices
  );

  // Generate invoice summary
  const summary = await geminiService.generateInvoiceSummary(invoice);

  // Get layout suggestions (returns text suggestions)
  await geminiService.suggestTemplateLayout(currentLayout);
}
```

**Features:**
- Professional email draft generation for invoice sending
- Customer insights and payment history analysis
- Revenue trend analysis
- Risk assessment for overdue accounts
- Template layout improvement suggestions
- Rate limiting to prevent API throttling (1 request per second)
- Automatic fallback templates when API is unavailable
- Comprehensive error handling

**AI-Powered Features:**
1. **Email Drafts**: Generates professional, context-aware emails for sending invoices
2. **Customer Insights**: Analyzes payment history, revenue trends, and account health
3. **Layout Suggestions**: Provides design recommendations for template improvements
4. **Invoice Summaries**: Creates concise summaries for quick reference

---

## Integration Example

```typescript
import { getDefaultTemplates } from './services/defaultTemplates';
import { generateInvoicePDF, downloadPDF } from './services/pdfService';
import { geminiService } from './services/geminiService';
import type { Invoice } from './types';

// Get templates
const templates = getDefaultTemplates();
const modernTemplate = templates.find(t => t.name === 'Modern');

// Generate PDF
async function exportInvoice(invoice: Invoice) {
  try {
    const pdfBlob = await generateInvoicePDF(invoice, modernTemplate);
    downloadPDF(pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
}

// Use AI features (optional)
async function prepareInvoiceEmail(invoice: Invoice) {
  if (!geminiService.isConfigured()) {
    return 'AI features not configured';
  }

  try {
    const emailDraft = await geminiService.generateEmailDraft(invoice);
    return emailDraft;
  } catch (error) {
    console.error('Failed to generate email:', error);
    return 'Error generating email draft';
  }
}
```

---

## Error Handling

All services include comprehensive error handling:

### PDF Service
- Validates invoice and template data
- Handles missing or malformed layout blocks
- Provides detailed error messages
- Safe fallbacks for missing configurations

### Gemini Service
- Checks for API key configuration
- Validates API responses
- Implements rate limiting
- Provides fallback templates when API is unavailable
- Detailed error logging

---

## Performance Considerations

### PDF Generation
- Renders progressively to avoid blocking
- Efficient memory usage for large invoices
- Optimized table rendering

### AI Service
- Request queue with rate limiting (1 req/sec)
- Token limits to control response size
- Caching recommendations for repeated requests
- Graceful degradation when API is unavailable

---

## Type Safety

All services are fully typed with TypeScript:
- Complete type definitions for all parameters
- Type-safe template schemas
- Strict null checks
- Intellisense support

---

## Dependencies

- **jsPDF**: PDF generation (already in package.json)
- **date-fns**: Date formatting (already in package.json)
- **Google Gemini API**: AI features (requires API key)

---

## Future Enhancements

Potential improvements:
1. **PDF Service**: Add support for images/logos, custom fonts, QR codes
2. **Gemini Service**: Implement caching, batch operations, multi-language support
3. **Templates**: Add more default templates, template marketplace
4. **Export**: Support for other formats (Excel, CSV, HTML)

---

## Support

For issues or questions:
1. Check the TypeScript types for parameter details
2. Review error messages and logs
3. Ensure all dependencies are installed
4. Verify Gemini API key is set correctly

---

Last Updated: 2025-11-14
