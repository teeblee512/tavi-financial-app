import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../dist/app.js';

const app = createApp();
let server;
let baseUrl;

test.before(async () => {
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

test('GET /health returns 200 UP status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'UP');
  assert.strictEqual(data.brand, 'TAVI Financial Platform');
});

test('POST /auth/login returns token for valid credentials', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneOrEmail: '07030000000',
      passwordOrPin: '1234',
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.data.token);
  assert.strictEqual(data.data.user.phone, '07030000000');
});

test('GET /wallets fails with 401 without Bearer token', async () => {
  const res = await fetch(`${baseUrl}/wallets`);
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.error.code, 'UNAUTHORIZED');
});

test('GET /wallets succeeds with valid Bearer token', async () => {
  // Login first
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneOrEmail: '07030000000',
      passwordOrPin: '1234',
    }),
  });
  const { data: loginData } = await loginRes.json();

  const res = await fetch(`${baseUrl}/wallets`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('POST /transactions/transfer deducts balance and appends transaction', async () => {
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneOrEmail: '07030000000',
      passwordOrPin: '1234',
    }),
  });
  const { data: loginData } = await loginRes.json();

  const res = await fetch(`${baseUrl}/transactions/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({
      recipientIdentifier: '08020000002',
      recipientName: 'Babajide Adeleke',
      recipientBank: 'Providus Bank',
      amountMinor: 500000, // ₦5,000.00
      currency: 'NGN',
      narration: 'Test automated transfer',
      pin: '1234',
    }),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.transaction.counterpartyName, 'Babajide Adeleke');
  assert.strictEqual(data.data.transaction.amountMinor, 500000);
});
