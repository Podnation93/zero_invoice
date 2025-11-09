# Design Document for zero_invoice

## 1. Objective

Create a detailed design document for `zero_invoice`, a local-first invoicing, expense, payroll, and tax reporting application for Windows. The application aims to replicate the core functionalities of Xero, with a strong emphasis on local data storage, robust import/export capabilities, and an intuitive, user-friendly interface design.

## 2. Application Type & Technical Stack

The application will be delivered as a self-hosted web-based application, bundled to run locally via an integrated web server. This approach offers several advantages, including cross-platform compatibility (though initially targeting Windows), ease of deployment, and the ability to leverage modern web development tools for a rich user experience.

*   **Backend:** Node.js with Express.js for API services and server-side logic.
*   **Frontend:** React (with Create React App for initial setup) for building a dynamic and responsive user interface.
*   **Database:** SQLite, chosen for its serverless, zero-configuration, and self-contained nature, ideal for local data storage in a single file (`database.db`).

## 3. Data Storage & Management
### 3.1. Local Storage

*   All application data—including invoices, quotes, expenses, bills, payroll records, contact information, item lists, user-defined accounts, and generated reports—will be persistently stored in a single SQLite database file (`database.db`).
*   The `database.db` file will be located within a designated application data directory (e.g., `%APPDATA%/zero_invoice` on Windows), ensuring user data is separate from application binaries and persists across updates.
*   **Schema Design:** A detailed ERD (Entity-Relationship Diagram) will be created to define tables for Users, Contacts, Items, Invoices, InvoiceLineItems, Quotes, QuoteLineItems, Bills, BillLineItems, Expenses, ExpenseLineItems, Employees, PayRuns, Timesheets, Accounts, Settings, and Attachments.

### 3.2. Import/Export

*   **Import Functionality:**
    *   **Supported Formats:** CSV, JSON.
    *   **Data Types:** Users will be able to import Contacts, Items, and historical Invoices and Bills.
    *   **Process:** A guided wizard will assist users in mapping columns from their import file to `zero_invoice`'s database fields. Error handling and preview capabilities will be included.
*   **Export Functionality:**
    *   **Supported Formats:** CSV, JSON, XML, PDF (for reports and individual documents).
    *   **Data Types:** Comprehensive export of all application data, including Contacts, Items, Invoices, Bills, Expenses, Payroll Records, and Reports.
    *   **Purpose:** Facilitates data migration, external analysis, and robust backups.

### 3.3. Backup & Cloud Synchronization

*   **Local Backup:**
    *   **Mechanism:** Users can initiate manual backups of the entire SQLite database file (`database.db`) to a user-specified local folder.
    *   **Naming Convention:** Backups will be timestamped (e.g., `zero_invoice_backup_YYYYMMDD_HHMMSS.db`).
    *   **Scheduled Backups:** Option to configure automatic daily/weekly backups to a local directory.
*   **External Backup:**
    *   **Target:** Direct export of database backups or selected data to an external storage device (e.g., USB drive). The application will prompt the user to select a destination path.
*   **Cloud Synchronization (Integration Points):**
    *   **Strategy:** Provide generic integration points rather than direct API integrations to specific cloud providers to maintain the "local-first" philosophy and reduce external dependencies.
    *   **Mechanism:** Users can configure a designated local folder to be automatically synchronized with their preferred cloud storage solution (e.g., Google Drive, Dropbox, OneDrive, or a custom WebDAV endpoint) using external client applications. `zero_invoice` will facilitate this by allowing the local backup directory to be set within a cloud sync folder.
    *   **Future Enhancement:** Consider basic OAuth2 flows for direct integration with major cloud providers if requested, ensuring data encryption at rest and in transit.

## 4. Core Feature Areas
### 4.1. Invoicing & Quotes (Getting Paid)

*   **Invoice Customization:**
    *   **Logo Upload:** UI for uploading and managing a company logo (stored locally, referenced in templates).
    *   **Templates/Themes:**
        *   Pre-built templates with customizable elements (fonts, colors, layout sections).
        *   Ability to create, save, and manage multiple custom invoice and quote templates (e.g., for different services or branding).
        *   Preview functionality for templates.
    *   **Payment Terms:** Global default payment terms, with override options per invoice. Xero-like automatic due date calculation.
    *   **Bank Details:** Configuration screen for multiple bank accounts, with selection available per invoice.
*   **Invoice Creation Process:**
    *   **Contact Management:** Centralized Contacts module. Auto-completion and creation of new contacts directly from invoice creation.
    *   **Saved "Items":** Dedicated Items module (products/services). Auto-fill description, unit price, tax rate, and associated Account upon item selection.
    *   **Dynamic Calculations:** Real-time calculation of line item totals, sub-totals, discounts (percentage or fixed amount), tax (GST/VAT configurable), and grand total.
    *   **Background Accounting:** Each line item is assigned to a Chart of Accounts (CoA) entry (e.g., "400 - Sales"). This linkage automatically updates ledger entries and financial reports (P&L, Balance Sheet).
*   **Automation & Tracking:**
    *   **Emailing:** Generates a professional PDF invoice. Option to compose an email within the app (using a system default mail client) with the PDF attached, or save the PDF for manual attachment.
    *   **Online Payments (Placeholder):** Input field for users to add a custom "Pay Now" button URL (e.g., Stripe, PayPal link) to the invoice PDF or a web view (if online invoicing is a future feature).
    *   **Invoice Status Tracking:** Lifecycle states: Draft -> Awaiting Approval -> Awaiting Payment -> Partially Paid -> Paid -> Overdue. Visual indicators on invoice lists.
    *   **Automated Reminders:** Configurable rules for sending overdue reminders (e.g., 7 days, 14 days overdue). Reminders can be set to generate email drafts.
    *   **Repeating Invoices:** Define schedules (daily, weekly, monthly, annually) for automatic invoice generation and status updates.
*   **Quotes:**
    *   **Creation Interface:** Identical to invoice creation for consistency.
    *   **Status Tracking:** Draft -> Sent -> Accepted -> Declined.
    *   **"Copy to Invoice" Functionality:** One-click conversion of an accepted quote into a draft invoice, preserving all details.

### 4.2. Expenses, Bills & Receipt Capture (Managing Spending)

*   **Managing Bills (Accounts Payable):**
    *   **Bill Entry Interface:** Input fields for Supplier (Contact), Date, Due Date, Reference, Line Items (matching Items or free text), Account allocation, Tax.
    *   **Dashboard View:** Visual summary of "Bills You Need to Pay," categorized by due date (Today, Next 7 Days, Next 30 Days) with total amounts.
    *   **Payment Matching:** Manual process to mark bills as "Paid" and link them to bank transactions (simulated bank feed).
    *   **Batch Payments (Placeholder):** Option to select multiple bills and generate a CSV or ABA file for bulk payment via online banking.
*   **Hubdoc-like Receipt & Bill Automation:**
    *   **Attachment:** Users can upload image (JPG, PNG) or PDF files directly to expense or bill records.
    *   **Manual Data Entry/Verification:** Interface to view the attached document side-by-side with data entry fields. Users manually extract and input Supplier, Date, Total Amount, and Tax from the document.
    *   **Draft Creation:** Attaching a receipt can automatically create a new draft expense/bill entry, prompting the user for details.
*   **Expense Claims (for Staff):**
    *   **Submission Interface:** Employees (or the primary user for personal reimbursements) can submit expense claims with details (description, amount, date, Account) and attach receipt images.
    *   **Approval Workflow:** Claims appear in a dedicated "Awaiting Approval" list for a manager (the main user) to review, approve, or decline.
    *   **Reimbursement:** Approved claims can be marked as reimbursed, linking to a payment transaction.

### 4.3. Payroll & Super (Australia-Specific)

*   **Employee Management:**
    *   Comprehensive employee profiles: personal details, TFN, bank details, super fund details, pay rates (hourly/salary), leave entitlements (annual, sick).
    *   Pay Item setup: Define regular earnings, allowances, deductions.
*   **Pay Runs:**
    *   **Creation Wizard:** Step-by-step process to generate a pay run for a selected period.
    *   **Automated Calculations:** Based on employee setup and timesheet data (if applicable), automatically calculates:
        *   Gross Pay
        *   PAYG Tax Withholding (based on ATO tables, updated periodically).
        *   Superannuation (SGC rate, configurable).
        *   Leave Accrual and Deductions.
    *   **Payslip Generation:** Generates individual payslips (PDF) for each employee.
*   **Single Touch Payroll (STP):**
    *   **Reporting (Placeholder):** A dedicated section to generate STP-compliant reports (e.g., CSV, JSON) ready for manual upload to the ATO portal or for accountant processing. Direct API integration is out of scope for the initial local-first version but considered for future.
*   **Superannuation:**
    *   **Calculation:** Automatic calculation of superannuation guarantee contributions for each employee.
    *   **"Auto Super" (Placeholder):** Feature to generate a "SuperStream" compliant payment file (e.g., CSV or XML) that can be uploaded to a clearing house or super fund portal, consolidating all employee super payments.
*   **Employee Self-Service (Xero Me App Equivalent):**
    *   **User Portal:** A separate, simplified interface or read-only views for employees to access their information.
    *   **Payslip Access:** View and download current and historical payslips.
    *   **Leave Management:** View leave balances (annual, sick, RDO) and submit leave requests.
    *   **Timesheets:** Interface for employees to submit weekly/fortnightly timesheets, which then flow into pay runs for approval.

### 4.4. Tax Reports

*   **Business Activity Statement (BAS) Report:**
    *   **Generation:** Selectable reporting periods (monthly, quarterly).
    *   **Content:** Auto-calculates and displays GST Collected (1A), GST Paid (1B), W1 (Gross Wages), W2 (PAYG Withholding), and other BAS-relevant fields in a format mirroring the official ATO form.
    *   **Drill-down:** Ability to click on figures to view underlying transactions.
*   **Profit & Loss (P&L) Report:**
    *   **Generation:** Configurable date ranges (e.g., YTD, last quarter, custom dates).
    *   **Content:** Displays Total Income (from sales accounts) minus Total Expenses (from bill/expense accounts) to show Net Profit/Loss.
    *   **Account Grouping:** Hierarchical display of accounts for better readability.
*   **GST Reconciliation Report:**
    *   **Purpose:** Detailed breakdown of every transaction contributing to the BAS GST figures.
    *   **Content:** Lists individual invoices, bills, and expenses, showing the GST component, date, and associated Account. Essential for auditing and issue resolution.
*   **Payroll Reports:**
    *   **Types:**
        *   Total Gross Wages and PAYG Withholding by period.
        *   Superannuation liability report.
        *   Leave liability report.
        *   Employee summary reports.

## 5. User Interface (UI) / User Experience (UX) Considerations

*   **Navigation:** Clean, intuitive sidebar navigation with clear labels for main modules (Dashboard, Invoices & Quotes, Bills & Expenses, Payroll, Reports, Contacts, Settings).
*   **Forms & Data Entry:**
    *   Minimalist design, clear labels, and logical flow.
    *   Inline validation and helpful error messages.
    *   Keyboard navigation support.
*   **Dashboards:**
    *   **Main Dashboard:** (As per provided image) Overview of Cash Flow, Account Balance, Profit YTD, Total Owed To You, Total You Owe. Visual charts for Bills/Invoices due, recent activity, upcoming pay runs.
    *   **Module-Specific Dashboards:** Summaries within each module (e.g., Invoices due soon, Expense claims awaiting approval).
*   **Consistent Design Language:**
    *   Utilize a modern, flat UI design with a consistent color palette and typography.
    *   Responsive design for potential future web-browser use cases, even if locally hosted.
    *   Use of common UI component libraries (e.g., Material-UI, Ant Design) for React to ensure consistency and speed development.
*   **Accessibility:** Adhere to basic accessibility standards for screen readers and keyboard navigation.

## 6. Technical Considerations

*   **Backend (Node.js/Express):**
    *   **API Design:** RESTful API design with clear endpoints for each resource (e.g., `/api/invoices`, `/api/contacts`).
    *   **Authentication/Authorization:** Simple local user authentication for the self-hosted instance. No external user management.
    *   **Error Handling:** Robust error handling and logging for debugging.
    *   **Configuration:** External configuration file for server port, database path, etc.
*   **Frontend (React):**
    *   **State Management:** Context API or Redux for managing application state.
    *   **Routing:** React Router for client-side navigation.
    *   **Data Fetching:** Axios or Fetch API for interacting with the Express backend.
    *   **Bundling:** Webpack (via Create React App) for building and optimizing frontend assets.
*   **Database (SQLite):**
    *   **ORM:** Sequelize or Knex.js for database interactions to provide an abstraction layer and simplify data management.
    *   **Migrations:** Database migration scripts to manage schema changes over time.
*   **Bundling for Windows (.exe):**
    *   Utilize tools like Electron or NW.js to package the Node.js backend and React frontend into a single, self-contained Windows executable. This would encapsulate the web server and browser, making it feel like a native application.
*   **6.5. Security Considerations:**
    *   **Data Encryption (at rest):** While SQLite does not offer native encryption, the application will recommend the use of OS-level disk encryption (e.g., BitLocker on Windows) for the host machine where `database.db` resides. Future consideration may include exploring SQLCipher or similar SQLite encryption extensions if higher security demands arise.
    *   **Input Validation:** Implement robust server-side and client-side input validation to guard against common web vulnerabilities such as SQL injection (mitigated by ORM usage but still critical for direct inputs) and Cross-Site Scripting (XSS).
    *   **User Authentication:** For the local user authentication system, implement strong password hashing using a library like `bcrypt` to securely store user credentials.
    *   **Access Control:** If different user roles are introduced (e.g., primary user, employee for expense claims), implement Role-Based Access Control (RBAC) to ensure users only access authorized features and data.
*   **6.6. Testing Strategy:**
    *   **Unit Tests:** Develop unit tests for individual functions, modules, and components across both backend (API endpoints, service logic) and frontend (React components, utility functions).
        *   **Tools:** Jest (for JavaScript/Node.js), React Testing Library (for React components).
    *   **Integration Tests:** Create integration tests to verify that different parts of the application interact correctly (e.g., testing a full invoice creation flow from UI interaction to database persistence).
        *   **Tools:** Supertest (for backend API testing), Cypress or Playwright (for end-to-end frontend testing).
    *   **User Acceptance Testing (UAT):** Outline the importance of engaging potential end-users or stakeholders in testing to validate that the application meets business requirements and user expectations.

## 7. Deliverables

*   **Architectural Overview:** Diagram illustrating the client-server architecture, data flow, and database structure.
*   **Detailed Feature Descriptions:** Comprehensive write-up for each feature, including user stories, expected behavior, and validation rules.
*   **Database Schema (ERD):** Detailed Entity-Relationship Diagram for all tables and their relationships.
*   **API Documentation:** Swagger/OpenAPI specification for all backend API endpoints.
*   **UI/UX Mockups/Wireframes:**
    *   Dashboard
    *   Invoice Creation Form
    *   Bills List
    *   Employee Payroll Setup
    *   BAS Report Viewer
*   **Visual Assets:**
    *   Application Icon
    *   Dashboard Visual (as provided)
    *   Local Data Storage Icon (as provided)
    *   Backup to USB Icon (as provided)
    *   Cloud Export Icon (as provided)
*   **Security Assessment Report (Planned):** A document outlining potential security vulnerabilities identified during design and development, along with proposed mitigation strategies.
*   **Test Plan & Coverage Report:** Documentation detailing the testing strategy, specific test cases, and metrics on code coverage for different testing layers.

## 8. Future Enhancements

This section outlines potential features and capabilities that could be considered for future development beyond the initial scope.

*   **Multi-User Support:** Implement a robust multi-user system allowing multiple local users to access the application with configurable role-based permissions.
*   **Bank Feed Integration:** Securely connect to bank accounts via APIs (e.g., Open Banking standards) to automatically import transactions for reconciliation, reducing manual data entry.
*   **Advanced Reporting:** Develop more complex financial reports, including a full Balance Sheet and Cash Flow Statement, and introduce a customizable report builder for tailored insights.
*   **Budgeting & Forecasting:** Integrate tools for financial planning, allowing users to set budgets, track actuals against budgets, and create financial forecasts.
*   **Mobile App Companion:** Develop a simplified mobile application (iOS/Android) for on-the-go functionalities such as receipt capture, expense claims, and quick views of key financial metrics.
*   **Direct ATO/Tax Office Lodgement:** Full integration with government tax APIs (e.g., ATO's SBR) for direct lodgement of BAS, STP reports, and other tax documents, enhancing compliance automation.

# Building and Running zero_invoice

This section outlines the necessary steps to set up and run the `zero_invoice` application from source.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js:** (LTS version recommended) - Includes `npm` (Node Package Manager). Download from [nodejs.org](https://nodejs.org).
*   **Git:** For cloning the repository. Download from [git-scm.com](https://git-scm.com).

## 2. Project Setup

### 2.1. Clone the Repository:

Open your terminal or command prompt and clone the `zero_invoice` repository:
```bash
git clone https://github.com/Podnation93/zero_invoice.git
cd zero_invoice
```

### 2.2. Install Backend Dependencies:

Navigate to the root directory of the cloned project (where `package.json` for the backend is located) and install the Node.js dependencies:
```bash
npm install
```

### 2.3. Install Frontend Dependencies:

The frontend (React application) resides in the `client` subdirectory. Navigate into this directory and install its dependencies:
```bash
cd client
npm install
cd .. # Navigate back to the root directory
```

## 3. Running the Application

`zero_invoice` consists of two main parts: the backend API server and the frontend user interface. Both need to be running for the application to function correctly.

### 3.1. Start the Backend Server:

In your terminal, from the root directory of the project, run:
```bash
npm start
```

This will start the Express.js server, which will host the API and manage the SQLite database. By default, it will run on `http://localhost:5000` (or another port if configured).

### 3.2. Start the Frontend Development Server:

Open a new terminal window/tab. Navigate to the `client` directory of the project:
```bash
cd client
npm start
```

This will start the React development server. It will automatically open `http://localhost:3000` (or another port) in your web browser, where you can interact with the `zero_invoice` application. The frontend development server includes hot-reloading for a smoother development experience.

**Note:** For a production-ready, bundled `.exe` application, a different build and packaging process (e.g., using Electron) would be used, which would launch both components automatically. The `npm start` commands are primarily for development.

## 4. Version Control and Contributions

This project uses Git for version control. The remote repository is located at:
`https://github.com/Podnation93/zero_invoice.git`

### 4.1. Committing Changes:

After making modifications to the codebase, use the following standard Git commands to track and commit your changes:
```bash
git add . # Stages all changes in the current directory and its subdirectories
git commit -m "Your descriptive commit message" # Records the changes with a concise message
git push # Uploads your committed changes to the remote repository
```

**Commit Message Best Practices:**

*   Use the imperative mood ("Add feature" instead of "Added feature").
*   Keep messages concise but informative.
*   Reference issue numbers if applicable (e.g., "Fix #123: Resolve invoice calculation error").

### 4.2. README.md Updates:

The `README.md` file in the root of the project is crucial for providing up-to-date information about the project. It should be updated with each significant commit to reflect:

*   New features implemented.
*   Changes to the setup or running instructions.
*   Important bug fixes.
*   Current status of the project or upcoming goals.
*   Any new dependencies or configuration requirements.

**Example README.md update for a new feature:**
```markdown
# zero_invoice

## Current Status: Invoicing & Basic Expenses Implemented

### New Features:
-   **Invoice Customization:** Added logo upload and custom template support.
-   **Basic Expense Entry:** Users can now record supplier bills and attach receipts.

### Upcoming:
-   Automated overdue reminders for invoices.
-   Payroll module initial setup.
```

# Development Notes

This section documents any issues encountered during development and the workarounds used.

*   **Create React App:** The `npx create-react-app client` command was repeatedly cancelled by the environment's safety mechanisms. To work around this, the React application was set up manually by creating the necessary directories and files, and then installing the `react`, `react-dom`, and `react-scripts` dependencies.

*   **Interactive Commands:** Interactive commands like `npm start` are blocked by the environment. To start the backend and frontend servers, the `Start-Process` command in PowerShell is used to run the servers as background processes.
    *   **Backend:** `Start-Process node index.js`
    *   **Frontend:** `Start-Process npm start` (in the `client` directory)

## Current Progress

*   **Project Setup:**
    *   Backend initialized with Node.js, Express, and SQLite.
    *   Frontend React application manually set up.
    *   `GEMINI.md` and `README.md` established for documentation and project tracking.
*   **Invoicing Module:**
    *   Database schema for invoices and invoice line items created.
    *   Backend API endpoints (CRUD) for invoices implemented.
    *   Frontend UI for displaying, creating, updating, and deleting invoices implemented.
*   **Quotes Module:**
    *   Database schema for quotes and quote line items created.
    *   Backend API endpoints (CRUD) for quotes implemented.
    *   Frontend UI for displaying, creating, updating, and deleting quotes implemented.

---
**Reminder to Self:** Always update this `GEMINI.md` file to reflect the latest project status and any significant development notes.
