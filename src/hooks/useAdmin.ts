import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { isClerkConfigured, useAuth, isLocalAuthMode } from './useAuth';

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

const CLERK_LOAD_TIMEOUT_MS = 3000;

function useClerkFallbackActive(clerkIsLoaded: boolean): boolean {
  const [timedOut, setTimedOut] = useState<boolean>(() => !isClerkConfigured);

  useEffect(() => {
    if (!isClerkConfigured || timedOut) return;
    if (clerkIsLoaded) return; // still loading – keep waiting
    const t = setTimeout(() => setTimedOut(true), CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [clerkIsLoaded]);

  return timedOut;
}

export function useAdmin() {
  const auth = useAuth();

  let clerkUser: ReturnType<typeof useUser>['user'] | null = null;
  let clerkLoaded = false;
  let fallbackActive = true;

  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { user, isLoaded } = useUser();
      clerkUser = user;
      clerkLoaded = isLoaded;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const fallbackFromTimeout = useClerkFallbackActive(isLoaded);
      fallbackActive = isLocalAuthMode() || fallbackFromTimeout;
    } catch {
      // Clerk provider unavailable – fall through to local check
    }
  }

  // Check auth user (local session or Clerk fallback)
  const localEmail = (auth.user?.email || '').toLowerCase();
  const isLocalAdmin =
    auth.user?.role === 'admin' ||
    (auth.userId && ALL_ADMIN_USER_IDS.has(auth.userId)) ||
    (localEmail && ALL_ADMIN_EMAILS.has(localEmail));

  if (!isClerkConfigured || fallbackActive) {
    return {
      isAdmin: Boolean(isLocalAdmin),
      isLoaded: true,
      userId: auth.userId,
      userEmail: auth.user?.email || null,
    };
  }

  if (!clerkLoaded || !clerkUser) {
    return {
      isAdmin: Boolean(isLocalAdmin),
      isLoaded: clerkLoaded,
      userId: auth.userId || null,
      userEmail: auth.user?.email || null,
    };
  }

  const clerkUserId = clerkUser.id;
  const clerkEmail = (clerkUser.primaryEmailAddress?.emailAddress || '').toLowerCase();
  const clerkMetadataRole = (clerkUser.publicMetadata as any)?.role;

  const isAdminByEnvOrId = ALL_ADMIN_USER_IDS.has(clerkUserId);
  const isAdminByEmail = clerkEmail ? ALL_ADMIN_EMAILS.has(clerkEmail) : false;
  const isAdminByMetadata = clerkMetadataRole === 'admin';
  const isAdminByLocal = auth.user?.role === 'admin';

  const isAdmin = Boolean(isAdminByEnvOrId || isAdminByEmail || isAdminByMetadata || isAdminByLocal || isLocalAdmin);

  return {
    isAdmin,
    isLoaded: true,
    userId: clerkUserId,
    userEmail: clerkEmail,
  };
}
