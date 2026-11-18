import { type UserRole, ROLE_LABELS } from './profiles';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface AppNotification {
  id: string;
  userId?: string;
  userEmail?: string;
  type: 'consultation' | 'event' | 'system' | 'role_invite';
  title: string;
  message: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'info' | 'accepted' | 'declined';
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

// Clean up old hardcoded mock notifications
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

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// Convert Supabase notification row to AppNotification object
function mapRemoteRowToNotification(row: any): AppNotification {
  const isRoleInvite = row.type === 'role_invite';
  const roleName = (row.doctor_name as UserRole) || 'user';
  const label = ROLE_LABELS[roleName] || roleName;
  const isEmail = typeof row.user_id === 'string' && row.user_id.includes('@');

  return {
    id: String(row.id),
    userId: isEmail ? undefined : row.user_id,
    userEmail: isEmail ? row.user_id : undefined,
    type: row.type,
    title: row.title,
    message: row.message,
    status: row.status,
    read: Boolean(row.read),
    doctorName: row.doctor_name,
    date: row.date,
    time: row.time,
    createdAt: row.created_at || new Date().toISOString(),
    roleInvite: isRoleInvite
      ? {
          role: roleName,
          roleLabel: label,
          invitedBy: row.date || 'Administrator',
          status: (row.status as any) || 'pending',
        }
      : undefined,
  };
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

/**
 * Checks whether an AppNotification belongs to a specific user (by ID or Email)
 */
export function isNotificationForUser(
  n: AppNotification,
  userId?: string | null,
  userEmail?: string | null
): boolean {
  if (n.type === 'system' && !n.userId && !n.userEmail) return true;

  const uid = userId?.trim();
  const uemail = userEmail?.trim().toLowerCase();

  if (uid) {
    if (n.userId && n.userId === uid) return true;
    if (n.userEmail && n.userEmail === uid) return true;
  }
  if (uemail) {
    if (n.userEmail && n.userEmail.trim().toLowerCase() === uemail) return true;
    if (n.userId && n.userId.trim().toLowerCase() === uemail) return true;
  }
  return false;
}

/**
 * Returns locally cached notifications for instant rendering.
 * Automatically triggers background cloud sync.
 */
export function getNotifications(
  userEmailOrId?: string | null,
  userEmailSecondary?: string | null
): AppNotification[] {
  if (typeof window === 'undefined') return [];
  purgeLegacyMockNotifications();

  let uid = userEmailOrId?.includes('@') ? undefined : userEmailOrId;
  let email = userEmailOrId?.includes('@') ? userEmailOrId : userEmailSecondary;

  // Trigger background remote fetch if user context is available
  if ((uid || email) && isSupabaseConfigured && supabase) {
    void fetchRemoteNotifications(uid, email);
  }

  const all = getAllNotificationsRaw();
  if (!uid && !email) {
    return all.filter((n) => n.type === 'system' && !n.userId && !n.userEmail);
  }

  return all.filter((n) => isNotificationForUser(n, uid, email));
}

/**
 * Fetches notifications directly from Supabase cloud database,
 * merges them into local storage, and dispatches UI updates.
 */
export async function fetchRemoteNotifications(
  userId?: string | null,
  userEmail?: string | null
): Promise<AppNotification[]> {
  if (!isSupabaseConfigured || !supabase || (!userId && !userEmail)) {
    return getNotifications(userId, userEmail);
  }

  try {
    const conditions: string[] = [];
    if (userId && userId.trim()) {
      conditions.push(`user_id.eq.${userId.trim()}`);
    }
    if (userEmail && userEmail.trim()) {
      const cleanEmail = userEmail.trim().toLowerCase();
      conditions.push(`user_id.eq.${cleanEmail}`);
      conditions.push(`user_id.ilike.${cleanEmail}`);
    }

    let query = supabase.from('notifications').select('*');
    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      return getNotifications(userId, userEmail);
    }

    const remoteNotifs = data.map(mapRemoteRowToNotification);

    // Merge with local storage
    const currentLocal = getAllNotificationsRaw();
    const map = new Map<string, AppNotification>();

    // Put local first
    currentLocal.forEach((n) => map.set(n.id, n));
    // Overwrite with fresh authoritative cloud records
    remoteNotifs.forEach((n) => map.set(n.id, n));

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    saveNotifications(merged);

    return merged.filter((n) => isNotificationForUser(n, userId, userEmail));
  } catch (err) {
    console.warn('Error fetching remote notifications:', err);
    return getNotifications(userId, userEmail);
  }
}

/**
 * Adds a notification locally AND syncs to Supabase cloud database
 */
export function addNotification(
  notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): AppNotification {
  const current = getAllNotificationsRaw();
  const localId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newNotif: AppNotification = {
    ...notif,
    id: localId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const updated = [newNotif, ...current];
  saveNotifications(updated);

  // Sync to Supabase cloud database
  if (isSupabaseConfigured && supabase) {
    const targetUserId = (notif.userEmail || notif.userId || '').trim().toLowerCase();
    if (targetUserId) {
      void (async () => {
        try {
          const { error } = await supabase.from('notifications').insert([
            {
              user_id: targetUserId,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              status: notif.status || (notif.roleInvite?.status ?? 'pending'),
              read: false,
              doctor_name: notif.roleInvite?.role || notif.doctorName || null,
              date: notif.roleInvite?.invitedBy || notif.date || null,
              time: notif.time || new Date().toISOString(),
            },
          ]);
          if (error) {
            console.warn('Supabase notification insert warning:', error.message);
          }
        } catch (err) {
          console.warn('Supabase notification insert error:', err);
        }
      })();
    }
  }

  return newNotif;
}

export function markAsRead(id: string) {
  const current = getAllNotificationsRaw();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);

  if (isSupabaseConfigured && supabase) {
    void (async () => {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch {}
    })();
  }
}

export function markAllAsRead(userId?: string | null, userEmail?: string | null) {
  const current = getAllNotificationsRaw();
  const updated = current.map((n) => {
    if (!userId && !userEmail) return { ...n, read: true };
    if (isNotificationForUser(n, userId, userEmail)) return { ...n, read: true };
    return n;
  });
  saveNotifications(updated);

  if (isSupabaseConfigured && supabase) {
    void (async () => {
      try {
        const conditions: string[] = [];
        if (userId) conditions.push(`user_id.eq.${userId.trim()}`);
        if (userEmail) {
          const em = userEmail.trim().toLowerCase();
          conditions.push(`user_id.eq.${em}`);
          conditions.push(`user_id.ilike.${em}`);
        }
        if (conditions.length > 0) {
          await supabase.from('notifications').update({ read: true }).or(conditions.join(','));
        }
      } catch {}
    })();
  }
}

export function clearNotifications(userId?: string | null, userEmail?: string | null) {
  const current = getAllNotificationsRaw();
  const kept = current.filter((n) => {
    if (!userId && !userEmail) return false;
    return !isNotificationForUser(n, userId, userEmail);
  });
  saveNotifications(kept);

  if (isSupabaseConfigured && supabase) {
    void (async () => {
      try {
        const conditions: string[] = [];
        if (userId) conditions.push(`user_id.eq.${userId.trim()}`);
        if (userEmail) {
          const em = userEmail.trim().toLowerCase();
          conditions.push(`user_id.eq.${em}`);
          conditions.push(`user_id.ilike.${em}`);
        }
        if (conditions.length > 0) {
          await supabase.from('notifications').delete().or(conditions.join(','));
        }
      } catch {}
    })();
  }
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
        status,
        roleInvite: {
          ...n.roleInvite,
          status,
        },
      };
    }
    return n;
  });
  saveNotifications(updated);

  if (isSupabaseConfigured && supabase) {
    void (async () => {
      try {
        await supabase
          .from('notifications')
          .update({ status, read: true })
          .eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase notification status update warning:', err);
      }
    })();
  }
}

/**
 * Checks Supabase for any pending role invitation targeted to this user.
 * Returns the invitation details if one is currently pending.
 */
export async function getPendingRoleInviteForUser(
  userId?: string | null,
  userEmail?: string | null
): Promise<{ newRole: UserRole; invitedBy: string; notifId: string } | null> {
  if (!isSupabaseConfigured || !supabase || (!userId && !userEmail)) {
    return null;
  }

  try {
    const conditions: string[] = [];
    if (userId && userId.trim()) {
      conditions.push(`user_id.eq.${userId.trim()}`);
    }
    if (userEmail && userEmail.trim()) {
      const cleanEmail = userEmail.trim().toLowerCase();
      conditions.push(`user_id.eq.${cleanEmail}`);
      conditions.push(`user_id.ilike.${cleanEmail}`);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'role_invite')
      .eq('status', 'pending')
      .or(conditions.join(','))
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const row = data[0];
    const role = (row.doctor_name as UserRole) || 'user';
    return {
      newRole: role,
      invitedBy: row.date || 'System Administrator',
      notifId: String(row.id),
    };
  } catch {
    return null;
  }
}

/**
 * Admin view: Fetches all active pending role invites across the entire platform
 * so the Admin user table displays pending badges across any device.
 */
export async function getAllPendingRoleInvitesAdmin(): Promise<Map<string, { role: UserRole; invitedBy: string }>> {
  const map = new Map<string, { role: UserRole; invitedBy: string }>();

  if (!isSupabaseConfigured || !supabase) {
    return map;
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'role_invite')
      .eq('status', 'pending');

    if (!error && data) {
      data.forEach((row) => {
        const key = (row.user_id || '').trim().toLowerCase();
        if (key) {
          map.set(key, {
            role: (row.doctor_name as UserRole) || 'user',
            invitedBy: row.date || 'Administrator',
          });
        }
      });
    }
  } catch {
    // ignore
  }

  return map;
}
