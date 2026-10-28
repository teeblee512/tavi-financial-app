import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { resetUserDemoBalance, resetDemoStore, memoryStore } from '../services/db.service.js';
import { config } from '../config/index.js';

export const sandboxRouter = Router();

/**
 * Reset authenticated tester's demo balance and transactions safely
 * Guarantees no production data is touched.
 */
sandboxRouter.post('/sandbox/user/reset', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = resetUserDemoBalance(userId);

    res.json({
      success: true,
      message: 'Demo account balance reset to factory starting balance successfully.',
      data: {
        userId,
        balanceMinor: result.newBalanceMinor,
        currency: 'NGN',
        isDemo: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Global sandbox reset to restore baseline test accounts
 */
sandboxRouter.post('/sandbox/reset', (req: Request, res: Response, next: NextFunction) => {
  try {
    resetDemoStore();

    res.json({
      success: true,
      message: 'Sandbox demo store reset to baseline state successfully.',
      data: {
        accountsCount: memoryStore.users.size,
        walletsCount: memoryStore.wallets.size,
        transactionsCount: memoryStore.transactions.length,
        isDemo: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Sandbox configuration & safety metadata
 */
sandboxRouter.get('/sandbox/info', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      environment: 'DEMO_SANDBOX',
      isDemoMode: true,
      demoStartingBalanceMinor: config.sandbox?.demoStartingBalanceMinor || 25000000,
      activeDemoTesters: memoryStore.users.size,
      safetyDisclaimer: 'All balances and transactions are strictly simulated demo funds. Not withdrawable or convertible to real legal tender.',
    },
  });
});
