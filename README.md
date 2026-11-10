# Government Scheme Beneficiary Management System

> **Full Stack Academic Demonstration Project (FSD-2)**  
> Built with **React 19 + Vite**, **Node.js + Express**, and **MongoDB + Mongoose**.

---

### Important Disclaimer
> **Academic Prototype Notice:** This system is an educational simulation developed for academic evaluation. All scheme names, departments, eligibility criteria, benefits, and monetary values are **fictional demonstration data**.  
> In compliance with privacy standards, this platform **does NOT collect or store sensitive personal identifiers** (such as Aadhaar numbers) or real banking/payment credentials. Benefit disbursement is a simulated workflow milestone only.

---

## 1. Project Overview

The **Government Scheme Beneficiary Management System** is a full-stack civic web application engineered to bridge the gap between welfare administrators and citizens. It streamlines public scheme discovery, digital application submission, role-based scrutiny, audit-logged decision making, and transparent benefit tracking.

### Core Capabilities
* **Public Welfare Scheme Catalogue:** Browse, filter by 7 sectors, search by keyword, inspect eligibility rules, benefit summaries, and document requirements.
* **Beneficiary Portal:** Secure registration, authentication with JWT, pre-filled application forms, document declaration, and real-time lifecycle tracking.
* **Administrative Control Center:** Add/edit/close schemes, scrutinize citizen claims, verify documents, record decisions with mandatory remarks, and access the enrolled beneficiary roster.
* **Strict State Machine Workflow:** Enforces valid status transitions on the backend:
  $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \begin{cases} \text{Approved} \longrightarrow \text{Disbursed (Demo DBT Ref)} \\ \text{Rejected (with mandatory remarks)} \end{cases}$$
* **Role-Based Isolation:** Beneficiaries can only access their own submissions; administrators have system-wide oversight.

---

## 2. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, React Router 7 | Modern, accessible, responsive user interface with civic color styling |
| **Backend** | Node.js (v20+ / v26+), Express.js | REST API, role-based JWT middleware, centralized error handling |
| **Database** | MongoDB with Mongoose ODM | Schema validation, compound indexing, audit history subdocuments |
| **Security** | bcryptjs, jsonwebtoken | Password salting & hashing (10 rounds), tamper-proof JWT sessions |

---

## 3. Prerequisites

* **Node.js:** v18.0.0 or higher (v20+ / v26+ supported)
* **npm:** v9.0.0 or higher
* **MongoDB:** Community Server v6.0+ running locally on port `27017` (or MongoDB Atlas connection string)

---

## 4. Environment Configuration

Copy `backend/.env.example` to `backend/.env`, then set unique secrets locally. Never commit `.env` files:

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/govt_scheme_db
JWT_SECRET=<generate-a-unique-random-secret-of-at-least-32-characters>
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SEED_ADMIN_PASSWORD=<unique-password-at-least-12-characters>
SEED_BENEFICIARY_PASSWORD=<unique-password-at-least-12-characters>
SEED_ALLOW_RESET=true
```

---

## 5. Quick Start & Seed Instructions

### Step 1: Install Dependencies
From the project root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 2: Seed the Database
The seed script creates fictional schemes and sample accounts. It resets the demo collections, so only run it against a disposable development database. Configure `SEED_ADMIN_PASSWORD`, `SEED_BENEFICIARY_PASSWORD`, and explicitly set `SEED_ALLOW_RESET=true` in your local `backend/.env` first:
```bash
cd backend
npm run seed
```

### Step 3: Run the Application

#### Option A: Running in Development Mode (Frontend + Backend)
Run backend in one terminal:
```bash
cd backend
npm run dev
# Server runs on: http://localhost:5000
```

Run frontend in a second terminal:
```bash
cd frontend
npm run dev
# Frontend runs on: http://localhost:5173
```

#### Option B: Unified Production Build
Build the client and serve directly via Express:
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Start unified server
cd ../backend
npm start
# Visit http://localhost:5000 in your browser (API + UI hosted together)
```

---

## 6. Demo Accounts

Demo accounts are created by the seed script using passwords supplied through local environment variables. Credentials are intentionally not published in this repository. After seeding, use the configured passwords to sign in.

Administrator accounts are provisioned only by the seed process or trusted database administration; public registration always creates beneficiary accounts.

## 7. REST API Outline

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a citizen account (role is forced to `beneficiary`; admin creation rejected with 403).
* `POST /api/auth/login` - Authenticate citizen or admin, returns JWT token and profile.
* `GET /api/auth/me` - Retrieve authenticated user profile (Requires JWT).
* `PUT /api/auth/profile` - Update citizen profile fields (Requires JWT).

### Schemes (`/api/schemes`)
* `GET /api/schemes` - Public listing with filters (`search`, `category`, `status`).
* `GET /api/schemes/:id` - Detailed view of single scheme with eligibility & checklist.
* `POST /api/schemes` - Create scheme *(Admin only)*.
* `PUT /api/schemes/:id` - Edit scheme details *(Admin only)*.
* `PATCH /api/schemes/:id/toggle-status` - Close or reopen a scheme *(Admin only)*.
* `DELETE /api/schemes/:id` - Remove scheme *(Admin only)*.

### Applications (`/api/applications`)
* `POST /api/applications` - Submit an application with eligibility confirmations and document records *(Citizen only)*.
* `GET /api/applications` - Scoped retrieval (Citizens receive only their own records; Admins receive all submissions with search & filters).
* `GET /api/applications/:id` - Retrieve single application with full audit history *(Scoped by role)*.
* `PATCH /api/applications/:id/status` - Record administrative review decision & transition status *(Admin only, enforces workflow rules)*.

### Admin Analytics & Roster (`/api/admin`)
* `GET /api/admin/stats` - Total schemes, applications, workflow funnels, and category breakdowns *(Admin only)*.
* `GET /api/admin/beneficiaries` - Directory of approved & disbursed beneficiaries with generated DBT references *(Admin only)*.

---

## 8. Verification & Integration Test Suite

A complete integration script verifies all core requirements, role security barriers, sensitive data blocks, and workflow state transition rules:

```bash
cd backend
node src/tests/testWorkflow.js
```

All 9 test assertions run end-to-end against the local database and verify:
1. Health endpoint responsiveness
2. Citizen authentication & JWT issuance
3. Admin authentication & JWT issuance
4. Public registration blocking role spoofing (`role: admin` returns 403)
5. Sensitive data prevention (Aadhaar/Bank account returns 400)
6. Scheme catalogue retrieval & category query
7. Role-scoped data isolation (Beneficiary sees only own records)
8. Workflow state machine enforcement (Invalid transition blocked with 400; valid sequence `Submitted -> Under Review -> Approved -> Disbursed` completes with demo DBT voucher)
9. Admin metrics and beneficiary directory roster aggregation


---

## 9. Live Demo

Explore the deployed Government Scheme Beneficiary Management System:

**[Open Live Demo](https://government-scheme-beneficiary-manag.vercel.app/)**

> The live deployment is an academic demonstration. Configure deployment secrets and provision fresh demo credentials before enabling sign-in.


## 10. Security configuration

- Set a unique `JWT_SECRET` of at least 32 characters; the server refuses to start without it.
- In production, configure `MONGODB_URI` and `CLIENT_URL` explicitly. `CLIENT_URL` accepts a comma-separated allowlist of frontend origins.
- Rotate any database/JWT credentials that were previously committed or used in a public deployment. Removing a file from the latest commit does not remove it from Git history.
- Keep environment files out of Git. Only `.env.example` files belong in the repository.
- The seed command deletes existing demo collections and requires explicit `SEED_ALLOW_RESET=true`; never point it at production data.
- This academic prototype is not a production government service. Add rate limiting, security headers, monitoring, backup/restore testing, and independent security testing before any real deployment.
