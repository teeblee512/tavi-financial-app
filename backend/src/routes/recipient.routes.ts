import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { findUserByIdentifier, getEligibleRecipients } from '../services/db.service.js';

export const recipientRouter = Router();

/**
 * Safe recipient lookup endpoint
 * Resolves phone number, account number, demo tag (@...), or email
 */
recipientRouter.get('/recipients/lookup', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.query || '').trim();
    const currentUserId = req.user!.userId;

    if (!query) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Lookup query is required (phone, account number, or @demoTag).' },
      });
      return;
    }

    const match = findUserByIdentifier(query);
    if (!match) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECIPIENT_NOT_FOUND',
          message: `No registered TAVI demo recipient matches "${query}".`,
        },
      });
      return;
    }

    const { user, profile, wallet } = match;
    const isSelf = user.id === currentUserId;

    res.json({
      success: true,
      data: {
        userId: user.id,
        name: profile?.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'TAVI User',
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        demoTag: user.demoTag || profile?.demoTag || `@user${user.phone?.slice(-4)}`,
        accountNumber: wallet?.providerAccountNumber || '9920394811',
        bankName: wallet?.providerName || 'Providus Bank (Demo)',
        isSelf,
        isEligible: !isSelf,
        isDemo: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Returns active registered demo directory for 1-click test transfer recipient selection
 */
recipientRouter.get('/recipients/demo-directory', authenticate, (req: Request, res: Response) => {
  const currentUserId = req.user!.userId;
  const directory = getEligibleRecipients(currentUserId);

  res.json({
    success: true,
    data: directory,
    count: directory.length,
  });
});
