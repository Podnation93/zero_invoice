# Quick Start Guide - Template Designer & AI Features

## Setup

### 1. Install Dependencies
All required dependencies are already in package.json:
```bash
npm install
```

### 2. Configure AI Features (Optional)
Create a `.env` file in the root directory:
```bash
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

Get your free API key: https://makersuite.google.com/app/apikey

## Using the Components

### Template Designer

#### Add to Your App
```tsx
import { TemplatesPage } from './components/templates';

function App() {
  return <TemplatesPage />;
}
```

#### How It Works
1. **View Templates**: See all saved templates in a card layout
2. **Create Template**: Click "New Template" button
3. **Drag Blocks**: Drag blocks from palette onto canvas
4. **Arrange Layout**: Position blocks where you want them
5. **Configure Styles**: Click "Styles" to customize colors and fonts
6. **Save**: Give your template a name and click "Save Template"

### AI Email Generator

```tsx
import { AIEmailGenerator } from './components/ai';

function InvoiceView() {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <>
      <button onClick={() => setShowEmail(true)}>
        Generate Email
      </button>

      {showEmail && (
        <AIEmailGenerator
          invoice={invoice}
          onClose={() => setShowEmail(false)}
        />
      )}
    </>
  );
}
```

### Customer Insights

```tsx
import { CustomerInsights } from './components/ai';

function CustomerPage() {
  const { invoices } = useAppContext();
  const customerInvoices = invoices.filter(
    inv => inv.customerId === customer.id
  );

  return (
    <CustomerInsights
      customer={customer}
      invoices={customerInvoices}
    />
  );
}
```

## File Locations

```
src/
├── components/
│   ├── templates/
│   │   ├── BlockPalette.tsx
│   │   ├── DesignerCanvas.tsx
│   │   ├── TemplateDesigner.tsx
│   │   ├── TemplateList.tsx
│   │   ├── TemplatesPage.tsx
│   │   └── index.ts
│   │
│   └── ai/
│       ├── AIEmailGenerator.tsx
│       ├── CustomerInsights.tsx
│       ├── LayoutSuggestions.tsx
│       └── index.ts
```

## Features at a Glance

### Template Designer
- ✅ Drag-and-drop interface
- ✅ 7 customizable block types
- ✅ A4 canvas size
- ✅ Style customization
- ✅ Save/edit/delete templates
- ✅ Set default template
- ✅ Template duplication

### AI Features
- ✅ Email draft generation
- ✅ Customer analytics
- ✅ Layout suggestions
- ✅ Works without AI key (fallback content)

## Troubleshooting

### AI Features Not Working
**Problem**: "AI service is not configured" warning
**Solution**: Add `VITE_GEMINI_API_KEY` to your `.env` file and restart dev server

### Drag and Drop Not Working
**Problem**: Blocks won't drag
**Solution**: Ensure @dnd-kit packages are installed: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

### Dark Mode Issues
**Problem**: Components don't show in dark mode
**Solution**: Ensure dark mode classes are configured in your Tailwind config

## Next Steps

1. **Add to Navigation**: Include templates page in your app's navigation
2. **Create Default Templates**: Add some starter templates for users
3. **Integrate with Invoices**: Use template schemas in PDF generation
4. **Add Tests**: Write unit tests for components
5. **Customize Styles**: Adjust colors to match your brand

## Component Dependencies

All components use:
- React 19.2.0+
- TypeScript
- Tailwind CSS
- lucide-react (icons)
- date-fns (date formatting)
- uuid (ID generation)
- @dnd-kit (drag and drop)

## Support

For detailed documentation, see:
- `src/components/templates/README.md`
- `src/components/ai/README.md`
- `COMPONENTS_SUMMARY.md`

## Example Usage in Main App

```tsx
// App.tsx
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { TemplatesPage } from './components/templates';
import { AIEmailGenerator } from './components/ai';

function App() {
  const [currentView, setCurrentView] = useState('templates');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav>
          <button onClick={() => setCurrentView('templates')}>
            Templates
          </button>
        </nav>

        {currentView === 'templates' && <TemplatesPage />}
      </div>
    </AppProvider>
  );
}

export default App;
```

---

**You're all set! Start building beautiful invoice templates with AI assistance.**
