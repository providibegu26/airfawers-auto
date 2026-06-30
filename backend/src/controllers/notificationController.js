const prisma = require('../config/prisma');

const UI_TYPE_MAP = {
  VEHICLE_ASSIGNED: 'info',
  FUEL_ASSIGNED: 'info',
  FUEL_COLLECTED: 'info',
  MILEAGE_UPDATED: 'info',
  MILEAGE_WINDOW_OPEN: 'warning',
  MAINTENANCE_SCHEDULED: 'warning',
  MAINTENANCE_URGENT: 'urgent',
  BREAKDOWN_REPORTED: 'urgent',
};

function formatNotification(notification) {
  const payload = notification.payload || {};

  return {
    id: notification.id,
    type: UI_TYPE_MAP[notification.type] || 'info',
    notificationType: notification.type,
    title: notification.titre,
    message: notification.message,
    read: notification.lu,
    timestamp: notification.createdAt,
    vehicle: payload.immatriculation || null,
    chauffeur: payload.chauffeurNom || null,
    quantite: payload.quantite ?? payload.quantity ?? null,
    quantity: payload.quantity ?? payload.quantite ?? null,
    fuelAttributionId: payload.fuelAttributionId || null,
    fuelCollectionId: payload.confirmationId || null,
    maintenanceType: payload.maintenanceType || null,
    daysRemaining: payload.daysRemaining ?? null,
    payload,
  };
}

async function listChauffeurNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        destinataireRole: 'chauffeur',
        destinataireUserId: req.user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({
      success: true,
      notifications: notifications.map(formatNotification),
    });
  } catch (error) {
    console.error('Erreur liste notifications chauffeur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

async function listAdminNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { destinataireRole: 'admin' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({
      success: true,
      notifications: notifications.map(formatNotification),
    });
  } catch (error) {
    console.error('Erreur liste notifications admin:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

async function getChauffeurUnreadCount(req, res) {
  try {
    const count = await prisma.notification.count({
      where: {
        destinataireRole: 'chauffeur',
        destinataireUserId: req.user.id,
        lu: false,
      },
    });

    return res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('Erreur compteur notifications chauffeur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

async function getAdminUnreadCount(req, res) {
  try {
    const count = await prisma.notification.count({
      where: { destinataireRole: 'admin', lu: false },
    });

    return res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('Erreur compteur notifications admin:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

async function markNotificationRead(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }

    if (req.user.role === 'chauffeur') {
      if (
        notification.destinataireRole !== 'chauffeur' ||
        notification.destinataireUserId !== req.user.id
      ) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
      }
    } else if (req.user.role === 'admin') {
      if (notification.destinataireRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { lu: true, luLe: new Date() },
    });

    return res.json({ success: true, notification: formatNotification(updated) });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    if (req.user.role === 'chauffeur') {
      await prisma.notification.updateMany({
        where: {
          destinataireRole: 'chauffeur',
          destinataireUserId: req.user.id,
          lu: false,
        },
        data: { lu: true, luLe: new Date() },
      });
    } else if (req.user.role === 'admin') {
      await prisma.notification.updateMany({
        where: { destinataireRole: 'admin', lu: false },
        data: { lu: true, luLe: new Date() },
      });
    } else {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    return res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

module.exports = {
  listChauffeurNotifications,
  listAdminNotifications,
  getChauffeurUnreadCount,
  getAdminUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
