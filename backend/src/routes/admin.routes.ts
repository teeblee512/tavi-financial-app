import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { memoryStore, saveStoreToDisk, resetUserDemoBalance } from '../services/db.service.js';
import { recordAudit } from '../services/audit.service.js';

export const adminRouter = Router();

/* ------------------------------------------------------------------ */
/* Admin authentication (separate from demo user login)                */
/* ------------------------------------------------------------------ */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const provided = String(req.headers['x-admin-key'] || '');
  if (!provided || !safeEqual(provided, config.admin.apiKey)) {
    recordAudit({
      actorType: 'ANONYMOUS',
      actorId: null,
      action: 'ADMIN_AUTH_FAILED',
      status: 'FAILURE',
      ip: req.ip,
      details: { path: req.path },
    });
    res.status(401).json({
      success: false,
      error: { code: 'ADMIN_UNAUTHORIZED', message: 'A valid x-admin-key header is required.' },
    });
    return;
  }
  next();
}

adminRouter.use('/admin', requireAdminKey);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function paging(req: Request) {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '25'), 10) || 25));
  return { page, limit, offset: (page - 1) * limit };
}

function inRange(iso: string | Date, from?: string, to?: string): boolean {
  const t = new Date(iso).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to) {
    // Date-only "to" values include the whole day
    const end = /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(to).getTime() + 86400000 - 1 : new Date(to).getTime();
    if (t > end) return false;
  }
  return true;
}

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Neutralise spreadsheet formula injection
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function sendCsv(res: Response, filename: string, rows: Record<string, unknown>[]): void {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const body = [headers.map(csvCell).join(','), ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(body);
}

function userView(userId: string) {
  const u = memoryStore.users.get(userId);
  if (!u) return null;
  const p = memoryStore.profiles.get(userId);
  const wallets = Array.from(memoryStore.wallets.values()).filter((w: any) => w.userId === userId);
  return {
    id: u.id,
    displayName: p?.displayName || `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || '(unnamed)',
    phone: u.phone,
    email: u.email,
    demoTag: u.demoTag,
    role: u.role,
    status: u.status || 'ACTIVE',
    kycTier: u.kycTier,
    createdAt: u.createdAt,
    wallets: wallets.map((w: any) => ({
      currency: w.currency,
      balanceMinor: w.balanceMinor,
      accountNumber: w.providerAccountNumber,
    })),
  };
}

/* ------------------------------------------------------------------ */
/* USER MANAGEMENT                                                     */
/* ------------------------------------------------------------------ */
adminRouter.get('/admin/users', (req, res) => {
  const { page, limit, offset } = paging(req);
  const search = String(req.query.search || '').toLowerCase().trim();
  const status = String(req.query.status || '').toUpperCase();

  let list = Array.from(memoryStore.users.keys()).map((id) => userView(id)!);
  if (search) {
    list = list.filter((u) =>
      [u.displayName, u.phone, u.email, u.demoTag, u.id].some((f) => String(f || '').toLowerCase().includes(search))
    );
  }
  if (status === 'ACTIVE' || status === 'SUSPENDED') list = list.filter((u) => u.status === status);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, total: list.length, page, limit, data: list.slice(offset, offset + limit) });
});

adminRouter.get('/admin/users/:id', (req, res) => {
  const view = userView(req.params.id);
  if (!view) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No such user.' } });
    return;
  }
  const transactions = memoryStore.transactions.filter((t: any) => t.userId === req.params.id).slice(0, 20);
  const audit = memoryStore.auditLogs.filter((a: any) => a.actorId === req.params.id || a.targetId === req.params.id).slice(0, 20);
  res.json({ success: true, data: { ...view, recentTransactions: transactions, recentAudit: audit } });
});

adminRouter.patch('/admin/users/:id/status', (req, res) => {
  const user = memoryStore.users.get(req.params.id);
  const status = String(req.body?.status || '').toUpperCase();
  const reason = String(req.body?.reason || '').slice(0, 300);
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No such user.' } });
    return;
  }
  if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
    res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'status must be ACTIVE or SUSPENDED.' } });
    return;
  }
  const previous = user.status || 'ACTIVE';
  user.status = status;
  user.updatedAt = new Date();
  saveStoreToDisk();
  recordAudit({
    actorType: 'ADMIN',
    actorId: 'admin-console',
    action: status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
    targetType: 'USER',
    targetId: user.id,
    status: 'SUCCESS',
    ip: req.ip,
    details: { previous, current: status, reason },
  });
  res.json({ success: true, data: userView(user.id) });
});

adminRouter.patch('/admin/users/:id/kyc', (req, res) => {
  const user = memoryStore.users.get(req.params.id);
  const tier = String(req.body?.kycTier || '');
  const allowed = ['TIER_1_BASIC', 'TIER_2_VERIFIED', 'TIER_3_PRO'];
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No such user.' } });
    return;
  }
  if (!allowed.includes(tier)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_KYC_TIER', message: `kycTier must be one of ${allowed.join(', ')}.` } });
    return;
  }
  const previous = user.kycTier;
  user.kycTier = tier;
  user.updatedAt = new Date();
  saveStoreToDisk();
  recordAudit({
    actorType: 'ADMIN',
    actorId: 'admin-console',
    action: 'USER_KYC_CHANGED',
    targetType: 'USER',
    targetId: user.id,
    status: 'SUCCESS',
    ip: req.ip,
    details: { previous, current: tier },
  });
  res.json({ success: true, data: userView(user.id) });
});

adminRouter.post('/admin/users/:id/reset-balance', (req, res) => {
  if (!memoryStore.users.get(req.params.id)) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No such user.' } });
    return;
  }
  const result = resetUserDemoBalance(req.params.id);
  recordAudit({
    actorType: 'ADMIN',
    actorId: 'admin-console',
    action: 'USER_BALANCE_RESET',
    targetType: 'USER',
    targetId: req.params.id,
    status: 'SUCCESS',
    ip: req.ip,
    details: { newBalanceMinor: result.newBalanceMinor },
  });
  res.json({ success: true, data: { ...userView(req.params.id), resetTo: result.newBalanceMinor } });
});

/* ------------------------------------------------------------------ */
/* AUDIT MENU (timestamped)                                            */
/* ------------------------------------------------------------------ */
adminRouter.get('/admin/audit', (req, res) => {
  const { page, limit, offset } = paging(req);
  const action = String(req.query.action || '').toUpperCase().trim();
  const actor = String(req.query.actor || '').toLowerCase().trim();
  const status = String(req.query.status || '').toUpperCase();
  const from = req.query.from ? String(req.query.from) : undefined;
  const to = req.query.to ? String(req.query.to) : undefined;

  const list = memoryStore.auditLogs.filter((a: any) => {
    if (action && !String(a.action).toUpperCase().includes(action)) return false;
    if (actor && !String(a.actorId || '').toLowerCase().includes(actor)) return false;
    if (status && a.status !== status) return false;
    return inRange(a.timestamp, from, to);
  });

  if (req.query.format === 'csv') {
    sendCsv(
      res,
      `tavi-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((a: any) => ({
        timestamp: a.timestamp,
        actorType: a.actorType,
        actorId: a.actorId,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        status: a.status,
        ip: a.ip,
        details: a.details,
      }))
    );
    return;
  }
  res.json({ success: true, total: list.length, page, limit, data: list.slice(offset, offset + limit) });
});

/* ------------------------------------------------------------------ */
/* REPORT MENU                                                         */
/* ------------------------------------------------------------------ */
adminRouter.get('/admin/reports/summary', (req, res) => {
  const from = req.query.from ? String(req.query.from) : undefined;
  const to = req.query.to ? String(req.query.to) : undefined;
  const txns = memoryStore.transactions.filter((t: any) => inRange(t.createdAt, from, to));

  const users = Array.from(memoryStore.users.values());
  const byType: Record<string, { count: number; volumeMinor: number }> = {};
  const byStatus: Record<string, number> = {};
  const byCurrency: Record<string, { count: number; volumeMinor: number; feesMinor: number }> = {};
  let feesMinor = 0;

  for (const t of txns as any[]) {
    byType[t.type] = byType[t.type] || { count: 0, volumeMinor: 0 };
    byType[t.type].count++;
    byType[t.type].volumeMinor += t.amountMinor || 0;
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    const c = (byCurrency[t.currency] = byCurrency[t.currency] || { count: 0, volumeMinor: 0, feesMinor: 0 });
    c.count++;
    c.volumeMinor += t.amountMinor || 0;
    c.feesMinor += t.feeMinor || 0;
    feesMinor += t.feeMinor || 0;
  }

  const walletBalanceByCurrency: Record<string, number> = {};
  for (const w of memoryStore.wallets.values() as any) {
    walletBalanceByCurrency[w.currency] = (walletBalanceByCurrency[w.currency] || 0) + (w.balanceMinor || 0);
  }

  res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    period: { from: from || null, to: to || null },
    data: {
      users: {
        total: users.length,
        active: users.filter((u: any) => (u.status || 'ACTIVE') === 'ACTIVE').length,
        suspended: users.filter((u: any) => u.status === 'SUSPENDED').length,
      },
      transactions: { total: txns.length, byType, byStatus, byCurrency, totalFeesMinor: feesMinor },
      walletBalanceByCurrency,
      auditEvents: memoryStore.auditLogs.filter((a: any) => inRange(a.timestamp, from, to)).length,
    },
  });
});

adminRouter.get('/admin/reports/transactions', (req, res) => {
  const { page, limit, offset } = paging(req);
  const from = req.query.from ? String(req.query.from) : undefined;
  const to = req.query.to ? String(req.query.to) : undefined;
  const type = String(req.query.type || '').toUpperCase();
  const status = String(req.query.status || '').toUpperCase();

  const list = memoryStore.transactions.filter((t: any) => {
    if (type && t.type !== type) return false;
    if (status && t.status !== status) return false;
    return inRange(t.createdAt, from, to);
  });

  if (req.query.format === 'csv') {
    sendCsv(
      res,
      `tavi-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((t: any) => ({
        timestamp: new Date(t.createdAt).toISOString(),
        reference: t.reference,
        userId: t.userId,
        type: t.type,
        direction: t.direction,
        currency: t.currency,
        amount: (t.amountMinor || 0) / 100,
        fee: (t.feeMinor || 0) / 100,
        status: t.status,
        counterparty: t.counterpartyName,
        narration: t.narration,
      }))
    );
    return;
  }
  res.json({ success: true, total: list.length, page, limit, data: list.slice(offset, offset + limit) });
});

adminRouter.get('/admin/reports/users', (req, res) => {
  const rows = Array.from(memoryStore.users.keys()).map((id) => {
    const v = userView(id)!;
    const ngn = v.wallets.find((w: any) => w.currency === 'NGN');
    return {
      id: v.id,
      name: v.displayName,
      phone: v.phone,
      email: v.email,
      status: v.status,
      kycTier: v.kycTier,
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : '',
      ngnBalance: ngn ? ngn.balanceMinor / 100 : 0,
      transactionCount: memoryStore.transactions.filter((t: any) => t.userId === id).length,
    };
  });
  if (req.query.format === 'csv') {
    sendCsv(res, `tavi-users-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    return;
  }
  res.json({ success: true, total: rows.length, data: rows });
});
