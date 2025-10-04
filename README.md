# Advanced Expense Management System

A comprehensive expense management system with multi-currency support, OCR integration, and advanced approval workflows built with Next.js and JavaScript.

## Core Features

### Authentication & User Management

- **Role-based Access Control** - Admin, Manager, Employee roles with proper permissions
- **Company Auto-creation** - New companies created on first signup with country-specific currency
- **Manager Relationships** - Assign employees to managers for approval workflows
- **User Management** - Create, update, and manage user roles and relationships

### Multi-Currency Support

- **Global Currency Support** - Submit expenses in any currency
- **Real-time Conversion** - Automatic currency conversion to company's base currency
- **Exchange Rate APIs** - Integration with currency conversion services
- **Country-based Defaults** - Company currency set based on country selection

### Advanced Expense Submission

- **OCR Receipt Scanning** - Upload receipt images for automatic expense extraction
- **Auto-fill Forms** - OCR extracts amount, date, merchant, description, and category
- **Multi-currency Forms** - Submit expenses in any supported currency
- **Receipt Processing** - Smart receipt analysis with confidence scoring

### Advanced Approval Workflows

- **Multi-level Approvals** - Sequential approval chains (Manager → Finance → Director)
- **Conditional Rules** - Percentage-based and specific approver rules
- **Hybrid Approval** - Combine percentage and specific approver requirements
- **Amount-based Rules** - Different approval flows based on expense amounts
- **Approval Tracking** - Real-time approval status and step tracking

### Approval Rule Types

- **Percentage Rules** - e.g., "60% of approvers must approve"
- **Specific Approver Rules** - e.g., "CFO must approve"
- **Hybrid Rules** - e.g., "60% OR CFO approves"
- **Amount Thresholds** - Different rules for different expense amounts

### Role Permissions

- **Admin** - Full system access, user management, rule configuration, override approvals
- **Manager** - Approve/reject expenses, view team expenses, manage approval workflows
- **Employee** - Submit expenses, view own expenses, check approval status

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open: http://localhost:3000
   - Login with: admin@company.com / password123

## Demo Credentials

- **Admin:** admin@company.com / password123
- **Manager:** manager@company.com / password123
- **Employee:** employee@company.com / password123

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Currency & Countries

- `GET /api/currency?action=countries` - Get supported countries
- `GET /api/currency?action=rates&base=USD` - Get exchange rates
- `GET /api/currency?action=convert&amount=100&from=USD&to=EUR` - Convert currency

### Expenses

- `POST /api/expenses` - Submit new expense
- `GET /api/expenses?userId=123&companyId=456` - Get user expenses

### Approvals

- `GET /api/approvals?approverId=123&companyId=456` - Get pending approvals
- `POST /api/approvals` - Process approval/rejection

### Approval Rules

- `GET /api/approval-rules?companyId=456` - Get approval rules
- `POST /api/approval-rules` - Create approval rule
- `PUT /api/approval-rules` - Update approval rule

### OCR Processing

- `POST /api/ocr` - Process receipt image
- `GET /api/ocr?userId=123` - Get OCR results

### Users

- `GET /api/users?companyId=456` - Get company users

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** In-memory (for demo purposes)
- **Authentication:** JWT tokens
- **Currency APIs:** ExchangeRate-API, RestCountries API
- **OCR:** Mock implementation (ready for Google Vision, AWS Textract, etc.)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/auth/          # Authentication endpoints
│   ├── dashboard/         # Main dashboard page
│   └── page.jsx          # Login/signup page
├── components/            # React components
│   ├── Header.jsx        # Navigation header
│   ├── Sidebar.jsx       # Navigation sidebar
│   ├── ExpenseForm.jsx   # Expense submission form
│   ├── ExpenseList.jsx   # Expense listing
│   ├── ApprovalList.jsx  # Approval management
│   ├── UserManagement.jsx # User management
│   └── ApprovalRules.jsx # Approval rules
└── lib/                  # Utility libraries
    ├── db.js            # Database operations
    └── auth.js         # Authentication utilities
```

## Key Features Demonstrated

1. **Role-Based Access Control** - Different views for Admin/Manager/Employee
2. **Expense Workflow** - Submit → Approve → Track
3. **User Management** - Create users and assign roles
4. **Approval Rules** - Configure approval requirements
5. **Clean UI** - Modern, responsive design

Perfect for demonstrating expense management concepts and modern web development practices!
