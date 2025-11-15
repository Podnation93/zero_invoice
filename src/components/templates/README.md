# Template Components

This directory contains components for creating and managing custom invoice templates with a visual drag-and-drop designer.

## Components

### TemplatesPage.tsx
Main page component that orchestrates the template management experience.
- Switches between list and designer views
- Handles CRUD operations for templates
- Manages template state with AppContext
- Supports setting default templates

### TemplateList.tsx
Displays all templates in a card-based layout with previews and actions.
- Shows template thumbnails and metadata
- Supports edit, delete, duplicate, and set-as-default actions
- Displays default template badge
- Includes empty state for first-time users
- Sorted display: default template first, then by update date

### TemplateDesigner.tsx
Visual drag-and-drop designer for creating custom invoice templates.
- Uses @dnd-kit for drag-and-drop functionality
- Integrates BlockPalette and DesignerCanvas
- Style configuration modal
- AI-powered layout suggestions
- Save/cancel functionality
- Real-time block editing

### BlockPalette.tsx
Palette of draggable blocks for building invoice templates.
- 7 block types: logo, header, customer, items, totals, notes, footer
- Each block has custom icon and color coding
- Draggable blocks with visual feedback
- Includes helpful tips for users

### DesignerCanvas.tsx
Canvas where blocks are dropped, arranged, and configured.
- A4-sized canvas (794x1123 pixels)
- Visual drop zone with hover effects
- Block selection and configuration
- Delete and reorder blocks
- Shows block dimensions and position
- Empty state guidance

## Block Types

- **Logo**: Company branding (150x100)
- **Header**: Invoice title and number (700x120)
- **Customer**: Customer information (350x150)
- **Items**: Line items table (750x300)
- **Totals**: Subtotal, tax, total (300x150)
- **Notes**: Additional notes (750x100)
- **Footer**: Footer information (750x80)

## Usage Example

```tsx
import { TemplatesPage } from './components/templates';

function App() {
  return <TemplatesPage />;
}
```

## Features

- Full CRUD operations for templates
- Drag-and-drop interface
- Visual block positioning
- Style customization (colors, fonts, spacing)
- Default template management
- Template duplication
- AI-powered layout suggestions
- Responsive design with dark mode support

## Integration

Templates are stored in the AppContext and persisted to localStorage:
```tsx
const { templates, setTemplates } = useAppContext();
```

Each template has a schema that defines:
- Layout blocks with position and size
- Global styles (colors, fonts, spacing)
