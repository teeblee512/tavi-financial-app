# TAVI Financial Platform — Master Operations & Owner Access Manual
**Brand:** TAVI  
**Tagline:** *Move. Manage. Grow.*  
**Author:** Antigravity Senior Engineering & Architecture Lead  
**Document File:** `TAVI_PLATFORM_OPERATIONS_MANUAL.md`  
**For:** Product Owner & Platform Administrator  

---

## 1. Platform Infrastructure & Ownership Overview

As the product owner, you have full ownership of your code, cloud deployments, and configurations:

| Component | Technology | Hosting Location | Live URL / Access |
| :--- | :--- | :--- | :--- |
| **Web Application** | React 18, Vite, Tailwind | Render (Static Site) | [https://tavi-financial-app.onrender.com](https://tavi-financial-app.onrender.com) |
| **Public Demo Web** | React 18, Vite, Tailwind | GitHub Pages | [https://teeblee512.github.io/tavi-financial-app/](https://teeblee512.github.io/tavi-financial-app/) |
| **Backend REST API** | Node.js, Express, TypeScript | Render (Web Service) | `https://tavi-backend-api.onrender.com/api/v1` |
| **API Documentation** | OpenAPI 3.0 / Swagger UI | Render Web Service | `https://tavi-backend-api.onrender.com/api/docs` |
| **Database** | PostgreSQL (Prisma ORM) | Render Managed PostgreSQL | Internal / External Connection Strings |
| **Mobile App (Android/iOS)** | React Native (Expo SDK 52) | Local & Expo Cloud (EAS) | Standalone APK & Google Play AAB |
| **Source Control** | Git | GitHub | [https://github.com/teeblee512/tavi-financial-app](https://github.com/teeblee512/tavi-financial-app) |

---

## 2. Step-by-Step Beginner Guide: Deploying the Backend on Render

Follow these exact steps in your Render dashboard to launch the backend API and database:

### Step A: Log in to Render
1. Open your web browser and navigate to: **[https://dashboard.render.com](https://dashboard.render.com)**.
2. Sign in with your Render account (or GitHub account linked to `teeblee512`).

---

### Step B: Provision Hosted PostgreSQL Database
> [!NOTE]  
> Render provides a managed PostgreSQL database. For testing and development, you can select the **Free** tier.

1. In the top-right corner of the Render dashboard, click the blue **"New +"** button.
2. From the dropdown menu, click **"PostgreSQL"**.
3. Fill in the following details:
   - **Name:** Enter `tavi-postgres-db`
   - **Database:** Enter `tavi_db`
   - **User:** Enter `tavi_user`
   - **Region:** Select **Frankfurt (EU Central)** or **Oregon (US West)** (select the region closest to you).
   - **PostgreSQL Version:** Select **16** (Default).
   - **Instance Type:** Select **Free** (or Starter $7/mo for permanent persistence).
4. Scroll to the bottom and click **"Create Database"**.
5. *What you will see:* Render will take about 60 seconds to provision your database. Once it shows **"Available"**, copy the **"Internal Database URL"** (for connections within Render) and **"External Database URL"** (for local migrations).
   > [!CAUTION]  
   > Never share your database password or full connection string publicly or commit it to GitHub.

---

### Step C: Deploy the Backend API Web Service
1. In the top-right corner of the Render dashboard, click the blue **"New +"** button.
2. From the dropdown menu, click **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and click **Next**.
4. Choose your repository: **`teeblee512/tavi-financial-app`**.
5. Configure the service settings:
   - **Name:** Enter `tavi-backend-api`
   - **Region:** Select the same region you chose for your database.
   - **Branch:** Select `main`
   - **Root Directory:** Enter `backend` *(CRITICAL: This tells Render to run inside the backend folder!)*
   - **Runtime:** Select **Node**
   - **Build Command:** Enter: `npm install && npm run build`
   - **Start Command:** Enter: `npm start`
   - **Instance Type:** Select **Free** (0.5 CPU, 512 MB RAM)
6. Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"**:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = *(Generate a random 32-character text string)*
   - `REFRESH_TOKEN_SECRET` = *(Generate another random 32-character text string)*
   - `DATABASE_URL` = *(Paste the Internal Database URL from Step B)*
   - `CORS_ORIGIN` = `https://tavi-financial-app.onrender.com,https://teeblee512.github.io`
7. Click **"Create Web Service"**.
8. *What you will see:* Render will pull your code, install dependencies, compile the TypeScript code, and output:
   `🚀 TAVI Financial Platform API Server Online`
   Your live API URL will be: `https://tavi-backend-api.onrender.com`

---

## 3. Step-by-Step Beginner Guide: Running the Mobile App on Your Phone

You do **not** need Android Studio or Xcode to test TAVI on your phone!

1. **Install Expo Go on your physical phone:**
   - On Android: Search **"Expo Go"** on Google Play Store and install.
   - On iPhone: Search **"Expo Go"** on Apple App Store and install.
2. **On your computer:**
   Open a terminal and run:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. A large QR code will appear in your computer terminal.
4. Open the **Expo Go** app on your phone and tap **"Scan QR code"** (or use your iPhone camera).
5. The TAVI Mobile app will load directly on your phone!

---

## 4. Double-Entry Accounting Ledger Rules

In production financial operations, balances are never manually edited. They are calculated from immutable journal postings:

```
Transfer of ₦50,000 from Sender to Recipient:
- POSTING 1 (Debit):  Sender Wallet Liability Account (Decreases balance by ₦50,000)
- POSTING 2 (Credit): Bank Settlement Account         (Increases transit balance by ₦50,000)
- POSTING 3 (Debit):  Bank Settlement Account         (Decreases transit balance by ₦50,000)
- POSTING 4 (Credit): Recipient Wallet Liability      (Increases balance by ₦50,000)

Sum of Debits (₦100,000) - Sum of Credits (₦100,000) = ₦0.00 (Balanced!)
```

---

## 5. Cost Estimates & Free Tier Limitations

- **Web Frontend (`tavi-financial-app`):** Hosted on Render Static Site tier = **$0.00 / month**.
- **Backend API (`tavi-backend-api`):** Hosted on Render Free Web Service = **$0.00 / month**.
  *(Note: Free web services spin down after 15 minutes of inactivity and take ~30 seconds to wake up on the first request).*
- **Database (`tavi-postgres-db`):** Free for 90 days on Render, then $7.00 / month for permanent commercial persistence.
- **Mobile Development (Expo):** Free developer tier = **$0.00 / month**.
- **Total Initial Monthly Operating Cost:** **$0.00**.

---

## 6. Regulatory & Security Pre-Launch Checklist

Before accepting real customer money, the following partner integrations and regulatory approvals must be completed:
1. **CBN Payment Switch / BaaS Integration:** Contract with a licensed Nigerian commercial bank (e.g., Providus Bank) or switch (NIBSS, Monnify, Paystack) for live NUBAN account generation.
2. **SEC Brokerage Partnership:** Partner with a SEC-licensed stockbroker and CSCS (Central Securities Clearing System) for live NGX order routing.
3. **NDPR / Data Protection:** Register with the Nigeria Data Protection Commission (NDPC) for privacy compliance.
4. **AML / CFT Screening:** Integrate automated identity verification (NIN, BVN) and sanctions list screening.
