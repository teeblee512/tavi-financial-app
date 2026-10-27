# TAVI Financial Platform — System Architecture Specification
**Document File:** `TAVI_SYSTEM_ARCHITECTURE.md`  
**Brand:** TAVI  
**Tagline:** *Move. Manage. Grow.*  
**Date:** October 27, 2026  
**Architecture Lead:** Antigravity Senior Engineering & Architecture Lead  
**Repository:** [https://github.com/teeblee512/tavi-financial-app](https://github.com/teeblee512/tavi-financial-app)  

---

## 1. Architectural Vision & Core Principles

The TAVI Financial Platform is architected as an omnichannel fintech system serving Nigerian and diaspora customers across Web, Android, and iOS.

### Core Architectural Principles
1. **Single Source of Truth:** A unified, versioned REST API (`/api/v1`) serves both the React Web Application and the React Native Mobile Application. There are no divergent business rules or local balance calculations.
2. **Financial Precision & Double-Entry Ledger:** All monetary amounts are stored as 64-bit integers in minor currency units (e.g., Nigerian Kobo: `100 kobo = ₦1.00`, US Cents: `100 cents = $1.00`). Floating-point arithmetic is strictly forbidden for money movement. Balance calculation is derived from double-entry journal postings.
3. **Defense-in-Depth Security:** Zero-trust architecture. All sensitive operations (transfers, PIN updates, order placement) require authenticated server-side verification, rate limiting, and audit logging.
4. **Preservation of Existing Frontend:** The existing React web application is preserved in its entirety. It transitions smoothly from mock state to live API calls via an environment-aware API client.
5. **Cost-Effective & Cloud-Native:** Designed to run reliably on Render's managed starter tiers and standard PostgreSQL without unnecessary microservice overhead.

---

## 2. High-Level System Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|                                                                                       |
|   +------------------------------------+     +------------------------------------+   |
|   |         TAVI Web Application       |     |        TAVI Mobile App (Expo)      |   |
|   |  - React 18 / TypeScript / Vite    |     |  - React Native / TypeScript       |   |
|   |  - Responsive Desktop & Mobile     |     |  - iOS & Android Build Targets     |   |
|   |  - Hosted on Render & GH Pages     |     |  - Secure KeyStore / Keychain      |   |
|   +-----------------+------------------+     +-----------------+------------------+   |
+---------------------|------------------------------------------|----------------------+
                      | HTTPS / TLS 1.3                          | HTTPS / TLS 1.3
                      | JSON REST API                            | JSON REST API
                      +--------------------+---------------------+
                                           |
+------------------------------------------v--------------------------------------------+
|                         APPLICATION GATEWAY & SECURITY LAYER                          |
|                                                                                       |
|   - Helmet.js Security Headers (CSP, HSTS, X-Content-Type)                            |
|   - CORS Whitelist (tavi-financial-app.onrender.com, localhost)                       |
|   - Express Rate-Limiter (Brute-Force & DDoS Mitigation)                              |
|   - Request Sanitization & Joi/Zod Schema Validation                                  |
|   - JWT Token Authentication & Role-Based Access Control (RBAC)                       |
+------------------------------------------+--------------------------------------------+
                                           |
+------------------------------------------v--------------------------------------------+
|                             TAVI BACKEND API SERVICE                                  |
|                         (Node.js / Express / TypeScript)                              |
|                                                                                       |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   |   Auth Service    |  |  Account Service  |  |  Ledger Service   |                 |
|   | - Registration    |  | - Virtual Accts   |  | - Double-Entry    |                 |
|   | - Login & Tokens  |  | - KYC Verification|  | - Authoritative   |                 |
|   | - PIN Protection  |  | - Multi-Currency  |  |   Balance Calc    |                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   |  Transfer Service |  |  Invest Service   |  | Support & AI Core |                 |
|   | - NIP Simulation  |  | - NGX Equities    |  | - Grounded RAG    |                 |
|   | - Idempotency     |  | - TAVI Indices    |  | - Case Tracking   |                 |
|   | - Statement Gen   |  | - Demo Orders     |  | - Audit Trail     |                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
+------------------------------------------+--------------------------------------------+
                                           |
                                           | Prisma ORM / SQL Queries
                                           | Connection Pool & ACID Transactions
+------------------------------------------v--------------------------------------------+
|                           PERSISTENCE LAYER (PostgreSQL)                              |
|                                                                                       |
|   - Users & Credentials Table           - Ledger Accounts & Journal Postings          |
|   - User Profiles & KYC Tiers           - Transactions & Idempotency Keys             |
|   - Currency Wallets (NGN, USD, GBP)    - Gift Card Submissions & Timelines           |
|   - Watchlists & Equity Orders          - Support Cases & Audit Logs                  |
+------------------------------------------+--------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                    EXTERNAL INTEGRATION BOUNDARIES & PROVIDER ADAPTERS                |
|                                                                                       |
|   +--------------------+  +--------------------+  +--------------------+              |
|   | Banking / NIP (BaaS)|  |   Market Data Feed |  | Exchange Rates FX  |              |
|   | - Providus / NIBSS |  | - NGX Market Feed  |  | - Interbank / CBN  |              |
|   | - Virtual Accounts |  | - Order Book Depth |  | - Indicative Quotes|              |
|   | (Simulated Adapter)|  | (Simulated Adapter)|  | (Simulated Adapter)|              |
|   +--------------------+  +--------------------+  +--------------------+              |
+---------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Breakdown & Rationale

### A. Frontend: React + Vite + TypeScript (Preserved)
- **Why Retained:** The existing React application is clean, fast, and feature-rich. Rebuilding it would waste time and risk breaking working layouts.
- **Enhancement:** Add an environment-configurable API client (`src/services/apiClient.ts`) that calls the backend API when `VITE_API_URL` is set, with graceful fallback to demo fixtures.

### B. Backend API: Node.js + Express + TypeScript
- **Why Express + TypeScript:**
  1. **Shared Types:** TypeScript interfaces (`Transaction`, `User`, `Account`, `Holding`) can be shared seamlessly between backend, web frontend, and mobile apps.
  2. **Ecosystem & Security:** Industry-standard middleware (Helmet, CORS, Express-Rate-Limit, Morgan, JWT, Bcrypt).
  3. **Low Memory Footprint:** Runs comfortably within Render's 512 MB free/starter instance limits without OOM crashes.
  4. **OpenAPI / Swagger:** Self-documenting interactive API explorer hosted at `/api/docs`.

### C. Database: Hosted PostgreSQL with Prisma ORM
- **Why PostgreSQL:**
  1. **ACID Transactions:** Critical for financial consistency (a transfer must debit the sender AND credit the recipient inside a single atomic transaction).
  2. **Row-Level Locking:** Prevents race conditions and double-spending (`SELECT FOR UPDATE`).
  3. **Check Constraints:** Enforces database-level validation (e.g., `CHECK (balance >= 0)`).
- **Why Prisma:**
  - Type-safe query generation eliminating SQL injection vulnerabilities.
  - Automated database migration tracking (`prisma migrate`).
  - Simple seeding for deterministic demo environments (`prisma db seed`).

### D. Mobile Application: React Native with Expo & TypeScript
- **Why Expo:**
  1. **Single TypeScript Codebase:** Reuses 80% of business logic, state models, and design tokens from the web app.
  2. **Instant Developer Preview:** Expo Go app allows the product owner to test the mobile app on a physical Android or iOS device simply by scanning a QR code, without needing Android Studio or Xcode installed.
  3. **Cloud Build (EAS):** Generates standalone Android APKs and iOS binaries in the cloud.

---

## 4. Double-Entry Accounting Architecture

In financial engineering, balances should never be simple mutable columns (`UPDATE accounts SET balance = balance - 100`). Instead, TAVI implements a strict **double-entry journal**:

1. **`LedgerAccount`**:
   - Represents asset, liability, equity, revenue, and expense accounts.
   - Every user wallet has a corresponding `CUSTOMER_DEPOSITS` liability account.
2. **`JournalEntry`**:
   - An immutable header recording the business transaction, timestamp, idempotency key, and reference.
3. **`Posting`**:
   - Each entry contains at least two postings:
     - Outbound Transfer: Debit Sender's Deposit Account, Credit Bank Settlement Account.
     - Inbound Transfer: Debit Bank Settlement Account, Credit Recipient's Deposit Account.
   - **Sum of debits must equal sum of credits** (`SUM(debits) - SUM(credits) = 0`).
4. **Authoritative Balance Calculation**:
   - `Available Balance = SUM(Credit Postings) - SUM(Debit Postings) - SUM(Held Postings)`.

---

## 5. Security Architecture

1. **Authentication:**
   - Password hashing with **Bcrypt** (cost factor 12) or **Argon2id**.
   - Stateless **JSON Web Tokens (JWT)** with 15-minute access token lifespan and 7-day secure HTTP-only refresh tokens.
   - Separate 4-digit **Transaction PIN** and **Investment PIN** hashed independently from account passwords.
2. **Rate Limiting:**
   - Auth endpoints (`/api/v1/auth/*`): 10 requests per 15 minutes per IP.
   - General API endpoints: 100 requests per minute per IP.
3. **Input Validation:**
   - Strict schema validation on all incoming request bodies using Joi/Zod. Unknown fields are stripped.
4. **Audit Trail:**
   - An immutable `AuditLog` table records IP address, user agent, actor ID, action type, and status for all financial and administrative actions.

---

## 6. Component Inventory: Existing vs. New

| Component | Current State | Architecture Target |
| :--- | :--- | :--- |
| **Web Frontend** | React 18 + Vite (Client-only) | **Preserve & Enhance:** Add API client layer connecting to backend. |
| **Backend REST API** | Not Implemented | **New Component:** Node.js + Express + TypeScript in `/backend`. |
| **Database** | None (Static fixtures in memory) | **New Component:** Hosted PostgreSQL with Prisma ORM schemas. |
| **Mobile App** | Not Implemented | **New Component:** React Native / Expo in `/mobile`. |
| **Render Deployments** | Static site `srv-dbg9vh6gekts738av480` | **Expand:** Keep static site; add Web Service + Managed PostgreSQL. |
| **API Documentation** | None | **New Component:** Swagger UI hosted at `/api/docs`. |

---

## 7. Cost Minimization Strategy (Render Hosting)

- **Web Frontend (`tavi-financial-app`):** Static site tier on Render (**$0 / Free**).
- **Backend API (`tavi-backend-api`):** Free Web Service tier on Render (**$0 / Free**).
- **Managed PostgreSQL Database:** Render Free PostgreSQL tier (**$0 / Free** for 90 days or starter $7/mo for persistent commercial usage).
- **Mobile Development:** Expo Free Developer Tier (**$0 / Free** for local development and Expo Go testing).
- **Total Initial Monthly Cost:** **$0.00**.
