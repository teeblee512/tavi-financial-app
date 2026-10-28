import test from 'node:test';
import assert from 'node:assert';
import { createApp } from '../dist/app.js';
import { resetDemoStore } from '../dist/services/db.service.js';

const app = createApp();
let server;
let baseUrl;

test.before(async () => {
  // Ensure fresh baseline
  resetDemoStore();

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
      resolve(true);
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('MULTI-USER SANDBOX VERIFICATION SUITE', async (t) => {
  let tokenA = '';
  let tokenB = '';
  let userA = null;
  let userB = null;

  await t.test('1. Independent User Registration with Configurable Starting Balance', async () => {
    // Register Tester A
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '08111110001',
        email: 'tester.alpha@tavi-sandbox.ng',
        password: 'password123',
        firstName: 'TaviTester',
        lastName: 'Alpha',
        demoTag: '@testerAlpha',
      }),
    });

    assert.strictEqual(resA.status, 201, 'Tester A registration should return 201');
    const dataA = await resA.json();
    assert.strictEqual(dataA.success, true);
    assert.ok(dataA.data.token);
    assert.strictEqual(dataA.data.user.balanceMinor, 25000000, 'Starting demo balance should be ₦250,000.00 (25,000,000 kobo)');
    assert.strictEqual(dataA.data.user.demoTag, '@testerAlpha');
    assert.ok(dataA.data.user.accountNumber.startsWith('99'));
    tokenA = dataA.data.token;
    userA = dataA.data.user;

    // Register Tester B
    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '08111110002',
        email: 'tester.beta@tavi-sandbox.ng',
        password: 'password123',
        firstName: 'TaviTester',
        lastName: 'Beta',
        demoTag: '@testerBeta',
      }),
    });

    assert.strictEqual(resB.status, 201, 'Tester B registration should return 201');
    const dataB = await resB.json();
    assert.strictEqual(dataB.success, true);
    assert.ok(dataB.data.token);
    assert.strictEqual(dataB.data.user.balanceMinor, 25000000, 'Starting demo balance should be ₦250,000.00');
    assert.notStrictEqual(dataB.data.user.id, userA.id, 'Users must have unique independent IDs');
    assert.notStrictEqual(dataB.data.user.accountNumber, userA.accountNumber, 'Users must have unique account numbers');
    tokenB = dataB.data.token;
    userB = dataB.data.user;
  });

  await t.test('2. Independent Login and Profile Introspection (/auth/me)', async () => {
    // Log in as Tester A
    const loginA = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneOrEmail: userA.phone,
        passwordOrPin: 'password123',
      }),
    });
    assert.strictEqual(loginA.status, 200);
    const loginDataA = await loginA.json();
    assert.strictEqual(loginDataA.data.user.id, userA.id);

    // Profile check for Tester A
    const meA = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(meA.status, 200);
    const meDataA = await meA.json();
    assert.strictEqual(meDataA.data.displayName, 'TaviTester Alpha');
    assert.strictEqual(meDataA.data.balanceMinor, 25000000);
    assert.strictEqual(meDataA.data.isDemo, true);

    // Profile check for Tester B
    const meB = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.strictEqual(meB.status, 200);
    const meDataB = await meB.json();
    assert.strictEqual(meDataB.data.displayName, 'TaviTester Beta');
    assert.strictEqual(meDataB.data.balanceMinor, 25000000);
  });

  await t.test('3. Safe Recipient Lookup and Demo Directory', async () => {
    // Lookup by phone
    const lookupPhone = await fetch(`${baseUrl}/recipients/lookup?query=${userB.phone}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(lookupPhone.status, 200);
    const phoneData = await lookupPhone.json();
    assert.strictEqual(phoneData.data.userId, userB.id);
    assert.strictEqual(phoneData.data.name, 'TaviTester Beta');
    assert.strictEqual(phoneData.data.isSelf, false);

    // Lookup by tag
    const lookupTag = await fetch(`${baseUrl}/recipients/lookup?query=${userB.demoTag}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(lookupTag.status, 200);
    const tagData = await lookupTag.json();
    assert.strictEqual(tagData.data.userId, userB.id);

    // Lookup by account number
    const lookupAcct = await fetch(`${baseUrl}/recipients/lookup?query=${userB.accountNumber}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(lookupAcct.status, 200);

    // Self lookup detection
    const lookupSelf = await fetch(`${baseUrl}/recipients/lookup?query=${userA.phone}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(lookupSelf.status, 200);
    const selfData = await lookupSelf.json();
    assert.strictEqual(selfData.data.isSelf, true);
    assert.strictEqual(selfData.data.isEligible, false);

    // Demo directory (excludes self)
    const dir = await fetch(`${baseUrl}/recipients/demo-directory`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(dir.status, 200);
    const dirData = await dir.json();
    assert.ok(dirData.data.length >= 1);
    assert.ok(!dirData.data.some((u) => u.userId === userA.id), 'Directory must not list sender themselves');
  });

  await t.test('4. Enforce Transfer Validations: Self-Transfer, Nonexistent Recipient, Invalid Amount', async () => {
    // A: Disallow self transfer
    const selfRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        recipientIdentifier: userA.phone,
        amountMinor: 1000000,
        pin: '1234',
      }),
    });
    assert.strictEqual(selfRes.status, 400);
    const selfData = await selfRes.json();
    assert.strictEqual(selfData.error.code, 'SELF_TRANSFER_DISALLOWED');

    // B: Disallow transfer to nonexistent recipient
    const nonExistRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        recipientIdentifier: '000999888777666',
        amountMinor: 500000,
        pin: '1234',
      }),
    });
    assert.strictEqual(nonExistRes.status, 404);
    const nonExistData = await nonExistRes.json();
    assert.strictEqual(nonExistData.error.code, 'RECIPIENT_NOT_FOUND');

    // C: Disallow invalid / negative / zero amount
    const invalidAmtRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        recipientIdentifier: userB.phone,
        amountMinor: -50000,
        pin: '1234',
      }),
    });
    assert.strictEqual(invalidAmtRes.status, 400);
  });

  await t.test('5. Atomic Demo Transfer Execution (Debit Sender, Credit Recipient)', async () => {
    const transferAmountMinor = 5000000; // ₦50,000.00
    const feeMinor = 1000; // ₦10.00

    const initialBalResA = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const { data: initialA } = await initialBalResA.json();

    const initialBalResB = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const { data: initialB } = await initialBalResB.json();

    // Execute transfer from Tester A to Tester B
    const transferRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        recipientIdentifier: userB.demoTag,
        amountMinor: transferAmountMinor,
        narration: 'UAT Acceptance milestone payment',
        pin: '1234',
      }),
    });

    assert.strictEqual(transferRes.status, 201, 'Transfer should complete with 201 Created');
    const transferData = await transferRes.json();
    assert.strictEqual(transferData.success, true);
    assert.ok(transferData.data.reference.startsWith('TAVI-TRF-'));

    // Check updated balances
    const afterBalResA = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const { data: afterA } = await afterBalResA.json();
    assert.strictEqual(afterA.balanceMinor, initialA.balanceMinor - transferAmountMinor - feeMinor, 'Sender debited exactly amount + fee');

    const afterBalResB = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const { data: afterB } = await afterBalResB.json();
    assert.strictEqual(afterB.balanceMinor, initialB.balanceMinor + transferAmountMinor, 'Recipient credited exactly transfer amount');
  });

  await t.test('6. Transaction History Consistency & Private Isolation', async () => {
    // Tester A's transaction history
    const txsA = await fetch(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const { data: listA } = await txsA.json();
    const debitTx = listA.find((t) => t.type === 'TRANSFER' && t.direction === 'DEBIT');
    assert.ok(debitTx, 'Tester A must have an auditable DEBIT transaction');
    assert.strictEqual(debitTx.counterpartyName, 'TaviTester Beta');
    assert.strictEqual(debitTx.amountMinor, 5000000);

    // Tester B's transaction history
    const txsB = await fetch(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const { data: listB } = await txsB.json();
    const creditTx = listB.find((t) => t.type === 'DEPOSIT' && t.direction === 'CREDIT');
    assert.ok(creditTx, 'Tester B must have an auditable CREDIT transaction');
    assert.strictEqual(creditTx.counterpartyName, 'TaviTester Alpha');
    assert.strictEqual(creditTx.amountMinor, 5000000);

    // Audit linkage: verify matching reference
    assert.strictEqual(debitTx.reference, creditTx.reference, 'Debit and Credit records must share matching reference');

    // Private Isolation: Tester B cannot access Tester A's specific debit transaction ID
    const crossCheck = await fetch(`${baseUrl}/transactions/${debitTx.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.strictEqual(crossCheck.status, 404, 'Tester B must not have access to Tester A private debit record');
  });

  await t.test('7. Insufficient Funds Prevention (No Overspending)', async () => {
    // Tester A has ~₦199,990.00 left. Attempting to send ₦300,000.00 must fail
    const overspendRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        recipientIdentifier: userB.phone,
        amountMinor: 30000000, // ₦300,000.00
        pin: '1234',
      }),
    });

    assert.strictEqual(overspendRes.status, 400);
    const data = await overspendRes.json();
    assert.strictEqual(data.error.code, 'INSUFFICIENT_FUNDS');

    // Verify balance was untouched
    const balCheck = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const { data: bal } = await balCheck.json();
    assert.strictEqual(bal.balanceMinor, 25000000 - 5000000 - 1000);
  });

  await t.test('8. Idempotency Key & Duplicate Request Protection', async () => {
    const idempotencyKey = `IDEM-KEY-${Date.now()}`;
    const payload = {
      recipientIdentifier: userB.accountNumber,
      amountMinor: 1000000, // ₦10,000.00
      pin: '1234',
      idempotencyKey,
    };

    // First call
    const firstRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(payload),
    });
    assert.strictEqual(firstRes.status, 201);
    const firstData = await firstRes.json();

    // Replay exact same request with same idempotency key
    const replayRes = await fetch(`${baseUrl}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(payload),
    });
    assert.strictEqual(replayRes.status, 201);
    const replayData = await replayRes.json();

    assert.strictEqual(firstData.data.reference, replayData.data.reference, 'Replayed call must return identical reference');
    assert.strictEqual(firstData.data.newBalanceMinor, replayData.data.newBalanceMinor, 'Replayed call must NOT debit balance a second time');
  });

  await t.test('9. Concurrency & Race Condition Prevention under Parallel Transfer Spikes', async () => {
    // Current balance of Tester A is ~₦189,980.
    // We launch 4 parallel transfers of ₦100,000 each simultaneously.
    // Tester A only has enough funds for 1 transfer!
    // Concurrency lock must serialize them so exactly 1 succeeds and 3 fail with INSUFFICIENT_FUNDS.

    const transferAmount = 10000000; // ₦100,000.00
    const promises = [1, 2, 3, 4].map((i) =>
      fetch(`${baseUrl}/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          recipientIdentifier: userB.phone,
          amountMinor: transferAmount,
          narration: `Concurrent spike transfer #${i}`,
          pin: '1234',
        }),
      }).then((r) => r.json())
    );

    const results = await Promise.all(promises);
    const successfulCount = results.filter((r) => r.success === true).length;
    const failedCount = results.filter((r) => r.success === false && r.error?.code === 'INSUFFICIENT_FUNDS').length;

    assert.strictEqual(successfulCount, 1, 'Exactly one concurrent transfer should succeed');
    assert.strictEqual(failedCount, 3, 'Other concurrent transfers must fail with INSUFFICIENT_FUNDS');

    // Balance check
    const finalBalRes = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const { data: finalBal } = await finalBalRes.json();
    assert.ok(finalBal.balanceMinor >= 0, 'Balance must never drop below 0');
  });

  await t.test('10. Safe Demo Account Reset Procedure', async () => {
    // Reset Tester A's balance
    const resetRes = await fetch(`${baseUrl}/sandbox/user/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.strictEqual(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.strictEqual(resetData.data.balanceMinor, 25000000, 'Tester A reset back to ₦250,000.00');

    // Verify Tester B is completely unaffected
    const balBRes = await fetch(`${baseUrl}/wallets/NGN/balance`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const { data: balB } = await balBRes.json();
    assert.ok(balB.balanceMinor > 25000000, 'Tester B balance must remain unaffected by Tester A reset');
  });
});
