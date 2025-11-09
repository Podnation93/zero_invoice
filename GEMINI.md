# Design Document for zero_invoice

## 1. Objective

Create a detailed design document for `zero_invoice`, a local-first invoicing, expense, payroll, and tax reporting application for Windows. The application will replicate the core functionalities of Xero, with a focus on local data storage, import/export capabilities, and user-friendly interface design.

## 2. Application Type

The application will be a **self-hosted web-based application** running locally via a bundled web server. This provides cross-platform compatibility and a modern UI using web technologies.

*   **Backend:** Node.js with Express.js
*   **Frontend:** React
*   **Database:** SQLite for local data storage.

## 3. Data Storage & Management

*   **Local Storage:** All application data (invoices, expenses, payroll records, contact information, item lists, reports) will be stored locally in a SQLite database file (`database.db`).
*   **Import/Export:**
    *   **Import:** A mechanism will be provided to import data from CSV files into the `zero_invoice` format.
    *   **Export:** All application data will be exportable to CSV, JSON, and XML formats for backup or migration.
*   **Backup:**
    *   **Local Backup:** A feature to back up the SQLite database to a specified folder with timestamped archives.
    *   **External Backup:** Functionality to export backups to an external storage device (e.g., USB drive).
    *   **Cloud Sync:** Integration points for cloud storage synchronization (e.g., direct upload to Google Drive, Dropbox, or a user-configured WebDAV endpoint).

## 4. Core Feature Areas

### 4.1. Invoicing & Quotes (Getting Paid)

*   **Invoice Customization:**
    *   Upload company logo.
    *   Create and manage multiple invoice templates/themes.
    *   Set and apply default payment terms.
    *   Configure and display bank account details on invoices.
*   **Invoice Creation Process:**
    *   **Contact Management:** Auto-completion for customer names from a local contact list.
    *   **Saved "Items":** Database for pre-saved products/services.
    *   **Automatic Calculations:** Real-time calculation of totals, discounts, sub-totals, and GST.
    *   **Background Accounting:** Automatic assignment of line items to user-defined "Accounts".
*   **Automation & Tracking:**
    *   **Emailing:** Generate a PDF of the invoice to be attached to an email.
    *   **Online Payments:** Placeholder for "Pay Now" buttons (linking to external payment services).
    *   **Invoice Status Tracking:** "Draft," "Sent," "Viewed," "Partially Paid," "Paid," "Overdue."
    *   **Automated Reminders:** Configuration for automated overdue reminders.
    *   **Repeating Invoices:** Setup for recurring invoices.
*   **Quotes:**
    *   Quote creation interface.
    *   "Copy to Invoice" functionality.

### 4.2. Expenses, Bills & Receipt Capture (Managing Spending)

*   **Managing Bills (Accounts Payable):**
    *   Interface for entering supplier bills.
    *   Dashboard view for "Bills You Need to Pay."
    *   Matching bank feed payments to bills.
    *   Placeholder for "Batch Payments."
*   **Hubdoc-like Receipt & Bill Automation:**
    *   Attach digital receipts/bills to expense records.
    *   Manual data entry from attached documents.
    *   Automatic creation of draft expense/bill entries.
*   **Expense Claims (for Staff):**
    *   Interface for employees to submit expense claims.
    *   Approval workflow for expense claims.

### 4.3. Payroll & Super (Australia-Specific)

*   **Pay Runs:**
    *   Employee setup (pay rate, TFN, bank, super fund, leave entitlements).
    *   Automated calculation of gross pay, PAYG, super, leave accrual, and deductions.
*   **Single Touch Payroll (STP):**
    *   Placeholder for STP reporting.
*   **Superannuation:**
    *   Automatic calculation of super.
    *   "Auto Super" feature.
*   **Employee Self-Service (Xero Me App Equivalent):**
    *   View payslips, leave balances, and submit leave requests.
    *   Timesheet entry and approval process.

### 4.4. Tax Reports

*   **Business Activity Statement (BAS) Report:**
    *   Generate a report summarizing GST collected and paid.
*   **Profit & Loss (P&L) Report:**
    *   Generate a P&L report based on income and expense accounts.
*   **GST Reconciliation Report:**
    *   Detailed report listing all transactions included in BAS calculations.
*   **Payroll Reports:**
    *   Reports showing total Gross Wages and PAYG Withholding.

## 5. User Interface (UI) / User Experience (UX) Considerations

*   Intuitive navigation.
*   Clear, concise forms.
*   Visual dashboards.
*   Consistent design language.

## 6. Technical Considerations

*   **Backend:** Node.js/Express
*   **Frontend:** React
*   **Database:** SQLite

## 7. Deliverables

*   A high-level architectural overview.
*   Detailed descriptions of each feature area's functionality and user flow.
*   Mockups or wireframes for key screens.
*   Visual representations of the app's dashboard and icons.

# Building and Running

**1. Install Dependencies:**

To install the backend dependencies, run the following command in the root directory:

```bash
npm install
```

To install the frontend dependencies, navigate to the `client` directory and run:

```bash
cd client
npm install
```

**2. Running the Application:**

*   **Backend:** To start the backend server, run the following command in the root directory:

```bash
npm start
```

*   **Frontend:** To start the frontend development server, navigate to the `client` directory and run:

```bash
npm start
```

# Version Control

This project uses Git for version control. At each stage of development, relevant commits should be made to the project's GitHub repository.

**Committing Changes:**

After making changes, use the following commands to commit them:

```bash
git add .
git commit -m "Your descriptive commit message"
git push
```
