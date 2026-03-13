# HRMS-system

### 🔗 Links

[Live Frontend](https://hrms-system-khaki.vercel.app/)
[Live Backend API](https://hrms-backend.onrender.com/api/v1)
[Swagger API Docs](https://hrms-system-7rne.onrender.com/api-docs)
---

## Project Overview

HRMS system is a web-based admin tool that allows a single admin to:

- **Add, view, and delete employees** with details like Employee ID, Full Name, Email, and Department
- **Mark daily attendance** for each employee as Present or Absent
- **View attendance history** per employee with present/absent totals and attendance rate
- **Dashboard summary** showing today's attendance stats across the entire workforce

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL via Sequelize ORM |
| Validation | Zod |
| Logging | Pino + pino-http |
| API Docs | Swagger UI (swagger-jsdoc) |
| Security | Helmet, CORS |
| Testing | Mocha, Chai, Supertest |
| Dev Tools | Nodemon, ESLint, Prettier |

### Frontend

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Language | JavaScript (ES2022) |
| HTTP Client | Native Fetch API |
| Deployment | Vercel |

---

## Repository Structure

```
hrms-system/
├── backend/                  # Node.js + Express REST API
│   ├── server.js
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── validations/
│   ├── utils/
│   └── tests/
└── frontend/                 # Next.js frontend
    ├── app/
    │   ├── dashboard/
    │   ├── employees/
    │   └── attendance/
    └── lib/
```

---

## Backend

### Backend Structure

```
backend/
├── server.js                    # Entry point — connects DB then starts server
├── app.js                       # Express setup — middleware, routes, swagger
├── config/
│   ├── database.js              # Sequelize instance and connectDB()
│   └── swagger.js               # OpenAPI 3.0 spec
├── controllers/
│   ├── employee.controller.js   # Employee CRUD logic
│   └── attendance.controller.js # Attendance logic + dashboard stats
├── middlewares/
│   ├── validate.js              # Zod validation middleware factory
│   ├── errorHandler.js          # Global error handler
│   └── notFound.js              # 404 handler
├── models/
│   ├── employee.model.js        # Employee Sequelize model
│   ├── attendance.model.js      # Attendance Sequelize model + associations
│   └── index.js                 # Exports all models
├── routes/
│   ├── health.routes.js         # GET /health
│   ├── employee.routes.js       # Employee routes with Swagger JSDoc
│   └── attendance.routes.js     # Attendance routes with Swagger JSDoc
├── validations/
│   └── schemas.js               # All Zod schemas for request validation
├── utils/
│   ├── logger.js                # Pino logger (pretty in dev, JSON in prod)
│   └── response.js              # sendSuccess() and sendError() helpers
└── tests/
    ├── setup.js                 # Connects DB before test suite runs
    ├── employee.test.js         # Employee API integration tests
    └── attendance.test.js       # Attendance API integration tests
```

---

### Backend Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL running locally or hosted

#### Steps

```bash
# 1. Navigate to backend folder
cd hrms-system/backend

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in values
cp .env.example .env

# 4. Start development server
npm run dev
```

Server runs at `http://localhost:5000`
Swagger docs at `http://localhost:5000/api-docs`

#### Available Scripts

```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start in production mode
npm test         # Run Mocha test suite
npm run lint     # Check code with ESLint
npm run format   # Format code with Prettier
```

---

### Backend Environment Variables

Create a `.env` file inside `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_lite
DB_USER=postgres
DB_PASSWORD=yourpassword

# Shown in startup logs (production only)
API_URL=https://your-backend.onrender.com

# Logging
LOG_LEVEL=info
```

### API Reference

**Base URL:** `http://localhost:5000/api/v1`

#### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List all employees |
| POST | `/employees` | Create a new employee |
| GET | `/employees/:id` | Get single employee |
| DELETE | `/employees/:id` | Delete employee + all attendance |
| GET | `/employees/:id/attendance-summary` | Get present/absent totals |

#### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | All records (filter: `?startDate=&endDate=`) |
| POST | `/attendance` | Mark or update attendance (upsert) |
| GET | `/attendance/employee/:id` | Records for one employee |
| DELETE | `/attendance/:id` | Delete a single record |
| GET | `/attendance/dashboard` | Today's summary stats |

#### Request Examples

```bash
# Create employee
curl -X POST http://localhost:5000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"EMP-001","fullName":"Jane Smith","email":"jane@company.com","department":"Engineering"}'

# Mark attendance
curl -X POST http://localhost:5000/api/v1/attendance \
  -H "Content-Type: application/json" \
  -d '{"employeeId":1,"date":"2024-07-15","status":"Present"}'

# Filter attendance by date range
curl "http://localhost:5000/api/v1/attendance?startDate=2024-07-01&endDate=2024-07-31"

# Dashboard stats
curl http://localhost:5000/api/v1/attendance/dashboard
```

#### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": { ... }
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["body.email: Must be a valid email address"]
}
```

#### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 404 | Not found |
| 409 | Conflict — duplicate Employee ID or Email |
| 422 | Validation error |
| 500 | Internal server error |

---

### Running Tests

```bash
cd backend
npm test
```

Expected output:

```
Employee API
  POST /api/v1/employees
    ✓ should create an employee successfully
    ✓ should reject duplicate employee ID
    ✓ should reject duplicate email
    ✓ should reject an invalid email format
    ✓ should reject missing required fields
  GET /api/v1/employees
    ✓ should return array of employees
  DELETE /api/v1/employees/:id
    ✓ should delete the employee
    ✓ should return 404 for already-deleted employee

Attendance API
  POST /api/v1/attendance
    ✓ should mark attendance as Present
    ✓ should update existing attendance (upsert)
    ✓ should reject invalid status value
    ✓ should reject invalid date format
    ✓ should return 404 for non-existent employee

14 passing (2s)
```

---

## Frontend

### Frontend Structure

```
frontend/
├── app/
│   ├── layout.js               # Root layout — sidebar + main content area
│   ├── page.js                 # Redirects / → /dashboard
│   ├── globals.css             # Tailwind v4 import + modal animation
│   ├── dashboard/
│   │   └── page.js             # Stats cards + attendance rate bar
│   ├── employees/
│   │   ├── page.js             # Employee list + search + add/delete
│   │   └── [id]/
│   │       └── page.js         # Employee profile + attendance history
│   └── attendance/
│       └── page.js             # Attendance records + date filter + mark modal
└── lib/
    └── api.js                  # All API calls in one place
```

---

### Frontend Setup

#### Prerequisites
- Node.js 18+
- Backend running locally or hosted

#### Steps

```bash
# 1. Navigate to frontend folder
cd hrms-system/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard` automatically.

#### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code with ESLint
```

---

### Frontend Environment Variables

Create a `.env.local` file inside `frontend/`:

```env
# Point to your backend — local or hosted
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For production (after deploying backend):

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

### Pages

#### `/dashboard`
Real-time overview of the workforce:
- Total employees, present today, absent today, not marked today
- Attendance rate progress bar
- Quick links to Employees and Attendance pages

#### `/employees`
Full employee management:
- Search bar — filters by name, ID, email, or department
- Table with Employee ID, name, email, department, join date
- Add Employee button — opens modal with client and server-side validation
- View — navigates to employee detail page
- Delete — confirmation dialog, removes employee and all attendance records

#### `/employees/[id]`
Individual employee profile:
- Employee info card — name, email, department, ID, join date
- Summary — total days recorded, total present, total absent
- Attendance rate progress bar
- Full attendance history table

#### `/attendance`
Attendance management:
- Filter by date range — only refetches when Apply is clicked
- Mark Attendance — modal with employee dropdown, date picker, status
- Records table — employee, department, date, status
- Delete individual records

---
