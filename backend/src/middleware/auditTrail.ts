import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { recordAudit } from '../services/audit.service.js';

const FRIENDLY: Array<[RegExp, string]> = [
  [/\/auth\/login$/, 'USER_LOGIN'],
  [/\/auth\/register$/, 'USER_REGISTERED'],
  [/\/transactions\/transfer$/, 'TRANSFER_INITIATED'],
  [/\/sandbox\/reset/, 'DEMO_RESET'],
];

/**
 * Records every state-changing API call (POST/PUT/PATCH/DELETE) with a timestamp.
 * Request bodies are never stored, so passwords and PINs never reach the audit log.
 */
export function auditTrail(req: Request, res: Response, next: NextFunction): void {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    next();
    return;
  }
  res.on('finish', () => {
    const path = req.originalUrl.split('?')[0];
    if (path.includes('/admin/')) return; // admin actions are audited explicitly
    const decoded = (req.headers.authorization?.startsWith('Bearer ')
      ? jwt.decode(req.headers.authorization.substring(7))
      : null) as { userId?: string } | null;
    const friendly = FRIENDLY.find(([re]) => re.test(path));
    recordAudit({
      actorType: decoded?.userId ? 'USER' : 'ANONYMOUS',
      actorId: decoded?.userId || null,
      action: friendly ? friendly[1] : `${req.method} ${path}`,
      status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
      ip: req.ip,
      details: { httpStatus: res.statusCode },
    });
  });
  next();
}

