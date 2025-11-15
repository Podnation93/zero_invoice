# Customer CRUD Components

This directory contains all components related to customer management in the Zero Invoice application.

## Components

### 1. CustomerList.tsx
The main customer listing component that displays all customers in a table format.

**Features:**
- Displays all customers with their details (name, email, phone, location, created date)
- Search functionality to filter customers by name, email, phone, or city
- Edit, view, and delete actions for each customer
- Confirmation modal before deletion
- Empty state handling

**Props:**
- `onEdit: (customer: Customer) => void` - Callback when edit button is clicked
- `onView: (customer: Customer) => void` - Callback when view button is clicked
- `onCreateNew: () => void` - Callback when create new customer button is clicked

### 2. CustomerForm.tsx
Modal form for creating and editing customers.

**Features:**
- Create new customers with UUID v4 ID generation
- Edit existing customer information
- Form validation using Zod schema from `src/utils/validation.ts`
- Real-time error display
- Separate sections for contact info and billing address
- Responsive layout

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `customer?: Customer | null` - Customer to edit (null for new customer)

### 3. CustomerProfile.tsx
Detailed customer profile view with analytics and invoice history.

**Features:**
- Complete customer contact information display
- Customer analytics dashboard showing:
  - Total revenue
  - Paid revenue
  - Pending revenue
  - Overdue revenue
  - Total invoices
  - Average invoice value
  - Payment rate percentage
- Full invoice history table with sorting
- Invoice status badges
- Edit customer action
- Back to list navigation

**Props:**
- `customer: Customer` - Customer to display
- `onBack: () => void` - Callback when back button is clicked
- `onEdit: (customer: Customer) => void` - Callback when edit button is clicked

### 4. CustomersPage.tsx
Main page component that orchestrates all customer components.

**Features:**
- Manages view state (list vs profile)
- Handles modal state for create/edit forms
- Coordinates navigation between components
- Single integration point for the customer module

**Usage:**
```tsx
import { CustomersPage } from './components/customers';

function App() {
  return <CustomersPage />;
}
```

## Data Flow

1. All components use the `useAppContext` hook to access and modify customer data
2. Customer data is persisted to localStorage via the context
3. Form validation uses the `customerSchema` from `src/utils/validation.ts`
4. Customer IDs are generated using UUID v4

## Common Components Used

- `Button` - Action buttons with variants (primary, secondary, danger, ghost)
- `Input` - Form input fields with validation errors
- `Modal` - Modal dialogs for forms and confirmations
- `Table` - Data table components (Table, TableHeader, TableBody, etc.)
- `Card` - Container cards for content sections
- `Badge` - Status badges for invoice states
- `Header` - Page header with title and actions

## Type Definitions

Customer types are defined in `src/types/customer.ts`:
- `Customer` - Full customer object
- `CustomerFormData` - Form data shape
- `Address` - Billing address structure

## Validation

Form validation is handled by Zod schemas in `src/utils/validation.ts`:
- Required fields: name, email, street, city, state, zipCode, country
- Optional fields: phone
- Email validation ensures proper email format
- All errors are displayed inline on the form

## Integration

To integrate the customer components into your application:

```tsx
import { CustomersPage } from './components/customers';

// In your main app or router
<CustomersPage />
```

Or use individual components:

```tsx
import { CustomerList, CustomerForm, CustomerProfile } from './components/customers';

// Manage state and orchestrate yourself
const [viewMode, setViewMode] = useState('list');
// ... rest of your implementation
```
