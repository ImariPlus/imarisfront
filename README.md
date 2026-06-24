# Imari+

Imari+ is a clinic finance and operations management system designed to help small and medium-sized healthcare facilities manage their day-to-day financial activities in a centralized platform.

The system aims to simplify financial workflows by providing tools for transaction tracking, expense management, payroll administration, and operational reporting.

## Features

### Current Features

- User authentication and authorization
- Role-based access control
- Transaction recording and management
- Physician management
- Expense tracking
- Payroll management
- Daily activity timeline
- Financial dashboard and reporting
- Monthly payroll resets
- Multilingual support (i18n)

### Planned Features

- Employee management
- Savings tracking
- Advanced analytics and reporting
- Multi-clinic support
- Notifications and alerts
- Inventory management
- Audit logs

---

## System Users

The platform currently supports different types of users, including:

- **Administrators** – manage users and oversee system operations.
- **Finance Officers** – manage expenses, payroll, and financial reports.
- **Receptionists/Cashiers** – record patient transactions.
- **Managers** – monitor clinic performance and approve activities.

---

## Tech Stack

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **Axios**
- **React Router**
- **i18next** (internationalization)

### Backend

- **Node.js**
- **Express.js**
- **TypeScript**
- **Prisma ORM**

### Database

- **SQLite** (current development database)
- Planned migration to **PostgreSQL**

### Other Tools

- **JWT Authentication**
- **Cookie-based Authentication**
- **Node Cron** (scheduled tasks)
- **GitHub Codespaces**

---

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/
│   ├── hooks/
│   ├── styles/
│   └── i18n/

backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── prisma/
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- npm
- Git

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd imariplus
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend

| Variable | Description |
|-----------|------------|
| DATABASE_URL | Database connection string |
| JWT_SECRET | Secret used to sign JWT tokens |
| FRONTEND_URL | Frontend application URL |
| PORT | Backend server port |

---

## API Endpoints

### Authentication

- `/api/auth`

### Users

- `/api/users`

### Transactions

- `/api/transactions`

### Physicians

- `/api/physicians`

### Expenses

- `/api/expenses`

### Payroll

- `/api/payroll`

### Dashboard

- `/api/dashboard`

### Timeline

- `/api/timeline`

---

## Vision

Imari+ aims to become a comprehensive healthcare operations platform that enables clinics to manage finances, employees, and operational activities efficiently while providing transparency and actionable insights.

---

## Author

**Bwiza Agnes Kamirindi**

Kigali, Rwanda

GitHub: https://github.com/bwizaagneskamilindi
