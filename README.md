# STACKLY SAP OneERP Cloud Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.143+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade commercial Cloud ERP & Financial Accounting (FICO) SaaS platform conforming to the STACKLY SAP OneERP Development Standard.

---

## 🌟 Key Features

- **Multi-Company Architecture**: Configure and isolate multiple legal entities with independent functional currencies, financial years, and Chart of Accounts.
- **Double-Entry General Ledger (FICO)**: Strict balanced journal entries (Total Debits = Total Credits) with posting controls and period locking.
- **Trial Balance & Financial Reporting**: Real-time Trial Balance equilibrium checking, Profit & Loss (P&L), and Balance Sheet generation.
- **Accounts Payable (AP)**: Supplier invoice lifecycle (Draft → Active → Partial → Paid) with 3-way matching and payment vouchers.
- **Accounts Receivable (AR)**: Customer billing, receivable aging, and cash inflow receipt recording.
- **Fixed Assets Register**: Asset capitalization, categories (IT, Machinery, Vehicles, Furniture), and straight-line depreciation ledger.
- **Budgeting & Variance Analysis**: Budget plan ceilings compared against actual ledger expenditures with visual variance indicators.
- **GST Compliance**: Automated statutory tax calculation (CGST, SGST, IGST) with HSN/SAC code tracking.
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with roles (`ADMIN`, `FINANCE_MANAGER`, `ACCOUNTANT`).
- **Modern React SPA Frontend**: Built with React 18, Vite, and Tailwind CSS featuring Dark/Light mode, interactive analytics charts, quick module search (`Ctrl+K`), and 1-click CSV export.

---

## 🏗️ Architecture

```
SAPONE_ERP/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/        # Company, Financial Year, Accounts, Journals, Subledgers, Reports, Auth
│   │   │   └── dependencies.py# JWT Auth & RBAC dependencies
│   │   ├── core/              # Config, Security (bcrypt/JWT), Logging
│   │   ├── db/                # SQLAlchemy database session & initialization
│   │   ├── models/            # Company, FiscalYear, Account, JournalEntry, Subledgers, User
│   │   ├── repositories/      # Database query abstraction layer
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Pure business logic layer
│   │   └── utils/             # Standardized API response wrappers & custom exceptions
│   ├── scripts/               # Sample data seeding scripts
│   ├── tests/                 # Full platform verification test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # React components (Dashboard, AP, AR, Ledger, etc.)
│   │   └── utils/             # CSV export & formatters
│   ├── dist/                  # Production-compiled assets served by FastAPI
│   ├── package.json
│   └── tailwind.config.js
├── run.py                     # Unified platform launcher
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- MySQL Server 8.0+
- Node.js 18+ (optional, only needed for modifying frontend code)

### 1. Database Configuration
Create the database in MySQL:
```sql
CREATE DATABASE sapone_erp;
```
Ensure database credentials in `backend/app/core/config.py` match your MySQL setup:
```env
DB_USER=root
DB_PASSWORD=mysql@2026
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sapone_erp
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Run Platform
```bash
python run.py
```
- 🌐 **Full Web Application**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- 📖 **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ❤️ **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

**Default Demo Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

---

## 🧪 Running Tests
```bash
python backend/tests/test_full_platform.py
```

---

## 📜 License
This project is licensed under the MIT License.
