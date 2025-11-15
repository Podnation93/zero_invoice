# AI Components

This directory contains AI-powered features using Google's Gemini API for intelligent invoice management.

## Components

### AIEmailGenerator.tsx
Generates professional email drafts for sending invoices to customers.

**Features:**
- AI-generated email content with subject and body
- Editable email text before sending
- Copy to clipboard functionality
- Opens in default email client
- Shows invoice details context
- Fallback templates when AI is unavailable
- Configuration status indicators

**Usage:**
```tsx
import { AIEmailGenerator } from './components/ai';

<AIEmailGenerator
  invoice={invoice}
  onClose={() => setShowEmail(false)}
/>
```

### CustomerInsights.tsx
Displays AI-powered customer analytics and payment insights.

**Features:**
- Revenue metrics (total, average, payment rate)
- Invoice statistics (paid, overdue counts)
- AI-generated insights about customer behavior
- Payment reliability assessment
- Risk indicators for overdue payments
- Positive feedback for reliable customers
- Visual metric cards with icons

**Usage:**
```tsx
import { CustomerInsights } from './components/ai';

<CustomerInsights
  customer={customer}
  invoices={customerInvoices}
/>
```

### LayoutSuggestions.tsx
Provides AI-powered suggestions for improving invoice template layouts.

**Features:**
- Analyzes current template layout
- Suggests 3 specific improvements
- Explains reasoning for each suggestion
- Based on design best practices
- Fallback suggestions when AI unavailable
- Visual hierarchy recommendations
- Spacing and alignment tips

**Usage:**
```tsx
import { LayoutSuggestions } from './components/ai';

<LayoutSuggestions
  currentLayout={blocks}
  onApply={handleApply}
  onClose={handleClose}
/>
```

## Configuration

All AI features require a Google Gemini API key:

```bash
# .env file
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## AI Service

All components use the shared `geminiService`:

```tsx
import { geminiService } from '../../services/geminiService';

// Check if configured
if (geminiService.isConfigured()) {
  // Use AI features
}
```

## Features

### Email Generation
- Professional tone and formatting
- Context-aware content based on invoice details
- Subject line included
- Customizable before sending
- Rate-limited API calls

### Customer Insights
- Payment behavior analysis
- Revenue trends
- Risk assessment
- Actionable recommendations
- Historical data analysis

### Layout Suggestions
- Design best practices
- Visual hierarchy guidance
- Space optimization
- Professional standards
- Industry conventions

## Error Handling

All components include:
- Configuration checks
- Error states with clear messages
- Loading indicators
- Fallback content
- User-friendly warnings

## Rate Limiting

The AI service includes built-in rate limiting:
- Minimum 1 second between requests
- Request queue management
- Prevents API throttling

## Tips

1. **Email Generator**: Always review and customize generated emails
2. **Customer Insights**: Refresh periodically for updated analysis
3. **Layout Suggestions**: Apply one suggestion at a time and preview results
4. All features work offline with fallback content when AI is unavailable
