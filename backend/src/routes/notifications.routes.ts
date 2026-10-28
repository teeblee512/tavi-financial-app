import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { memoryStore } from '../services/db.service.js';

export const notificationRouter = Router();

/**
 * List Notifications
 */
notificationRouter.get('/notifications', authenticate, (req: Request, res: Response) => {
  const notifs = memoryStore.notifications.filter((n) => n.userId === req.user!.userId);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    data: notifs,
    unreadCount,
  });
});

/**
 * Mark all as read
 */
notificationRouter.post('/notifications/read-all', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  memoryStore.notifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });

  res.json({ success: true, message: 'All notifications marked as read.' });
});

/**
 * Mark single notification as read
 */
notificationRouter.patch('/notifications/:id/read', authenticate, (req: Request, res: Response) => {
  const notif = memoryStore.notifications.find((n) => n.id === req.params.id && n.userId === req.user!.userId);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true, data: notif });
});
