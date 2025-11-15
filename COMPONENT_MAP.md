# Component Architecture Map

## Template Designer System

```
TemplatesPage (Main Orchestrator)
│
├── View: LIST
│   └── TemplateList
│       ├── TemplateCard (multiple)
│       │   ├── Thumbnail preview
│       │   ├── Template metadata
│       │   ├── Action buttons
│       │   │   ├── Edit
│       │   │   ├── Delete
│       │   │   ├── Duplicate
│       │   │   └── Set as Default
│       │   └── Block information
│       │
│       └── ConfirmModal (for deletions)
│
└── View: DESIGNER
    └── TemplateDesigner
        ├── Header Section
        │   ├── Template name input
        │   ├── Styles button → Modal
        │   ├── AI Suggestions button → LayoutSuggestions
        │   ├── Save button
        │   └── Cancel button
        │
        ├── Main Designer (DndContext)
        │   ├── BlockPalette (Left Sidebar)
        │   │   ├── Logo block (draggable)
        │   │   ├── Header block (draggable)
        │   │   ├── Customer block (draggable)
        │   │   ├── Items block (draggable)
        │   │   ├── Totals block (draggable)
        │   │   ├── Notes block (draggable)
        │   │   ├── Footer block (draggable)
        │   │   └── Tips panel
        │   │
        │   └── DesignerCanvas (Center)
        │       ├── A4 Canvas (droppable)
        │       ├── CanvasBlock (multiple, sortable)
        │       │   ├── Block header with icon
        │       │   ├── Configure button
        │       │   ├── Delete button
        │       │   └── Size display
        │       │
        │       └── Selected block info panel
        │
        └── Modals
            ├── Styles Configuration Modal
            └── LayoutSuggestions Modal
```

## AI Features System

```
AI Components
│
├── AIEmailGenerator
│   ├── Invoice context display
│   ├── Configuration warning
│   ├── Generate button
│   ├── Loading state
│   ├── Generated content
│   │   ├── Subject field (editable)
│   │   ├── Body textarea (editable)
│   │   └── Action buttons
│   │       ├── Send (opens email client)
│   │       ├── Copy to clipboard
│   │       └── Regenerate
│   │
│   ├── Success messages
│   ├── Error handling
│   └── Tips panel
│
├── CustomerInsights
│   ├── Customer info header
│   ├── Metrics Grid
│   │   ├── Total Revenue (MetricCard)
│   │   ├── Total Invoices (MetricCard)
│   │   ├── Paid Invoices (MetricCard)
│   │   └── Overdue Invoices (MetricCard)
│   │
│   ├── Additional Metrics
│   │   ├── Average Invoice
│   │   └── Payment Rate
│   │
│   ├── AI Insights Section
│   │   ├── Configuration warning
│   │   ├── Generate button
│   │   ├── Loading state
│   │   ├── Generated insights display
│   │   ├── Risk indicators
│   │   ├── Positive indicators
│   │   └── Refresh button
│   │
│   └── Tips panel
│
└── LayoutSuggestions (Modal)
    ├── Header with AI icon
    ├── Configuration info
    ├── Loading state
    ├── Suggestions List (3 items)
    │   └── Suggestion Card
    │       ├── Number and title
    │       ├── Description
    │       └── Reasoning panel
    │
    ├── Action buttons
    │   ├── Close
    │   └── Get New Suggestions
    │
    └── Tips panel
```

## Data Flow

```
AppContext (Global State)
│
├── templates[] ←──────────┐
│   └── Template            │
│       ├── id              │
│       ├── name            │
│       ├── isDefault       │
│       ├── schemaJSON      │
│       │   ├── layout[]    │
│       │   │   └── LayoutBlock
│       │   │       ├── id
│       │   │       ├── type
│       │   │       ├── position
│       │   │       ├── size
│       │   │       └── config
│       │   │
│       │   └── styles
│       │       ├── primaryColor
│       │       ├── fontFamily
│       │       ├── fontSize
│       │       └── spacing
│       │
│       ├── createdAt
│       └── updatedAt
│
├── invoices[] ────────────┐
│                          │
├── customers[] ───────────┼──→ Used by AI Components
│                          │
└── items[]                │
                           │
                           │
GeminiService ←────────────┘
│
├── generateEmailDraft(invoice)
├── generateCustomerInsights(customer, invoices)
└── suggestTemplateLayout(layout)
```

## Component Dependencies

```
Template Components
│
├── External Dependencies
│   ├── @dnd-kit/core
│   ├── @dnd-kit/sortable
│   ├── @dnd-kit/utilities
│   ├── uuid
│   ├── lucide-react
│   └── date-fns
│
├── Internal Dependencies
│   ├── types/template
│   ├── context/AppContext
│   └── components/common
│       ├── Button
│       ├── Input
│       ├── Modal
│       ├── Card
│       └── Badge
│
└── Component Relationships
    TemplatesPage
    └── uses TemplateList
        └── uses ConfirmModal
    └── uses TemplateDesigner
        └── uses BlockPalette
        └── uses DesignerCanvas
        └── uses Modal
        └── uses LayoutSuggestions
```

```
AI Components
│
├── External Dependencies
│   ├── lucide-react
│   └── date-fns
│
├── Internal Dependencies
│   ├── types (Invoice, Customer)
│   ├── services/geminiService
│   └── components/common
│       ├── Button
│       ├── Card
│       ├── MetricCard
│       ├── Textarea
│       └── Modal
│
└── Component Relationships
    AIEmailGenerator
    └── uses geminiService
    └── uses common components

    CustomerInsights
    └── uses geminiService
    └── uses MetricCard
    └── uses common components

    LayoutSuggestions
    └── uses geminiService
    └── uses Modal
    └── uses common components
```

## State Management

```
TemplatesPage State
├── templates (from AppContext)
├── viewMode: 'list' | 'designer'
└── editingTemplate: Template | null

TemplateDesigner State
├── templateName: string
├── blocks: LayoutBlock[]
├── styles: StyleConfig
├── selectedBlock: LayoutBlock | null
├── activeId: string | null (drag state)
├── showStylesModal: boolean
├── showAISuggestions: boolean
└── error: string

AIEmailGenerator State
├── emailDraft: string
├── subject: string
├── body: string
├── isLoading: boolean
├── error: string
└── copied: boolean

CustomerInsights State
├── insights: string
├── isLoading: boolean
├── error: string
└── hasGenerated: boolean

LayoutSuggestions State
├── suggestions: Suggestion[]
├── rawSuggestions: string
├── isLoading: boolean
├── error: string
└── hasGenerated: boolean
```

## Event Flows

### Creating a Template
```
1. User clicks "New Template"
   └→ TemplatesPage.handleCreateNew()
      └→ setViewMode('designer')
         └→ TemplateDesigner renders

2. User drags block from palette
   └→ BlockPalette.DraggableBlock (drag start)
      └→ TemplateDesigner.handleDragEnd()
         └→ Creates new LayoutBlock
            └→ Updates blocks state

3. User saves template
   └→ TemplateDesigner.handleSave()
      └→ TemplatesPage.handleSave()
         └→ AppContext.setTemplates()
            └→ Saves to localStorage
               └→ Returns to list view
```

### Generating Email
```
1. User clicks "Generate Email"
   └→ AIEmailGenerator.handleGenerate()
      └→ geminiService.generateEmailDraft(invoice)
         └→ API call to Gemini
            └→ Parse response
               └→ Update state with subject & body

2. User clicks "Open in Email Client"
   └→ Creates mailto: link
      └→ Opens system email app
```

### Getting Customer Insights
```
1. User clicks "Generate AI Insights"
   └→ CustomerInsights.handleGenerateInsights()
      └→ geminiService.generateCustomerInsights(customer, invoices)
         └→ API call to Gemini
            └→ Parse and display insights
               └→ Show risk/success indicators
```

## Integration Points

```
Main App
│
├── Navigation
│   └→ TemplatesPage route
│
├── Invoice View
│   └→ AIEmailGenerator
│       └→ Pass current invoice
│
├── Customer Profile
│   └→ CustomerInsights
│       └→ Pass customer & filtered invoices
│
└── Invoice Generation
    └→ Use template.schemaJSON
        └→ Render with jsPDF
```

---

This map shows the complete architecture of the template designer and AI features system.
