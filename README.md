# Zero Invoice 2.0

A fully client-side, local-first invoicing Single-Page Application (SPA) with no backend dependency. Zero Invoice provides powerful invoicing capabilities with AI-powered features, customizable templates, and comprehensive business analytics.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)

## Features

### Core Functionality
- **Invoice Management**: Create, edit, and manage invoices with automatic calculations
- **Customer Management**: Store and organize customer information with analytics
- **Item Catalog**: Reusable product/service catalog for quick invoice creation
- **Template Designer**: Visual drag-and-drop editor for custom invoice layouts
- **PDF Generation**: Export professional invoices as PDF documents

### AI-Powered Features (Google Gemini)
- **Smart Email Drafts**: Generate professional email content for sending invoices
- **Customer Insights**: AI-powered analysis of customer payment patterns and behavior
- **Layout Suggestions**: Intelligent recommendations for invoice template improvements

### Advanced Features
- **Dashboard Analytics**: Real-time business metrics and revenue tracking
- **Autosave**: Automatic draft saving to prevent data loss
- **Dark Mode**: Full dark mode support throughout the application
- **Local Storage**: All data stored locally in your browser - complete privacy
- **No Backend Required**: Fully client-side application with no server dependencies

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zero-invoice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Get your API key from: https://makersuite.google.com/app/apikey

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

The production build will be available in the `dist` folder.

## Project Structure

```
zero-invoice/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   ├── dashboard/       # Dashboard and analytics
│   │   ├── invoices/        # Invoice management
│   │   ├── customers/       # Customer management
│   │   ├── items/           # Item catalog
│   │   ├── templates/       # Template designer
│   │   └── ai/              # AI-powered features
│   ├── services/
│   │   ├── storageService.ts    # Local storage abstraction
│   │   ├── pdfService.ts        # PDF generation
│   │   ├── geminiService.ts     # AI integration
│   │   └── defaultTemplates.ts  # Default invoice templates
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useAutosave.ts
│   │   └── useUnsavedChanges.ts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── context/             # React Context for state management
│   └── App.tsx              # Main application component
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Drag & Drop**: @dnd-kit
- **AI Integration**: Google Gemini API
- **Date Handling**: date-fns
- **Validation**: Zod
- **Icons**: Lucide React

## Usage Guide

### Creating Your First Invoice

1. **Add Customers**
   - Navigate to the Customers page
   - Click "New Customer"
   - Fill in customer details and billing address
   - Save

2. **Set Up Item Catalog**
   - Go to the Items page
   - Click "New Item"
   - Add your products/services with prices
   - Save

3. **Create an Invoice**
   - Navigate to the Invoices page
   - Click "New Invoice"
   - Select a customer
   - Add line items from your catalog or create custom ones
   - Adjust tax rate and dates
   - Save as draft or mark as sent

4. **Generate PDF**
   - Open the invoice details
   - Select a template
   - Click "Download PDF"

### Using AI Features

#### Email Draft Generation
1. Open an invoice
2. Click "AI Email"
3. Review and edit the generated email
4. Copy to clipboard or open in email client

#### Customer Insights
1. Go to a customer's profile page
2. Click "View Insights"
3. Review AI-generated payment patterns and recommendations

#### Template Layout Suggestions
1. Open the Template Designer
2. Click "AI Suggest Layout"
3. Review suggestions and apply improvements

### Customizing Templates

1. Navigate to the Templates page
2. Click "Create New Template"
3. Drag blocks from the palette to the canvas
4. Adjust positioning and styling
5. Save your custom template

## Data Storage

Zero Invoice uses browser Local Storage to persist all data:
- **Customers**: Stored in `zero-invoice-customers`
- **Items**: Stored in `zero-invoice-items`
- **Invoices**: Stored in `zero-invoice-invoices`
- **Templates**: Stored in `zero-invoice-templates`
- **Settings**: Stored in `zero-invoice-darkmode`

### Data Export/Backup

To backup your data:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Copy the values for all `zero-invoice-*` keys

To import data:
1. Open browser DevTools
2. Go to Application > Local Storage
3. Paste the backed-up values

## Configuration

### Environment Variables

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key for AI features (optional)

### Customization

You can customize the application by modifying:
- `tailwind.config.js`: Update colors, fonts, and theme
- `src/services/defaultTemplates.ts`: Modify default invoice templates
- `src/index.css`: Add custom CSS classes

## Browser Compatibility

Zero Invoice works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations

- **Storage Size**: Limited by browser Local Storage (typically 5-10MB)
- **No Cloud Sync**: Data is stored locally and not synced across devices
- **AI Features**: Require an internet connection and valid API key
- **Single User**: Designed for individual use, not multi-user environments

## Troubleshooting

### AI Features Not Working

- Verify `VITE_GEMINI_API_KEY` is set in your `.env` file
- Check that you have an active internet connection
- Ensure your API key is valid and has sufficient quota

### Data Not Persisting

- Check that your browser allows Local Storage
- Clear browser cache and reload
- Verify you're not in incognito/private mode

### PDF Not Generating

- Ensure you have selected a template
- Check browser console for errors
- Try a different template

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 5 - Future Enhancements
- Client portal for customers to view invoices
- Recurring invoice scheduling
- Document storage and attachments
- Enhanced business insights dashboard
- Offline-first mode with service workers
- Multi-currency support
- Payment tracking integration
- Email sending integration

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- AI powered by Google Gemini
- Icons by Lucide

---

**Zero Invoice 2.0** - Professional invoicing, completely private, totally free.
