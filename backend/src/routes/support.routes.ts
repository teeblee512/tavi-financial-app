import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { memoryStore } from '../services/db.service.js';

export const supportRouter = Router();

const caseSchema = z.object({
  body: z.object({
    category: z.string().min(2),
    subject: z.string().min(3),
    description: z.string().min(10),
    relatedTxId: z.string().optional(),
  }),
});

/**
 * List Support Cases for current user
 */
supportRouter.get('/support/cases', authenticate, (req: Request, res: Response) => {
  const cases = memoryStore.supportCases.filter((c) => c.userId === req.user!.userId);
  res.json({ success: true, data: cases });
});

/**
 * Create a new Support Case
 */
supportRouter.post('/support/cases', authenticate, validate(caseSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, subject, description, relatedTxId } = req.body;
    const ref = `CAS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCase = {
      id: `case-${Date.now()}`,
      reference: ref,
      userId: req.user!.userId,
      category,
      subject,
      description,
      relatedTxId: relatedTxId || null,
      status: 'SUBMITTED',
      createdAt: new Date(),
      updates: [
        {
          id: `up-${Date.now()}`,
          author: 'TAVI Automated System',
          message: 'Case received and logged with priority dispatch. An assigned agent will review your records shortly.',
          timestamp: new Date(),
        },
      ],
    };

    memoryStore.supportCases.unshift(newCase);

    res.status(201).json({
      success: true,
      data: newCase,
      message: `Support case ${ref} created successfully.`,
    });
  } catch (err) {
    next(err);
  }
});
