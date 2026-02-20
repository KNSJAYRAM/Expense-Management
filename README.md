# Expense Management System

A comprehensive expense management system with multi-currency support, OCR integration, and flexible approval workflows built with Next.js and JavaScript.

##  Core Features

### Authentication & User Management
- **Role-based Access Control** - Admin, Manager, Employee roles with granular permissions
- **Company Auto-creation** - New companies created on first signup with country-specific currency
- **Manager Relationships** - Assign employees to managers for hierarchical approval workflows
- **User Management** - Create, update, delete, and manage user roles and relationships

### Multi-Currency Support
- **Global Currency Support** - Submit expenses in any currency worldwide
- **Real-time Conversion** - Automatic currency conversion to company's base currency
- **Exchange Rate APIs** - Integration with ExchangeRate-API and RestCountries API
- **Country-based Defaults** - Company currency automatically set based on country selection

### Expense Submission (Employee Role)
- **OCR Receipt Scanning** - Upload receipt images for automatic expense extraction
- **Auto-fill Forms** - OCR extracts amount, date, merchant, description, and category
- **Multi-currency Forms** - Submit expenses in any supported currency
- **Expense History** - View approved and rejected expenses

### Approval Workflow (Manager/Admin Role)
- **Multi-level Sequential Approvals** - Step 1 → Manager, Step 2 → Finance, Step 3 → Director
- **Approval Sequence Configuration** - Admins can define custom approval workflows
- **Manager Approver Toggle** - Employees can control whether manager approval is required
- **Approval Tracking** - Real-time approval status and step tracking

### Conditional Approval Flow
- **Percentage Rules** - e.g., "60% of approvers must approve"
- **Specific Approver Rules** - e.g., "CFO must approve"
- **Hybrid Rules** - e.g., "60% OR CFO approves"
- **Combined Workflows** - Support for both multiple approvers and conditional rules together

##  Quick Start

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
   - Login with demo credentials below

##  Demo Credentials

- **Admin:** admin@company.com / password123
- **Manager:** manager@company.com / password123
- **Employee:** employee@company.com / password123

##  API Endpoints

### Authentication
- `POST /api/auth/login` - User login with auto-company creation
- `POST /api/auth/signup` - User registration with country-based currency

### Currency & Countries
- `GET /api/currency?action=countries` - Get supported countries and currencies
- `GET /api/currency?action=rates&base=USD` - Get real-time exchange rates
- `GET /api/currency?action=convert&amount=100&from=USD&to=EUR` - Convert currency amounts

### OCR Processing
- `POST /api/ocr` - Process receipt image for expense extraction
- `GET /api/ocr?userId=123` - Get OCR processing results

##  Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** In-memory with localStorage persistence (demo purposes)
- **Authentication:** JWT tokens with role-based access
- **Currency APIs:** ExchangeRate-API, RestCountries API
- **OCR:** Mock implementation (ready for Google Vision, AWS Textract, Azure Computer Vision)
- **State Management:** React hooks and context
- **UI Components:** Custom components with Tailwind CSS

##  Key Features Demonstrated

### 1. **Complete Approval Workflow System**
- Multi-level sequential approvals (Manager → Finance → Director)
- Custom approval sequence configuration
- Conditional approval rules (percentage, specific approver, hybrid)
- Manager approver toggle control

### 2. **Advanced Expense Management**
- OCR receipt scanning with auto-fill
- Multi-currency support with real-time conversion
- Manager approval requirement toggle
- Comprehensive expense tracking and history

### 3. **Enterprise-Grade User Management**
- Role-based access control (Admin, Manager, Employee)
- Manager-employee relationship management
- User creation and role assignment
- Company auto-creation with country-based currency

### 4. **Flexible Approval Configuration**
- Create, edit, and delete approval rules
- Configure custom approval sequences
- Set amount-based approval thresholds
- Define percentage and specific approver requirements

##  Use Cases

- **Small to Medium Businesses** - Complete expense management solution
- **Enterprise Organizations** - Complex approval workflows and multi-currency support
- **Remote Teams** - OCR receipt processing and digital workflows
- **International Companies** - Multi-currency support and country-based settings
- **Compliance-focused Organizations** - Detailed approval tracking and audit trails

##  Configuration

### Setting Up Approval Sequences
1. Login as Admin
2. Navigate to "Approval Sequences"
3. Create custom workflows (e.g., Manager → Finance → Director)
4. Assign specific users to each step
5. Mark steps as required or optional

### Configuring Approval Rules
1. Go to "Approval Rules"
2. Create rules based on amount thresholds
3. Set percentage requirements or specific approvers
4. Configure auto-approval for low-value expenses

### Managing Users and Roles
1. Access "Manage Users"
2. Create employees and assign managers
3. Set appropriate roles (Admin, Manager, Employee)
4. Configure manager-employee relationships

##  Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Start development server:** `npm run dev`
4. **Access application:** http://localhost:3000
5. **Login with demo credentials**
6. **Explore all features and workflows**

Perfect for demonstrating modern expense management concepts, enterprise workflow design, and full-stack web development practices!

##  License

This project is for demonstration purposes. Feel free to use and modify as needed.
