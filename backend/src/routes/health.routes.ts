import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../services/db.service.js';

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health and operational status
 *     responses:
 *       200:
 *         description: Platform operational
 */
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    brand: 'TAVI Financial Platform',
    tagline: 'Move. Manage. Grow.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: isDatabaseConnected(),
      mode: isDatabaseConnected() ? 'PostgreSQL (Authoritative)' : 'In-Memory ACID Ledger (Demo)',
    },
    services: {
      auth: 'ACTIVE',
      ledger: 'ACTIVE',
      investments: 'ACTIVE',
      fx: 'ACTIVE',
    },
  });
});
