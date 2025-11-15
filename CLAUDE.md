# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zero Invoice 2.0 is a **fully client-side, local-first invoicing SPA** with no backend. All data persists in browser localStorage. It features AI-powered capabilities via Google Gemini API, a visual template designer with drag-and-drop, and comprehensive invoice/customer/item management.

## Commands

### Development
```bash
npm run dev          # Start Vite dev server on http://localhost:5173
npm run build        # TypeScript compilation + production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Setup
```bash
cp .env.example .env  # Create environment file
# Add: VITE_GEMINI_API_KEY=your_key_here
```

## Architecture

### State Management Pattern
The app uses a **centralized Context + localStorage pattern**:
- `AppContext` (`src/context/AppContext.tsx`) provides global state for customers, items, invoices, templates, darkMode, and currentView
- Custom hook `useLocalStorage` automatically syncs state with localStorage
- All components consume context via `useAppContext()` hook
- Storage keys: `zero-invoice-customers`, `zero-invoice-items`, `zero-invoice-invoices`, `zero-invoice-templates`, `zero-invoice-darkmode`

### Routing Strategy
**NOT using React Router** - routing is handled via view state in AppContext:
- `currentView` state drives which component renders in `App.tsx`
- `setCurrentView(viewName)` changes active view
- Valid views: `'dashboard'`, `'invoices'`, `'customers'`, `'items'`, `'templates'`
- Individual feature modules (e.g., InvoicesPage, CustomersPage) manage their own sub-views (list/create/edit/detail)

### Component Organization
```
components/
├── common/          # Reusable UI primitives (Button, Input, Modal, Table, etc.)
├── layout/          # Sidebar, Header, Layout wrapper
├── dashboard/       # Dashboard metrics, recent activity
├── invoices/        # Invoice CRUD + line items management
├── customers/       # Customer CRUD + profile analytics
├── items/           # Item catalog CRUD
├── templates/       # Template designer with drag-and-drop (@dnd-kit)
└── ai/              # AI features (email drafts, insights, layout suggestions)
```

### Services Layer
- `storageService.ts`: Singleton for localStorage operations with error handling
- `pdfService.ts`: jsPDF-based invoice rendering from template schemas
- `geminiService.ts`: Google Gemini API integration with rate limiting/queuing
- `defaultTemplates.ts`: Factory for 3 default invoice templates (Modern, Classic, Minimal)

### Type System
All types defined in `src/types/`:
- `customer.ts`: Customer, Address, CustomerFormData
- `item.ts`: Item, ItemFormData
- `invoice.ts`: Invoice, LineItem, InvoiceStatus, InvoiceFormData
- `template.ts`: Template, TemplateSchema, LayoutBlock, StyleConfig, BlockType

**Critical**: TypeScript strict mode is enabled with `verbatimModuleSyntax: true`. All type-only imports MUST use `import type { }` syntax.

### Data Flow Example (Invoice Creation)
1. User clicks "New Invoice" → `InvoicesPage` sets view to 'create'
2. `InvoiceForm` renders with empty state
3. User selects customer → fetches from `customers` array in AppContext
4. User adds line items → can select from `items` catalog or create custom
5. Form calculates totals using `utils/calculations.ts`
6. On save → validates with Zod schema, creates Invoice object with UUID, stores customer snapshot
7. Updates `invoices` array in AppContext → automatically persists to localStorage
8. AppContext update triggers re-render of InvoiceList

### Template System
Templates use a **JSON schema-driven rendering engine**:
- TemplateSchema contains array of LayoutBlocks (logo, header, customer, items, totals, notes, footer)
- Each block has position (x, y), size, type, and config
- Template Designer uses @dnd-kit for drag-and-drop block placement
- PDF service dynamically renders based on active template's schema
- Templates can be customized via visual designer or JSON editing

### AI Integration
All AI features use `geminiService`:
- Request queue prevents rate limit issues
- Falls back to template responses if API unavailable
- Requires `VITE_GEMINI_API_KEY` environment variable
- Three features: email drafts, customer insights, layout suggestions

## TypeScript Strictness

This project uses **very strict TypeScript settings**:
- `verbatimModuleSyntax: true` - All type imports MUST use `import type { }`
- `noUnusedLocals: true` - Remove or prefix unused vars with `_`
- `noUnusedParameters: true` - Remove or prefix unused params with `_`
- `strict: true` - All strict checks enabled

When fixing type errors:
- Change `import { Type }` to `import type { Type }` for types
- Use `import { Component, type Props }` for mixed imports
- Install @types/node for NodeJS namespace (timers, etc.)

## Common Patterns

### Adding a New Feature Module
1. Create folder in `src/components/[feature]`
2. Implement Page component that manages view state (list/create/edit)
3. Add data type to `src/types/[feature].ts`
4. Update AppContext to include new data array + setter
5. Add view to `currentView` switch in `App.tsx`
6. Add menu item to Sidebar component

### CRUD Operations
All CRUD follows same pattern:
```typescript
const { items, setItems } = useAppContext();

// Create
const newItem = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
setItems([...items, newItem]);

// Update
setItems(items.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));

// Delete
setItems(items.filter(item => item.id !== id));
```

### Validation
Uses Zod schemas in `utils/validation.ts`. Form components:
1. Maintain local state for form data
2. Validate on submit with `schema.safeParse()`
3. Display errors inline per field
4. Only update AppContext on successful validation

### Autosave
Invoice form uses `useAutosave` hook:
- Debounces saves (default 3 seconds)
- Only saves if data changed (JSON.stringify comparison)
- Automatically creates/updates draft invoices

## Key Constraints

- **No backend** - all operations must work client-side
- **localStorage limits** - typically 5-10MB per origin
- **Customer snapshots** - Invoices store immutable customer copy at creation time
- **Line items by value** - Editing catalog items doesn't affect historical invoices
- **Template immutability** - Changing template doesn't alter existing PDFs
- **Single user** - No multi-user concerns, no auth required

## Build Issues

Current known issue: TypeScript compilation errors due to type import syntax. When fixing:
1. Run `npm run build` to see all errors
2. Fix type imports to use `import type { }` syntax
3. Remove unused variables or prefix with `_`
4. Ensure @types/node is installed for NodeJS types
5. Re-run build until clean

## Data Persistence

All data is stored in localStorage with these keys:
- `zero-invoice-customers`
- `zero-invoice-items`
- `zero-invoice-invoices`
- `zero-invoice-templates`
- `zero-invoice-darkmode`

To backup/restore data, export/import these localStorage keys via browser DevTools.
