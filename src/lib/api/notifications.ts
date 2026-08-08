export interface AppNotification {
  id: string;
  type: 'consultation' | 'event' | 'system';
  title: string;
  message: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'info';
  doctorName?: string;
  date?: string;
  time?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'ayush_user_notifications';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'consultation',
    title: 'Consultation Accepted 🎉',
    message: 'Dr. Ananya Sharma (Ayurveda Specialist) accepted your video consultation request.',
    status: 'confirmed',
    doctorName: 'Dr. Ananya Sharma',
    date: 'Tomorrow',
    time: '10:30 AM',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
  },
  {
    id: 'notif-2',
    type: 'consultation',
    title: 'Consultation Pending Approval ⏳',
    message: 'Your appointment request with Dr. Priya Singh (Yoga & Pranayama) is currently under review.',
    status: 'pending',
    doctorName: 'Dr. Priya Singh',
    date: 'Aug 12, 2026',
    time: '04:00 PM',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: 'notif-3',
    type: 'event',
    title: 'Upcoming Event Alert 🌿',
    message: 'National AYUSH Research Summit 2026 starts in 3 days. Registered pass active.',
    status: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    read: true,
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Welcome to AYUSHLINE Portal',
    message: 'Your account is active. You can now consult top AYUSH practitioners, register for seminars, and post research articles.',
    status: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    read: true,
  },
];

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event('ayush_notification_update'));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return newNotif;
}

export function markAsRead(id: string) {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead() {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearNotifications() {
  saveNotifications([]);
}
