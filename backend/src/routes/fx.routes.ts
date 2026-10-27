import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { memoryStore } from '../services/db.service.js';

export const fxRouter = Router();

const FX_RATES: Record<string, number> = {
  USD_NGN: 1485.5,
  NGN_USD: 1 / 1485.5,
  GBP_NGN: 1890.2,
  NGN_GBP: 1 / 1890.2,
  EUR_NGN: 1610.75,
  NGN_EUR: 1 / 1610.75,
  USD_EUR: 0.92,
  EUR_USD: 1.087,
  USD_GBP: 0.78,
  GBP_USD: 1.282,
};

const convertSchema = z.object({
  body: z.object({
    sourceCurrency: z.string().length(3),
    targetCurrency: z.string().length(3),
    sourceAmount: z.number().positive(),
  }),
});

/**
 * Get FX Rates
 */
fxRouter.get('/fx/rates', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      rates: FX_RATES,
      timestamp: new Date().toISOString(),
      source: 'Interbank Wholesale Fix (Simulated)',
      disclaimer: 'Indicative rates for demonstration only.',
    },
  });
});

/**
 * Execute Currency Conversion
 */
fxRouter.post('/fx/convert', authenticate, validate(convertSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourceCurrency, targetCurrency, sourceAmount } = req.body;
    const pair = `${sourceCurrency.toUpperCase()}_${targetCurrency.toUpperCase()}`;
    const rate = FX_RATES[pair];

    if (!rate) {
      res.status(400).json({ success: false, error: { code: 'UNSUPPORTED_PAIR', message: `Currency pair ${pair} is not supported.` } });
      return;
    }

    const estimatedTargetAmount = sourceAmount * rate;
    const fee = 0; // 0% interbank promo

    // Update balances in memory
    const userId = req.user!.userId;
    const srcWallet = memoryStore.wallets.get(`${userId}_${sourceCurrency.toUpperCase()}`);
    const tgtWallet = memoryStore.wallets.get(`${userId}_${targetCurrency.toUpperCase()}`);

    if (srcWallet && tgtWallet) {
      const srcMinor = Math.round(sourceAmount * 100);
      const tgtMinor = Math.round(estimatedTargetAmount * 100);

      if (srcWallet.balanceMinor >= srcMinor) {
        srcWallet.balanceMinor -= srcMinor;
        tgtWallet.balanceMinor += tgtMinor;
      }
    }

    res.json({
      success: true,
      data: {
        sourceCurrency,
        targetCurrency,
        sourceAmount,
        exchangeRate: rate,
        fee,
        targetAmount: estimatedTargetAmount,
        timestamp: new Date().toISOString(),
      },
      message: `Successfully converted ${sourceAmount} ${sourceCurrency} to ${estimatedTargetAmount.toFixed(2)} ${targetCurrency}.`,
    });
  } catch (err) {
    next(err);
  }
});
