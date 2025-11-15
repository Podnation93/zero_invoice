# Bulk PDF Invoice Import Feature

## Overview

A comprehensive bulk PDF invoice import feature has been added to Zero Invoice, allowing users to import multiple PDF invoices simultaneously using AI-powered extraction and intelligent data matching.

## Features

### 1. PDF Text Extraction
- **Multi-file support**: Upload and process multiple PDF files at once
- **Parallel processing**: Process up to 3 files concurrently for optimal performance
- **Progress tracking**: Real-time progress indicators for each file
- **Validation**: Automatic validation of PDF files before processing
- **Error handling**: Graceful handling of corrupted or invalid PDFs

### 2. AI-Powered Invoice Parsing
- **Gemini AI Integration**: Utilizes Google Gemini API for intelligent data extraction
- **Pattern Matching Fallback**: Automatic fallback to regex-based extraction if AI is unavailable
- **Confidence Scoring**: Each extraction receives a confidence score (0-100%)
- **Multi-format Support**: Handles variations in invoice formats and layouts

### 3. Intelligent Data Matching

#### Customer Matching
- **Exact Name Match**: Finds existing customers by exact name
- **Email Match**: Matches customers by email address (95% confidence)
- **Fuzzy Matching**: Uses similarity algorithms for partial name matches (70% confidence)
- **Auto-creation**: Option to automatically create new customers

#### Item Catalog Matching
- **Exact Product Match**: Matches line items to existing catalog items
- **Fuzzy Product Match**: Intelligent matching for similar product names
- **Auto-catalog**: Automatically adds new items to the catalog

### 4. Extracted Data

The system extracts the following invoice data:
- Invoice number
- Issue date and due date
- Customer information (name, email, address)
- Line items (description, quantity, unit price)
- Subtotal, tax rate, tax amount
- Total amount
- Notes and terms

### 5. Import Preview & Review
- **Visual Preview**: Review all extracted data before importing
- **Confidence Badges**: Color-coded confidence indicators (green/yellow/red)
- **Error Warnings**: Clear display of extraction errors and warnings
- **Selective Import**: Choose which invoices to import
- **Bulk Actions**: Import all, remove failed, select/deselect all
- **Statistics Dashboard**: Track import progress (total, pending, processing, ready, success, failed)

### 6. User Interface

#### Drag-and-Drop Upload
- Modern drag-and-drop interface
- Multi-file selection support
- File size validation (10MB per file)
- Visual feedback during drag operations

#### Import Statistics
Real-time statistics display:
- Total files uploaded
- Pending files (waiting to be processed)
- Processing files (currently being extracted)
- Ready files (successfully extracted, ready for review)
- Success count (successfully imported)
- Failed count (extraction or import failures)

#### Status Indicators
Color-coded status for each file:
- **Gray (Pending)**: Waiting to be processed
- **Blue (Processing)**: Currently extracting data with progress bar
- **Green (Ready)**: Successfully extracted, ready for import
- **Green (Success)**: Successfully imported into system
- **Red (Failed)**: Extraction or import failed with error message

## Files Created

### Type Definitions
**File**: `src/types/import.ts`
- `ExtractedInvoice`: Structured invoice data with metadata
- `ImportResult`: Individual file processing result
- `ImportStats`: Aggregate import statistics
- `ImportStatus`: File processing status type
- `ExtractionOptions`: Configuration for extraction behavior

### Services

#### PDF Extractor Service
**File**: `src/services/pdfExtractorService.ts`
- Uses `pdfjs-dist` for PDF text extraction
- Batch processing with configurable concurrency
- Progress callbacks for real-time updates
- PDF validation (magic number checking)
- Metadata extraction (title, author, dates, etc.)
- Multi-page document support

#### Invoice Parser Service
**File**: `src/services/invoiceParserService.ts`
- AI-powered parsing using Gemini API
- Regex-based fallback parser
- Customer matching algorithm
- Item catalog matching
- Confidence calculation
- Date normalization
- String similarity calculations (Levenshtein distance)
- Structured data conversion to Invoice objects

### Components

#### BulkInvoiceImport Component
**File**: `src/components/invoices/BulkInvoiceImport.tsx`
- Main upload and processing interface
- Drag-and-drop file upload zone
- File list with status and progress
- Statistics dashboard
- Process control (process files, review & import)
- File management (remove individual files, remove all failed)
- Responsive design with dark mode support

#### ImportPreview Component
**File**: `src/components/invoices/ImportPreview.tsx`
- Preview interface for extracted invoices
- Selectable invoice cards
- Confidence badges and indicators
- Customer and item matching status
- Error and warning displays
- Bulk import functionality
- Edit modal (placeholder for future implementation)
- Date formatting and validation

### Integration

#### InvoicesPage Updates
**File**: `src/components/invoices/InvoicesPage.tsx`
- Added 'import' view mode
- "Import PDFs" button in list view
- Import workflow handlers
- Navigation between import and list views

#### Types Index
**File**: `src/types/index.ts`
- Exports import types for use throughout the application

## Technical Implementation

### PDF.js Configuration
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### AI Extraction Prompt
The Gemini API receives a structured prompt requesting JSON output with:
- Low temperature (0.3) for consistent extraction
- Specific field requirements
- Date format normalization (YYYY-MM-DD)
- Numeric value extraction (no currency symbols)
- Null handling for missing data

### Pattern Matching Fallback
Regex patterns for:
- Invoice numbers: `/invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i`
- Dates: `/date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i`
- Totals: `/total\s*:?\s*\$?\s*([\d,]+\.?\d*)/i`
- Email addresses: `/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/`

### Customer Matching Algorithm
1. **Exact name match** (100% confidence)
2. **Email match** (95% confidence)
3. **Fuzzy name match** using Levenshtein distance (70% confidence if similarity > 0.7)
4. **Create new** if no match found

### Item Matching Algorithm
1. **Exact name match** (100% confidence)
2. **Fuzzy match** using string similarity (70% confidence if similarity > 0.7)
3. **Create new catalog item** if no match found

## Error Handling

### PDF Extraction Errors
- Invalid PDF format
- Corrupted file data
- Large file size issues
- Network errors (CDN worker loading)

### AI Parsing Errors
- API rate limits (handled by request queue)
- Invalid API response
- JSON parsing failures
- Missing API key (graceful fallback to pattern matching)

### Import Errors
- Missing required fields (invoice number, customer, total)
- Invalid date formats
- Customer/item matching conflicts
- Template not found

## Usage Guide

### Step 1: Access Bulk Import
1. Navigate to Invoices page
2. Click "Import PDFs" button in the top-right corner

### Step 2: Upload PDFs
1. Drag and drop PDF files onto the upload zone
2. OR click "Browse Files" to select files
3. Files will appear in the file list with "pending" status

### Step 3: Process Files
1. Click "Process Files (X)" button
2. Watch progress bars as files are extracted
3. Files will transition to "ready" or "failed" status
4. Failed files can be removed with "Remove Failed" button

### Step 4: Review Extracted Data
1. Click "Review & Import (X)" button
2. Review each invoice card showing:
   - Invoice number and confidence score
   - Customer matching status
   - Dates (issue and due)
   - Line items count and subtotal
   - Total amount and tax
   - Any errors or warnings
3. Select/deselect invoices to import
4. Use "Select All" to toggle all selections

### Step 5: Import
1. Click "Import X Invoice(s)" button
2. Wait for import to complete
3. System will:
   - Create new customers as needed
   - Add new items to catalog as needed
   - Create invoice records
   - Update localStorage
4. Return to invoice list view

## Configuration

### Extraction Options
Currently hardcoded in `BulkInvoiceImport.tsx`:
```typescript
{
  useAI: true,                    // Use Gemini API
  autoMatchCustomers: true,       // Automatically match customers
  autoMatchItems: true,           // Automatically match items
  createNewCustomers: true,       // Create new customers
  createNewItems: true,           // Add new items to catalog
}
```

### Concurrent Processing
Default: 3 files processed in parallel
Configurable in `pdfExtractorService.extractTextFromMultiple()`

### Confidence Thresholds
- **High Confidence**: ≥ 80% (green badge)
- **Medium Confidence**: 50-79% (yellow badge)
- **Low Confidence**: < 50% (red badge)

## Future Enhancements

### Planned Features
1. **Inline Editing**: Edit extracted data before import in preview modal
2. **Customer Disambiguation**: UI to resolve multiple customer matches
3. **Item Disambiguation**: UI to resolve multiple item matches
4. **Batch Templates**: Apply specific template to all imported invoices
5. **Import History**: Track import sessions and rollback capability
6. **CSV Export**: Export extraction results to CSV
7. **Advanced Filters**: Filter preview by confidence, customer, amount range
8. **Duplicate Detection**: Warn about potential duplicate invoices
9. **Custom Mapping**: Map PDF fields to invoice fields manually
10. **OCR Support**: Extract text from scanned/image-based PDFs

### Enhancement Opportunities
- **Performance**: Web Workers for PDF processing
- **Storage**: IndexedDB for large import sessions
- **Validation**: Zod schemas for extracted data validation
- **Testing**: Unit tests for parsing algorithms
- **Analytics**: Track extraction accuracy and improvement over time

## Dark Mode Support

All components fully support dark mode:
- Automatic theme detection from AppContext
- TailwindCSS dark: variants for all UI elements
- Consistent color schemes across light and dark modes

## Responsive Design

Mobile-friendly layouts:
- Grid layouts adapt from 4 columns (desktop) to 1 column (mobile)
- Touch-friendly drag-and-drop zones
- Scrollable file lists and preview cards
- Responsive button groups and statistics panels

## Dependencies

### Required Packages
- `pdfjs-dist`: ^5.4.394 - PDF text extraction
- `uuid`: ^13.0.0 - Unique ID generation
- `date-fns`: ^4.1.0 - Date formatting
- `lucide-react`: ^0.553.0 - Icons

### Optional
- Google Gemini API key (graceful degradation without it)

## Performance Considerations

### Memory Management
- Processes PDFs in batches (default: 3 concurrent)
- Releases file references after processing
- Limits text extraction to reasonable sizes

### Network Optimization
- CDN-hosted PDF.js worker
- Request queue prevents API throttling
- Parallel extraction reduces total time

### User Experience
- Real-time progress indicators
- Immediate visual feedback
- Non-blocking UI during processing
- Error recovery without data loss

## Known Limitations

1. **AI Dependency**: Best results require Gemini API key
2. **PDF Format**: Text-based PDFs only (OCR not supported)
3. **Customer Creation**: Creates placeholder customers (manual review recommended)
4. **Edit Capability**: Preview edit modal not yet implemented
5. **Template Assignment**: Uses first available template for all imports
6. **Validation**: Limited validation of extracted data
7. **localStorage**: Subject to browser storage limits (~5-10MB)

## Support and Troubleshooting

### Common Issues

**Problem**: "Invalid PDF file" error
- **Solution**: Ensure file is a valid PDF (not image or scan)

**Problem**: Low confidence scores
- **Solution**: Enable Gemini API for better extraction

**Problem**: No invoice data extracted
- **Solution**: Check PDF format - must be text-based, not scanned images

**Problem**: Customer not matched
- **Solution**: Ensure customer name or email in PDF matches existing records

**Problem**: Processing very slow
- **Solution**: Reduce concurrent processing or upload fewer files at once

### Debug Information

Check browser console for:
- PDF extraction errors
- AI parsing failures
- Customer/item matching details
- Import success/failure messages

## Security Considerations

- All processing happens client-side (no server uploads)
- PDF data never leaves the browser
- Gemini API calls made directly from client
- LocalStorage for data persistence (encrypted at rest by browser)

## Conclusion

This bulk PDF invoice import feature significantly enhances Zero Invoice's capabilities, enabling users to digitize existing paper invoices quickly and efficiently. The combination of AI-powered extraction and intelligent matching ensures accurate data capture with minimal manual intervention.
