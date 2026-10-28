# TAVI Financial Platform — Multi-User Sandbox Testing Guide
**Version:** 1.0.0 (Production Candidate Sandbox)  
**Audience:** Non-technical testers, product managers, quality assurance, and stakeholders.

---

## 1. Overview & Objective

The **TAVI Demo Sandbox** is an isolated financial simulation environment designed for User Acceptance Testing (UAT). It allows multiple testers to independently register, sign in, inspect simulated wallet balances, transfer simulated funds to each other in real time, and verify that balances and transaction histories update consistently on both sides.

> [!IMPORTANT]
> **Safety Notice:** All balances, accounts, and transactions in Demo Mode are strictly simulated. Demo funds cannot be withdrawn, deposited with real currency, or transferred to actual commercial bank accounts.

---

## 2. Pre-Configured Test Accounts (Ready to Test in 1-Click)

The sandbox comes pre-seeded with three independent demo tester profiles:

| Tester Profile | Role | Phone / Login Identifier | Demo Tag | Virtual Account No. | Starting Demo Balance | Default PIN |
|---|---|---|---|---|---|---|
| **Amara Okonkwo** | Primary Tester (Tester 1) | `07030000000` | `@amara` | `9920394811` | **₦485,250.00** | `1234` |
| **Babajide Adeleke** | Secondary Tester (Tester 2) | `08020000002` | `@babajide` | `9920394822` | **₦250,000.00** | `1234` |
| **Chioma Nwosu** | Tertiary Tester (Tester 3) | `09030000003` | `@chioma` | `9920394833` | **₦150,000.00** | `1234` |

*Note: You can also register your own brand-new custom tester account by clicking "Create account" on the sign-in screen.*

---

## 3. How to Test with Two Independent Testers Simultaneously

To witness real-time multi-user transfers, you need two separate browser sessions:

### Option A: Using Two Tabs in the Same Computer
1. **Window 1 (Normal Window):** Open `https://tavi-financial-app.onrender.com` (or `http://localhost:5173`).
   - Sign in as **Amara Okonkwo (Tester 1)**.
2. **Window 2 (Incognito / Private Browsing Window):**
   - Open a new Incognito / Private window (`Ctrl + Shift + N` on Chrome/Edge or `Ctrl + Shift + P` on Firefox).
   - Navigate to the same URL.
   - Click **"Switch Tester"** on the top golden **DEMO SANDBOX** banner and select **Babajide Adeleke (Tester 2)**.

### Option B: Using a Computer and a Mobile Phone
1. Open the web app on your computer as **Tester 1 (Amara)**.
2. Open the web app (or Expo mobile app) on your phone browser as **Tester 2 (Babajide)**.

---

## 4. Step-by-Step Test Procedure

### Test 1: Sending Funds from Tester 1 (Amara) to Tester 2 (Babajide)

1. **In Window 1 (Amara's Session):**
   - Confirm Amara's available balance on the home dashboard (e.g. `₦485,250.00`).
   - Click the green **"Send"** quick-action button (or navigate to **Payments > Send Money**).
   - Under **Eligible Demo Testers**, click the card for **Babajide Adeleke** (`@babajide`).
     *(Alternatively, type `@babajide` or `08020000002` into the search box — you will see a green **"Verified Demo"** badge appear!)*
   - In the **Amount** field, type `5000` (₦5,000.00).
   - *(Optional)* In the **Narration** field, type `UAT milestone transfer test`.
   - Click **"Continue to Review"**.
   - Review the summary:
     - Recipient: `Babajide Adeleke`
     - Destination Bank: `Providus Bank (Demo)`
     - Transfer Amount: `₦5,000.00`
     - Fee: `₦10.00`
     - Total Debit: `₦5,010.00`
   - In the **Transaction PIN** field, enter `1234`.
   - Click **"Confirm & Send Demo Funds"**.
   - **Verification:** You will see the **"Transfer Confirmed by Backend"** receipt screen with a unique reference (e.g. `TAVI-TRF-XXXXXX`).
   - Click **"View in Transaction History"** to verify that a `DEBIT` entry for `₦5,000.00` is recorded.
   - Notice Amara's balance decreased to `₦480,240.00`.

2. **In Window 2 (Babajide's Session):**
   - Look at Babajide's dashboard or click the **"Sync Live"** button on the balance card.
   - **Verification 1:** Babajide's balance automatically increased from `₦250,000.00` to `₦255,000.00`!
   - Click on **Transaction History**.
   - **Verification 2:** You will see a `CREDIT` transaction entry for `₦5,000.00` from `Amara Okonkwo` sharing the exact same unique audit reference!

---

### Test 2: Validation Safeguards

1. **Self-Transfer Prevention:**
   - In Amara's session, try searching for Amara's own tag (`@amara`) or phone (`07030000000`).
   - Notice the system immediately detects self-transfer and blocks it: *"Self-transfer is disallowed. Please select an eligible external demo recipient."*

2. **Insufficient Funds Prevention:**
   - Try entering an amount greater than the current balance (e.g. `₦1,000,000.00`).
   - Notice the system immediately halts the transfer: *"Insufficient funds. Your available balance is ₦480,240.00."* No funds are debited.

3. **Invalid Recipient Prevention:**
   - Try typing an unregistered identifier like `0000000000`.
   - Notice the system displays: *"No registered TAVI demo recipient matches this query."*

---

### Test 3: Session Persistence Across Refresh & Browser Restart

1. While logged in as Babajide in Window 2, refresh the browser page (`F5` or `Ctrl + R`).
2. Close the tab and open it again.
3. **Verification:** Babajide remains signed in, and the updated `₦255,000.00` balance and transaction history persist intact without resetting.

---

### Test 4: Safe Demo Account Balance Reset

1. Go to **Settings > Security & Privacy > Privacy & Limits**.
2. Locate the **"Demo Sandbox & Acceptance Testing"** card.
3. Click **"Reset Demo Account Balance"**.
4. **Verification:** Your demo balance is restored back to the factory starting balance (`₦250,000.00`), your test history is refreshed, and **none of the other tester accounts are touched**.

---

## 5. Help & Support
For any questions during UAT or to report feedback, open the in-app **Support** page (`#/support`) or submit a ticket directly to the engineering team.
