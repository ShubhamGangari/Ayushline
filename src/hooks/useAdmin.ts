import { useAuth } from './useAuth';
import { getLocalProfile } from '../lib/api/profiles';

// Environment variables for admin configuration
const envAdminIdsRaw = (import.meta.env.VITE_ADMIN_USER_ID || import.meta.env.VITE_ADMIN_USER_IDS || '').toString();
const envAdminIds = envAdminIdsRaw
  .split(',')
  .map((id) => id.trim().replace(/^["']|["']$/g, ''))
  .filter((id) => id && id !== 'user_your_clerk_user_id_here');

// Admin emails from environment
const envAdminEmailsRaw = (import.meta.env.VITE_ADMIN_EMAIL || import.meta.env.VITE_ADMIN_EMAILS || '').toString();
const envAdminEmails = envAdminEmailsRaw
  .split(',')
  .map((email) => email.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

// All admin user IDs (no hardcoded values)
const ALL_ADMIN_USER_IDS = new Set([...envAdminIds]);

// All admin emails (no hardcoded values)
const ALL_ADMIN_EMAILS = new Set([...envAdminEmails]);

export function useAdmin() {
  const auth = useAuth();

  const userEmail = (auth.user?.email || '').trim().toLowerCase();
  const userId = auth.userId || auth.user?.id || '';
  const userRole = (auth.user?.role || '').toString().toLowerCase();

  const localProf = userId ? getLocalProfile(userId) : (userEmail ? getLocalProfile(userEmail) : null);
  const isAdminByProfile = localProf?.role === 'admin';

  const isAdminByEnvEmail = Boolean(userEmail && ALL_ADMIN_EMAILS.has(userEmail));
  const isAdminByEnvId = Boolean(userId && ALL_ADMIN_USER_IDS.has(userId));
  const isAdminByRole = userRole === 'admin' || isAdminByProfile;

  const isAdmin = Boolean(auth.isSignedIn && (isAdminByEnvEmail || isAdminByEnvId || isAdminByRole));

  return {
    isAdmin,
    isLoaded: auth.isLoaded,
    userId: userId || null,
    userEmail: userEmail || null,
  };
}
