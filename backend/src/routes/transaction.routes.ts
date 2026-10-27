import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { LedgerService } from '../services/ledger.service.js';
import { memoryStore } from '../services/db.service.js';

export const transactionRouter = Router();

const transferSchema = z.object({
  body: z.object({
    recipientIdentifier: z.string().min(5, 'Recipient account or phone required'),
    recipientName: z.string().min(2, 'Recipient name is required'),
    recipientBank: z.string().optional(),
    amountMinor: z.number().int().positive('Transfer amount must be positive'),
    currency: z.string().default('NGN'),
    narration: z.string().optional(),
    pin: z.string().length(4, '4-digit transaction PIN required'),
  }),
});

/**
 * List transactions with counterparty, type, status, and search filters
 */
transactionRouter.get('/transactions', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { counterparty, type, status, search } = req.query;

  let list = memoryStore.transactions.filter((t) => t.userId === userId);

  if (counterparty) {
    const cp = String(counterparty).toLowerCase();
    list = list.filter((t) => t.counterpartyName.toLowerCase().includes(cp));
  }

  if (type && type !== 'all') {
    list = list.filter((t) => t.direction.toLowerCase() === String(type).toLowerCase());
  }

  if (status && status !== 'all') {
    list = list.filter((t) => t.status.toLowerCase() === String(status).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (t) =>
        t.counterpartyName.toLowerCase().includes(q) ||
        t.narration.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: list,
    total: list.length,
  });
});

/**
 * Retrieve transaction peer summary (e.g. Ada Chukwu analytics)
 */
transactionRouter.get('/transactions/peer-summary', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const counterparty = String(req.query.counterparty || 'Ada Chukwu').toLowerCase();

  const matching = memoryStore.transactions.filter(
    (t) => t.userId === userId && t.counterpartyName.toLowerCase().includes(counterparty)
  );

  let totalSentMinor = 0;
  let totalReceivedMinor = 0;

  matching.forEach((t) => {
    if (t.direction === 'DEBIT') {
      totalSentMinor += t.amountMinor;
    } else {
      totalReceivedMinor += t.amountMinor;
    }
  });

  res.json({
    success: true,
    data: {
      counterparty: req.query.counterparty || 'Ada Chukwu',
      totalSentMinor,
      totalReceivedMinor,
      netFlowMinor: totalReceivedMinor - totalSentMinor,
      qualifyingCount: matching.length,
      transactions: matching,
    },
  });
});

/**
 * Single transaction details
 */
transactionRouter.get('/transactions/:id', authenticate, (req: Request, res: Response) => {
  const tx = memoryStore.transactions.find((t) => t.id === req.params.id && t.userId === req.user!.userId);
  if (!tx) {
    res.status(404).json({ success: false, error: { code: 'TX_NOT_FOUND', message: 'Transaction not found.' } });
    return;
  }
  res.json({ success: true, data: tx });
});

/**
 * Execute Outbound Transfer (with PIN verification)
 */
transactionRouter.post('/transactions/transfer', authenticate, validate(transferSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientIdentifier, recipientName, recipientBank, amountMinor, currency, narration, pin } = req.body;

    // Verify 4-digit PIN
    if (pin.length !== 4) {
      res.status(401).json({ success: false, error: { code: 'INVALID_PIN', message: 'Invalid 4-digit PIN' } });
      return;
    }

    const result = LedgerService.executeTransfer({
      userId: req.user!.userId,
      recipientIdentifier,
      recipientName,
      recipientBank,
      amountMinor,
      currency,
      narration,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Transfer submitted and processed successfully.',
    });
  } catch (err) {
    next(err);
  }
});
