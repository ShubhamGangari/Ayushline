import { type UserRole } from './profiles';

export interface AppNotification {
  id: string;
  userId?: string;
  userEmail?: string;
  type: 'consultation' | 'event' | 'system' | 'role_invite';
  title: string;
  message: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'info';
  doctorName?: string;
  date?: string;
  time?: string;
  createdAt: string;
  read: boolean;
  roleInvite?: {
    role: UserRole;
    roleLabel: string;
    invitedBy: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

const STORAGE_KEY = 'ayush_user_notifications_v3';
const LEGACY_STORAGE_KEYS = ['ayush_user_notifications', 'ayush_notifications'];

// Clean up old hardcoded mock notifications (e.g. dummy Dr. Ananya Sharma / Priya Singh entries)
function purgeLegacyMockNotifications() {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

// Initial default notifications: empty array for clean, authentic user logs only
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export function getNotifications(userEmailOrId?: string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  purgeLegacyMockNotifications();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: AppNotification[] = JSON.parse(raw);

    // Filter out legacy dummy notifs if any slipped in
    const cleaned = all.filter((n) => {
      const isLegacyDummy =
        n.id === 'notif-1' ||
        n.id === 'notif-2' ||
        n.id === 'notif-3' ||
        n.id === 'notif-4' ||
        (n.doctorName === 'Dr. Ananya Sharma' && !n.userId && !n.userEmail) ||
        (n.doctorName === 'Dr. Priya Singh' && !n.userId && !n.userEmail);
      return !isLegacyDummy;
    });

    if (cleaned.length !== all.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }

    if (!userEmailOrId) {
      // If guest or no user context provided, only return global system announcements (if any)
      return cleaned.filter((n) => n.type === 'system' && !n.userId && !n.userEmail);
    }

    const needle = userEmailOrId.trim().toLowerCase();
    return cleaned.filter((n) => {
      // Match by exact user ID
      if (n.userId && n.userId === userEmailOrId) return true;
      // Match by user Email
      if (n.userEmail && n.userEmail.trim().toLowerCase() === needle) return true;
      // System wide announcements targeted to all
      if (n.type === 'system' && !n.userId && !n.userEmail) return true;
      return false;
    });
  } catch {
    return [];
  }
}

export function getAllNotificationsRaw(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event('ayush_notification_update'));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function addNotification(
  notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): AppNotification {
  const current = getAllNotificationsRaw();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return newNotif;
}

export function markAsRead(id: string) {
  const current = getAllNotificationsRaw();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead(userEmailOrId?: string) {
  const current = getAllNotificationsRaw();
  const needle = userEmailOrId?.trim().toLowerCase();
  const updated = current.map((n) => {
    if (!needle) return { ...n, read: true };
    const matches =
      n.userId === userEmailOrId ||
      (n.userEmail && n.userEmail.trim().toLowerCase() === needle) ||
      (n.type === 'system' && !n.userId && !n.userEmail);
    return matches ? { ...n, read: true } : n;
  });
  saveNotifications(updated);
}

export function clearNotifications(userEmailOrId?: string) {
  if (!userEmailOrId) {
    saveNotifications([]);
    return;
  }
  const current = getAllNotificationsRaw();
  const needle = userEmailOrId.trim().toLowerCase();
  const kept = current.filter((n) => {
    const matches =
      n.userId === userEmailOrId ||
      (n.userEmail && n.userEmail.trim().toLowerCase() === needle);
    return !matches;
  });
  saveNotifications(kept);
}

export function updateNotificationRoleInviteStatus(
  notificationId: string,
  status: 'accepted' | 'declined'
) {
  const current = getAllNotificationsRaw();
  const updated = current.map((n) => {
    if (n.id === notificationId && n.roleInvite) {
      return {
        ...n,
        read: true,
        roleInvite: {
          ...n.roleInvite,
          status,
        },
      };
    }
    return n;
  });
  saveNotifications(updated);
}
