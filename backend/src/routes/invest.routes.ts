import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { memoryStore } from '../services/db.service.js';

export const investRouter = Router();

const orderSchema = z.object({
  body: z.object({
    symbol: z.string().min(2, 'Stock symbol required'),
    side: z.enum(['BUY', 'SELL']),
    orderType: z.enum(['MARKET', 'LIMIT']).default('MARKET'),
    quantity: z.number().int().positive('Quantity must be at least 1 unit'),
    priceMinor: z.number().int().positive('Price must be positive'),
    investPin: z.string().length(4, '4-digit investment PIN required'),
  }),
});

/**
 * List NGX Equities
 */
investRouter.get('/invest/stocks', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: memoryStore.stocks,
    marketStatus: {
      exchange: 'Nigerian Exchange (NGX)',
      timeZone: 'Africa/Lagos (WAT, UTC+1)',
      tradingHours: '9:30 AM - 4:00 PM WAT',
    },
  });
});

/**
 * List TAVI Index Family
 */
investRouter.get('/invest/indices', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: memoryStore.indices,
  });
});

/**
 * List user orders
 */
investRouter.get('/invest/orders', authenticate, (req: Request, res: Response) => {
  const orders = memoryStore.orders.filter((o) => o.userId === req.user!.userId);
  res.json({ success: true, data: orders });
});

/**
 * Place Equity Order
 */
investRouter.post('/invest/orders', authenticate, validate(orderSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol, side, orderType, quantity, priceMinor, investPin } = req.body;

    if (investPin.length !== 4) {
      res.status(401).json({ success: false, error: { code: 'INVALID_INVEST_PIN', message: 'Invalid 4-digit Investment PIN.' } });
      return;
    }

    const newOrder = {
      id: `ord-${Date.now()}`,
      reference: `ORD${Date.now().toString().slice(-8)}`,
      userId: req.user!.userId,
      stockSymbol: symbol.toUpperCase(),
      side,
      orderType,
      quantity,
      priceMinor,
      estimatedValueMinor: quantity * priceMinor,
      status: 'FILLED', // Simulated instant execution in demo mode
      createdAt: new Date(),
    };

    memoryStore.orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: `Demo order for ${quantity} units of ${symbol} executed successfully.`,
    });
  } catch (err) {
    next(err);
  }
});
