# Joyce POS

A modern, desktop-ready **Point of Sale (POS) and business management system** built with **React, Capacitor, SQLite, and Electron**.
---

## 🚀 Technology Stack

* **React** — Frontend application and UI
* **Capacitor** — Native application integration
* **SQLite** — Local database and persistent data storage
* **Electron** — Desktop application runtime
* **TypeScript / TSX** — Application logic and components
* **PDF Export** — End-of-Day report generation
* **WebUSB / Electron USB APIs** — Direct USB printer communication

### Architecture

```text
React UI
   │
   ├── Application State
   ├── Business Logic
   ├── Authentication
   ├── POS
   ├── Reports
   ├── Inventory
   └── Settings
          │
          ▼
      Capacitor
          │
          ▼
       SQLite
          │
          ▼
   Local Persistent Data

Electron
   │
   ├── Desktop Runtime
   ├── USB Permission Handling
   └── Direct USB Printer Support
```

---

# ✨ Features

## 🔐 Authentication & PIN Login

The application includes a dedicated login system.

Users access the dashboard using a PIN.

### Supported roles

* Administrator
* Cashier
* Staff

Role permissions control access to different areas of the application.

Administrators can configure which menus are available to each role.

---

# 🎨 Modern POS Design

Joyce POS uses a modern, elegant, and user-friendly interface.

### Dark Mode

* Deep black / dark surfaces
* Gold accents
* White text
* Muted secondary text
* Modern cards and tables
* Subtle borders and shadows

### Light Mode

* White and soft-gray surfaces
* Black text
* Gold accents
* Clean tables and cards
* Clear visual hierarchy

The interface prioritizes:

* Performance
* Readability
* Easy navigation
* Minimal clutter
* Responsive layouts
* Modern typography
* Consistent spacing
* Accessible controls

---

# 📊 Dashboard

The dashboard provides an overview of important business information.

It includes information such as:

* Sales
* Transactions
* Cash
* Payment information
* Expenses
* Allowances
* Commissions
* LD Commissions
* Net sales
* Register status
* Shift information

### Sales Trend

The sales trend calculation was fixed so that:

* Voided sales are excluded
* The chart uses actual sales values
* Chart scaling adjusts correctly according to the sales data

---

# 🕐 Start of Day

The application does **not automatically start the business day**.

The user must manually start the day from the sidebar.

### Start of Day workflow

```text
Login
   ↓
Dashboard
   ↓
Start of Day
   ↓
Enter Opening Cash
   ↓
Register Unlocked
   ↓
POS Available
```

If Start of Day has not been completed:

* POS/Register remains locked
* Sales cannot be processed
* The user must start the day manually

---

# 🛒 POS / Register

The POS module provides the main sales transaction interface.

Features include:

* Product search
* Product categories
* Product selection
* Product variants
* Quantity controls
* Cart management
* Discounts
* Payment processing
* Change calculation
* Transaction numbers
* Receipt generation
* Inventory deduction
* SQLite persistence

---

# 🧃 Product Variants

Products can have up to **20 variants**.

Each variant supports:

* Variant name
* Separate selling price

Example:

```text
Redhorse
 ├── Bottle
 └── Bucket
```

Variants share the inventory of their parent product.

For example:

```text
Redhorse Stock: 100

Bottle sold: 2
Bucket sold: 3

Remaining stock: 95
```

Selling a variant automatically deducts from the shared parent-product inventory.

Variant information is also saved with the sale.

---

# 📦 Inventory Management

An **Inventory** menu has been added to the sidebar.

Features include:

* View products
* View stock quantities
* Restock products
* Enter restock quantity
* Update shared inventory
* Track inventory changes
* Audit restocking activities

### Restocking

When a product is restocked:

```text
Current Stock
      +
Restock Quantity
      =
New Stock
```

Every restocking operation creates an audit log entry.

Inventory access is controlled through role permissions.

---

# 💰 Sales History

Sales History provides tools for reviewing previous transactions.

### Supported filters

* Daily
* Weekly
* Monthly
* Yearly
* Selected date
* Search by transaction
* Search by cashier

Additional actions:

* View receipt
* View active sales
* View void transactions
* Void eligible transactions

---

# 🚫 Void Transactions

Voiding a sale does **not delete the original transaction**.

Instead, the transaction is marked as:

```text
status = void
```

The system also records:

* `voidedAt`
* `voidedBy`

When a transaction is voided:

1. Sale status changes to `void`
2. Inventory is restored
3. Void information is recorded
4. Audit log entry is created

### Void permissions

* Administrator — allowed
* Cashier — allowed
* Staff — controlled by permissions

Records are retained permanently rather than being deleted.

---

# 💸 Expenses

Expenses are managed through a dedicated CRUD-style interface.

Each expense can contain:

* Date
* Category
* Description
* Payee
* Amount

### Expense Categories

Expense categories use a dropdown.

A `+` button allows users to create custom categories.

Categories are saved in Settings and persist across application restarts.

---

# 👨‍💼 Allowances

The system supports employee allowances.

Allowance records include:

* Date
* Employee
* Reason
* Amount

Allowance information is included in:

* Reports
* End-of-Day reports
* Financial summaries

---

# 💵 Commission

The system supports employee commissions.

Commission records include:

* Date
* Employee
* Commission Category
* Amount

Commission categories use a dropdown.

A `+` button allows custom commission categories to be created.

Categories are saved in Settings and persist across restarts.

Existing commission records remain readable even when category settings are changed.

---

# 💰 LD Commission

The system also supports LD Commissions.

Records include:

* Date
* Employee
* LD Commission Category
* Amount

LD Commission categories use a dropdown with a `+` button for creating custom categories.

Categories are stored in Settings and persist across application restarts.

Existing LD Commission records remain readable.

---

# 📈 Reports

The Reports section provides business data using structured rows and columns.

Available reports:

* Sales
* Void Transactions
* Expenses
* Allowance
* Commission
* LD Commission

### Report periods

Reports support:

* Daily
* Weekly
* Monthly
* Yearly

The reporting system uses the application's **business date consistently**, ensuring that daily filtering works correctly even with older ISO timestamp records.

---

# 📋 CRUD-Style Data Management

The application provides structured table-based interfaces for managing data.

Supported areas include:

* Products
* Employees
* Expenses
* Allowances
* Commissions
* LD Commissions
* Sales History

Tables provide a clear way to:

* View records
* Search records
* Filter records
* Add records
* Edit records where applicable
* Review historical information

---

# 🌙 End of Shift / End of Day

The End of Shift workflow was designed to prevent accidental register closure.

Clicking **End of Shift** opens a review modal instead of immediately closing the register.

The review includes:

* Sales
* Expenses
* Allowances
* Commission
* LD Commission
* Net Report
* Expected Cash
* Variance

Commission and LD Commission information is displayed only when enabled for the logged-in user's role permissions.

---

# 📊 Detailed End-of-Day Report

The End-of-Day report contains detailed financial information.

## Product Sales

The product section includes:

* Product name
* Quantity sold
* Total amount per product

It also includes:

* Total sales

The product summary appears in both:

* End-of-Day review modal
* Exported PDF

---

## Expense Details

The End-of-Day report includes an expense list containing:

| Field       | Description                       |
| ----------- | --------------------------------- |
| Category    | Expense category                  |
| Description | Expense details                   |
| Payee       | Person/business receiving payment |
| Amount      | Expense amount                    |

---

## Allowance Details

The allowance section includes:

| Field    | Description                  |
| -------- | ---------------------------- |
| Employee | Employee receiving allowance |
| Reason   | Allowance reason             |
| Amount   | Allowance amount             |

---

## Commission Details

The commission section includes:

| Field    | Description                   |
| -------- | ----------------------------- |
| Employee | Employee receiving commission |
| Category | Commission category           |
| Amount   | Commission amount             |

Commission details remain hidden when disabled through role permissions.

---

## LD Commission Details

The LD Commission section includes:

| Field    | Description                      |
| -------- | -------------------------------- |
| Employee | Employee receiving LD commission |
| Category | LD Commission category           |
| Amount   | LD Commission amount             |

LD Commission details remain hidden when disabled through role permissions.

---

# 🧮 End-of-Day Financial Summary

The final report includes:

```text
Total Sales
- Total Expenses
- Total Allowances
- Total Commission
- Total LD Commission
--------------------------------
Net Report
```

It also includes:

* Expected Cash
* Actual Cash
* Variance

The system calculates the expected cash based on the recorded business transactions.

---

# 📄 End-of-Day PDF Export

The End-of-Day review provides:

### Cancel

Returns to the application without closing the register.

### Proceed & Export PDF

The application:

1. Generates the End-of-Day report
2. Downloads the PDF
3. Uses the filename format:

```text
end-of-day-YYYY-MM-DD.pdf
```

4. Closes the shift after successful export

The PDF includes the detailed financial and product information shown in the End-of-Day review.

---

# 🔒 Role-Based Permissions

The application supports configurable role-based menu access.

Administrators can configure access for:

* Administrator
* Cashier
* Staff

Permissions can control access to menus such as:

* Dashboard
* POS
* Inventory
* Products
* Employees
* Sales History
* Expenses
* Allowance
* Commission
* LD Commission
* Reports
* Settings

Hidden menus are also protected from direct access.

### Financial privacy

Commission and LD Commission information is automatically hidden when the logged-in role does not have permission to access those modules.

---

# 👥 Employee Management

The Employee module allows employee records to be managed through the application.

Employee information is used by:

* Allowances
* Commissions
* LD Commissions
* Sales/cashier records
* Reports

The employee section uses a structured table and form-based workflow.

---

# 🧾 Receipt Printing

The application supports direct receipt printing.

Electron is used to provide desktop-level USB access.

Printing workflow:

```text
Complete Sale
     ↓
Payment
     ↓
Receipt
     ↓
Direct Print
     ↓
USB Printer
```

---

# 🖨️ USB Printer Support

Direct USB printing was implemented for the Electron application.

### USB detection

The application can:

1. Detect connected USB devices
2. Allow the user to select the printer
3. Store/use the selected device
4. Send raw USB printing data

---

# 🔧 USB Detection Fix

A USB detection issue was identified and fixed in the Electron main process.

### Root Cause

Electron sends USB devices using a payload containing:

```text
{
  deviceList: [...]
}
```

The application incorrectly treated the payload as a direct array.

Because of this, the USB device chooser could fail before properly displaying the connected printer.

### Fix

The application now:

* Correctly handles the Electron USB event payload
* Uses the correct `deviceList` structure
* Adds Electron USB permission handlers
* Preserves direct raw USB printing
* Supports `navigator.usb`
* Rebuilds the Electron application with the fix

---

# 🖨️ USB Printer Testing

To test USB printing:

1. Connect the printer using a **USB data cable**
2. Open **Settings**
3. Select **USB Printer**
4. Click **Detect USB Device**
5. Select the connected printer
6. Complete a sale
7. Click **Direct Print**

Make sure the previous Electron application is completely closed before launching the newly rebuilt application.

---

# ⚙️ Settings

Settings provide centralized application configuration.

Configured data includes:

* Expense categories
* Commission categories
* LD Commission categories
* Role permissions
* Application settings
* Other configurable POS options

Categories persist across application restarts.

---

# 🔄 Reset Data

The Settings reset function provides a controlled way to clear business transaction data.

Reset clears:

* Sales
* Expenses
* Allowances
* Commissions
* LD Commissions

The reset action:

1. Requires confirmation
2. Clears the selected business records
3. Creates an audit log entry

---

# 📝 Audit Logs

Important business actions are recorded through audit logs.

Examples include:

* Inventory restocking
* Sale voiding
* Data reset
* Other important administrative operations

Audit logging helps preserve a history of important changes.

---

# 🗄️ SQLite Database

The application uses SQLite for local persistent storage.

The database is responsible for storing application information such as:

* Users
* Employees
* Products
* Categories
* Product variants
* Sales
* Sale items
* Payments
* Shifts
* Expenses
* Allowances
* Commissions
* LD Commissions
* Settings
* Audit logs

The local database allows the POS to operate without depending on a remote server for its core business records.

---

# 📅 Business Date Handling

The reporting system uses the application's **business date** consistently.

This prevents inconsistencies caused by different timestamp formats.

Daily filtering works with:

* Current business-day records
* Older ISO timestamp records
* Selected dates
* Sales
* Voids
* Expenses
* Allowances
* Commissions
* LD Commissions

---

# 🧱 Application Structure

`App.tsx` remains focused on:

* Application state
* Business logic
* Application-level workflows

Feature-specific UI and functionality can be organized into reusable components/modules to keep the application maintainable.

---

# ➕ Record Creation Workflows

The application includes functional Add buttons for major record types.

### Add Product

Opens the Product form.

### Add Employee

Opens the Employee form.

### Add Expense

Opens the Expense form.

### Add Allowance

Opens the Allowance form.

### Add Commission

Opens the Commission form.

### Add LD Commission

Opens the LD Commission form.

Record sections also include date selectors where applicable.

---

# 🔄 Complete POS Workflow

The overall workflow is:

```text
Launch Application
        ↓
PIN Login
        ↓
Dashboard
        ↓
Register Locked
        ↓
Start of Day
        ↓
Opening Cash
        ↓
Register Unlocked
        ↓
POS
        ↓
Select Product / Variant
        ↓
Add to Cart
        ↓
Payment
        ↓
Calculate Change
        ↓
Save Sale to SQLite
        ↓
Deduct Inventory
        ↓
Print Receipt
        ↓
Continue Sales
        ↓
End of Shift
        ↓
Review End-of-Day Report
        ↓
Check Expected Cash
        ↓
Enter / Confirm Actual Cash
        ↓
Calculate Variance
        ↓
Export PDF
        ↓
Close Shift
        ↓
Register Locked
        ↓
Next Business Day
```

---

# 📊 Data Flow

A typical completed transaction follows this flow:

```text
Product
   ↓
Variant
   ↓
Cart
   ↓
Payment
   ↓
Sale
   ↓
Sale Items
   ↓
SQLite
   ├── Inventory deduction
   ├── Sales History
   ├── Reports
   └── End-of-Day Report
```

---

# 🛡️ Data Integrity

The application is designed to retain important historical information.

Examples:

* Voided sales are retained
* Void actions record who performed them
* Inventory changes create audit records
* Reset actions require confirmation
* Financial records are stored in SQLite
* Existing commission records remain readable
* Existing LD commission records remain readable

---

# ⚡ Performance

Performance is an important design priority.

The application aims to:

* Minimize unnecessary rendering
* Keep database operations efficient
* Avoid excessive animations
* Use lightweight UI components
* Keep tables responsive
* Avoid unnecessary dependencies
* Maintain fast POS transaction workflows
* Keep Electron desktop operation lightweight

---

# 🎯 Design Principles

Joyce POS follows these core principles:

### 1. User-Friendly

Common operations should require as few steps as possible.

### 2. Fast

POS transactions and data entry should feel immediate.

### 3. Reliable

Business records should be persisted correctly.

### 4. Traceable

Important changes should be recorded through audit logs.

### 5. Secure

Role permissions control access to sensitive functionality.

### 6. Modern

The interface follows a clean, contemporary POS design.

### 7. Consistent

The same design language is used throughout:

* Buttons
* Forms
* Tables
* Modals
* Cards
* Navigation
* Reports

---

# 📱 Platform

The project is built around:

```text
React
+
Capacitor
+
SQLite
+
Electron
```

The Electron build provides desktop functionality such as:

* USB device access
* Direct printer communication
* Desktop application packaging

Capacitor provides the native integration layer while SQLite provides local persistent storage.

---

# 🏗️ Development Notes

The project already has its development environment and dependencies configured.

Development should focus on:

* Extending existing functionality
* Reusing existing components
* Preserving current database behavior
* Maintaining existing records
* Avoiding unnecessary dependency changes
* Keeping business logic consistent
* Maintaining compatibility between React, Capacitor, SQLite, and Electron

When modifying existing functionality, existing data and workflows should be preserved unless a change explicitly requires otherwise.

---

# ✅ Current Feature Checklist

* [x] PIN Login
* [x] Role-Based Access
* [x] Dashboard
* [x] Manual Start of Day
* [x] Register Lock Before Start of Day
* [x] POS/Register
* [x] Product Management
* [x] Product Variants
* [x] Shared Variant Inventory
* [x] Inventory Management
* [x] Restocking
* [x] Sales History
* [x] Daily Sales Filtering
* [x] Weekly Sales Filtering
* [x] Monthly Sales Filtering
* [x] Yearly Sales Filtering
* [x] Selected-Date Filtering
* [x] Search Filtering
* [x] Void Transactions
* [x] Inventory Restoration After Void
* [x] Audit Logs
* [x] Expenses
* [x] Expense Categories
* [x] Allowances
* [x] Commission
* [x] Commission Categories
* [x] LD Commission
* [x] LD Commission Categories
* [x] Role-Based Financial Visibility
* [x] Reports
* [x] Daily Reports
* [x] Weekly Reports
* [x] Monthly Reports
* [x] Yearly Reports
* [x] End-of-Shift Review
* [x] End-of-Day Report
* [x] Product Sales Summary
* [x] Financial Detail Lists
* [x] Expected Cash
* [x] Cash Variance
* [x] PDF Export
* [x] Reset with Confirmation
* [x] Reset Audit Entry
* [x] Employee Management
* [x] Receipt Viewing
* [x] USB Printer Detection
* [x] Electron USB Permission Handling
* [x] Direct USB Printing
* [x] Dark Mode
* [x] Light Mode
* [x] SQLite Persistence
* [x] Capacitor Integration
* [x] Electron Desktop Application

---

# 🚀 Project Goal

Joyce POS is intended to provide a complete local POS workflow that combines:

**Sales + Inventory + Employees + Expenses + Allowances + Commissions + LD Commissions + Reporting + End-of-Day Processing + Receipt Printing**

in one modern application.

The system is designed around a reliable local-first workflow using **SQLite**, while **React** provides the user interface, **Capacitor** provides native integration

---

## 📌 Project Status

**Active Development**

Core POS, financial management, inventory, reporting, role permissions, End-of-Day processing, PDF reporting, and Electron USB printing functionality have been implemented and integrated.

The application has been validated through development/build testing, including the Electron USB printer fix and rebuilt desktop packages.
