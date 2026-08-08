import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { isClerkConfigured, useAuth, isLocalAuthMode } from './useAuth';

// Mirrors the timeout used in useAuth.ts – if Clerk never becomes ready,
// admin detection gracefully falls back to the local account check.
const CLERK_LOAD_TIMEOUT_MS = 3000;

function useClerkFallbackActive(clerkIsLoaded: boolean): boolean {
  const [timedOut, setTimedOut] = useState<boolean>(() => !isClerkConfigured);

  useEffect(() => {
    if (!isClerkConfigured || timedOut) return;
    if (clerkIsLoaded) return; // still loading – keep waiting
    const t = setTimeout(() => setTimedOut(true), CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!isClerkConfigured || fallbackActive) {
    // Local admin detection
    const email = (auth.user?.email || '').toLowerCase();
    const isLocalAdmin =
      auth.user?.role === 'admin' ||
      email === 'admin@ayush.gov.in' ||
      email.includes('admin');

    return {
      isAdmin: Boolean(isLocalAdmin),
      isLoaded: true,
      userId: auth.userId,
      userEmail: auth.user?.email || null,
    };
  }

  if (!clerkLoaded || !clerkUser) {
    return {
      isAdmin: false,
      isLoaded: clerkLoaded,
      userId: null,
      userEmail: null,
    };
  }

  const adminEnvId = import.meta.env.VITE_ADMIN_USER_ID;
  const isAdminByEnv = adminEnvId && adminEnvId !== 'user_your_clerk_user_id_here' && clerkUser.id === adminEnvId;
  const isAdminByMetadata = (clerkUser.publicMetadata as any)?.role === 'admin';
  const isAdmin = Boolean(isAdminByEnv || isAdminByMetadata);

  return {
    isAdmin,
    isLoaded: true,
    userId: clerkUser.id,
    userEmail: clerkUser.primaryEmailAddress?.emailAddress || null,
  };
}
