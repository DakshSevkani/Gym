import { AppNotification, Role } from '../types';

const NOTIF_STORAGE_KEY = 'powerhouse_gym_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const getStoredNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveNotifications = (notifs: AppNotification[]): void => {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
  } catch (err) {
    console.warn('Failed to save notifications:', err);
  }
};

export const sendNotification = (newNotif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification => {
  const current = getStoredNotifications();
  const created: AppNotification = {
    ...newNotif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const updated = [created, ...current];
  saveNotifications(updated);
  return created;
};

export const filterNotificationsForUser = (
  allNotifs: AppNotification[],
  role: Role,
  user?: any
): AppNotification[] => {
  const userId = typeof user === 'string' ? user : user?.id;
  const userName = typeof user === 'string' ? user : user?.name;
  const userEmail = typeof user === 'object' ? user?.email : undefined;

  return allNotifs.filter((n) => {
    if (role === 'OWNER') {
      // Owner sees all sent and received system notifications
      return true;
    }

    if (role === 'TRAINER') {
      // Trainer sees: ALL, TRAINERS, SPECIFIC_TRAINER targeting them, or notifications they sent
      if (n.targetRole === 'ALL' || n.targetRole === 'TRAINERS') return true;
      if (n.senderRole === 'TRAINER') return true;
      if (n.targetRole === 'SPECIFIC_TRAINER') {
        if (!n.recipientId && !n.recipientName) return true;
        if (userId && String(n.recipientId) === String(userId)) return true;
        if (userName && n.recipientName?.toLowerCase() === userName.toLowerCase()) return true;
        if (userEmail && n.recipientName?.toLowerCase() === userEmail.toLowerCase()) return true;
      }
      return false;
    }

    if (role === 'MEMBER') {
      // Member sees: ALL, MEMBERS, or SPECIFIC_MEMBER targeting them
      if (n.targetRole === 'ALL' || n.targetRole === 'MEMBERS') return true;
      if (n.targetRole === 'SPECIFIC_MEMBER') {
        if (!n.recipientId && !n.recipientName) return true;
        if (userId && String(n.recipientId) === String(userId)) return true;
        if (userName && n.recipientName?.toLowerCase() === userName.toLowerCase()) return true;
        if (userEmail && n.recipientName?.toLowerCase() === userEmail.toLowerCase()) return true;
        if (userName && n.recipientName && (userName.toLowerCase().includes(n.recipientName.toLowerCase()) || n.recipientName.toLowerCase().includes(userName.toLowerCase()))) return true;
        // If sent by Trainer with targetRole SPECIFIC_MEMBER, allow members to view
        if (n.senderRole === 'TRAINER') return true;
      }
      return false;
    }

    return true;
  });
};
