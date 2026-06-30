const express = require('express');
const {
  listChauffeurNotifications,
  listAdminNotifications,
  getChauffeurUnreadCount,
  getAdminUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');
const { authenticateToken, requireChauffeur, requireAdmin } = require('../middleware/auth');

const chauffeurRouter = express.Router();
chauffeurRouter.get(
  '/',
  authenticateToken,
  requireChauffeur,
  listChauffeurNotifications
);
chauffeurRouter.get(
  '/unread-count',
  authenticateToken,
  requireChauffeur,
  getChauffeurUnreadCount
);
chauffeurRouter.patch(
  '/read-all',
  authenticateToken,
  requireChauffeur,
  markAllNotificationsRead
);
chauffeurRouter.patch(
  '/:id/read',
  authenticateToken,
  requireChauffeur,
  markNotificationRead
);

const adminRouter = express.Router();
adminRouter.get('/', authenticateToken, requireAdmin, listAdminNotifications);
adminRouter.get('/unread-count', authenticateToken, requireAdmin, getAdminUnreadCount);
adminRouter.patch('/read-all', authenticateToken, requireAdmin, markAllNotificationsRead);
adminRouter.patch('/:id/read', authenticateToken, requireAdmin, markNotificationRead);

module.exports = { chauffeurNotificationRoutes: chauffeurRouter, adminNotificationRoutes: adminRouter };
