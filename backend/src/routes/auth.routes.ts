import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { memoryStore } from '../services/db.service.js';

export const authRouter = Router();

const registerSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Valid Nigerian phone number required'),
    email: z.string().email('Invalid email address format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    phoneOrEmail: z.string().min(1, 'Phone or email required'),
    passwordOrPin: z.string().min(1, 'Password or PIN required'),
  }),
});

const pinVerifySchema = z.object({
  body: z.object({
    pin: z.string().length(4, 'PIN must be exactly 4 digits'),
    type: z.enum(['transaction', 'invest']).optional(),
  }),
});

/**
 * User Registration
 */
authRouter.post('/auth/register', authRateLimiter, validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * User Login
 */
authRouter.post('/auth/login', authRateLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Current Authenticated Profile
 */
authRouter.get('/auth/me', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = memoryStore.users.get(userId);
  const profile = memoryStore.profiles.get(userId);

  if (!user) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      kycTier: user.kycTier,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      displayName: profile?.displayName,
      countryCode: profile?.countryCode,
      currencyPreference: profile?.currencyPreference,
    },
  });
});

/**
 * PIN Verification (Transaction & Investment Security Boundary)
 */
authRouter.post('/auth/pin/verify', authenticate, validate(pinVerifySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pin, type } = req.body;
    const isValid = await AuthService.verifyPin(req.user!.userId, pin, type);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_PIN', message: 'The entered 4-digit PIN is incorrect.' },
      });
      return;
    }
    res.json({ success: true, message: 'PIN verified successfully.' });
  } catch (err) {
    next(err);
  }
});
