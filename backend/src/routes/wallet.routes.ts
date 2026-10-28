import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { LedgerService } from '../services/ledger.service.js';
import { memoryStore } from '../services/db.service.js';

export const walletRouter = Router();

const topUpSchema = z.object({
  body: z.object({
    amountMinor: z.number().int().positive('Amount in minor units must be positive'),
    currency: z.string().default('NGN'),
    method: z.string().default('Debit Card'),
  }),
});

/**
 * List all wallets for the authenticated user
 */
walletRouter.get('/wallets', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userWallets: any[] = [];

  for (const [key, wallet] of memoryStore.wallets) {
    if (key.startsWith(userId)) {
      userWallets.push(wallet);
    }
  }

  res.json({
    success: true,
    data: userWallets,
  });
});

/**
 * Get specific wallet balance
 */
walletRouter.get('/wallets/:currency/balance', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const currency = String(req.params.currency).toUpperCase();
  const balance = LedgerService.getWalletBalance(userId, currency);

  res.json({
    success: true,
    data: balance,
  });
});

/**
 * Top up wallet (Card Funding)
 */
walletRouter.post('/wallets/topup', authenticate, validate(topUpSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amountMinor, currency, method } = req.body;
    const result = LedgerService.fundWallet(req.user!.userId, amountMinor, currency, method);
    res.json({
      success: true,
      data: result,
      message: `Wallet funded successfully with ${amountMinor / 100} ${currency}.`,
    });
  } catch (err) {
    next(err);
  }
});
