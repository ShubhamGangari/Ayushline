import { useState, useEffect, useMemo } from 'react';
import {
  useAuth as useClerkAuth,
  UserButton as ClerkUserButton,
  useClerk,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useUser as useClerkUser,
} from '@clerk/clerk-react';
import { validateEmail, validatePassword } from '../lib/authValidation';
import { createOrUpsertProfile } from '../lib/api/profiles';
import { LocalUserButton } from '../components/auth/LocalUserButton';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'doctor' | 'student' | 'institution' | 'org';
  avatarUrl?: string;
  password?: string;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'ayush_registered_users_v2';
const STORAGE_SESSION_KEY = 'ayush_active_session_v2';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const isClerkConfigured =
  Boolean(PUBLISHABLE_KEY) &&
  PUBLISHABLE_KEY.startsWith('pk_') &&
  PUBLISHABLE_KEY.length > 20 &&
  PUBLISHABLE_KEY !== 'pk_test_placeholder' &&
  !PUBLISHABLE_KEY.startsWith('pk_test_your_');

// If Clerk does not become ready within this window (slow network, blocked domain,
// or missing allowlist entry), the app gracefully falls back to the local auth mode
// so users are never stuck on a loading screen. Kept short so the page never
// feels slow even when Clerk is unresponsive.
const CLERK_LOAD_TIMEOUT_MS = 3000;

// Module-level flag: once the local fallback activates, any component can query it
// (e.g. to show demo-login shortcuts) even though it is not React state.
let activeLocalAuthMode = false;

/**
 * Returns `true` when the local auth fallback should be used:
 * - Clerk is not configured at all, OR
 * - Clerk is configured but failed to become ready within the timeout.
 * Once the fallback activates it stays active for the session, so the UI never
 * flips identity mid-way if Clerk happens to load very late.
 */
function useClerkFallbackActive(clerkIsLoaded: boolean): boolean {
  const [timedOut, setTimedOut] = useState<boolean>(() => !isClerkConfigured);

  useEffect(() => {
    if (!isClerkConfigured || timedOut) return;
    if (clerkIsLoaded) return; // still loading – keep waiting
    const t = setTimeout(() => {
      activeLocalAuthMode = true;
      setTimedOut(true);
    }, CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkIsLoaded]);

  return timedOut;
}

/**
 * True when the app is currently running on the local auth mode (either Clerk is
 * not configured, or its bootstrap timed out). Read during render – components
 * re-render when the underlying auth state flips.
 */
export function isLocalAuthMode(): boolean {
  return activeLocalAuthMode || !isClerkConfigured;
}

// Helper to get local registered users
export function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper to save local registered user
export function saveLocalUser(user: LocalUser) {
  const users = getLocalUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Helper to get active local session
export function getLocalSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Helper to set active local session
export function setLocalSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
}

// Global state listener hook for local auth
function useLocalAuthState() {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() => getLocalSession());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getLocalSession());
    };
    window.addEventListener('ayush_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('ayush_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return currentUser;
}

export function useAuth() {
  const localUser = useLocalAuthState();

  let clerkAuth: ReturnType<typeof useClerkAuth> | null = null;
  let clerkUser: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    role: string;
  } | null = null;
  let fallbackActive = true;

  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const cAuth = useClerkAuth();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const cUser = useClerkUser();

      clerkAuth = cAuth;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const fallbackFromTimeout = useClerkFallbackActive(cAuth.isLoaded);
      // When Clerk is configured and ready it is the source of truth, so a
      // leftover local demo session must not hijack the real Clerk identity.
      fallbackActive = isLocalAuthMode() || fallbackFromTimeout;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const user = useMemo(() => {
        if (!cUser.user) return null;
        return {
          id: cUser.user.id,
          email: cUser.user.primaryEmailAddress?.emailAddress || '',
          name: cUser.user.fullName || cUser.user.firstName || 'User',
          avatarUrl: cUser.user.imageUrl,
          role:
            (cUser.user.publicMetadata?.role as any) ||
            (cUser.user.unsafeMetadata?.role as any) ||
            'user',
        };
      }, [
        cUser.user?.id,
        cUser.user?.primaryEmailAddress?.emailAddress,
        cUser.user?.fullName,
        cUser.user?.firstName,
        cUser.user?.imageUrl,
        cUser.user?.publicMetadata?.role,
        cUser.user?.unsafeMetadata?.role,
      ]);
      clerkUser = user;
    } catch {
      // Clerk provider unavailable – fall through to local mode
    }
  }

  if (isClerkConfigured && !fallbackActive && clerkAuth) {
    return {
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn,
      userId: clerkAuth.userId,
      sessionId: clerkAuth.sessionId,
      user: clerkUser,
      getToken: clerkAuth.getToken,
      signOut: clerkAuth.signOut,
    };
  }

  // Local (fallback) mode – never blocks on loading
  return {
    isLoaded: true,
    isSignedIn: Boolean(localUser),
    userId: localUser?.id || null,
    sessionId: localUser ? `sess_${localUser.id}` : null,
    user: localUser,
    getToken: async () => null,
    signOut: async () => {
      setLocalSession(null);
    },
  };
}

export function useSignIn() {
  const localUser = useLocalAuthState();

  let clerkSignIn: ReturnType<typeof useClerkSignIn> | null = null;
  let fallbackActive = true;

  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const csi = useClerkSignIn();
      clerkSignIn = csi;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const fallbackFromTimeout = useClerkFallbackActive(csi.isLoaded);
      fallbackActive = isLocalAuthMode() || fallbackFromTimeout;
    } catch {
      // Clerk provider unavailable – fall through to local mode
    }
  }

  if (isClerkConfigured && !fallbackActive && clerkSignIn) {
    return clerkSignIn;
  }

  return {
    isLoaded: true,
    signIn: {
      create: async ({ identifier, password }: { identifier?: string; password?: string }) => {
        const email = (identifier || '').trim();
        const pwd = password || '';

        const val = validateEmail(email);
        if (!val.isValid) {
          throw { errors: [{ message: val.error }] };
        }

        const users = getLocalUsers();
        const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!target) {
          throw {
            errors: [
              {
                message:
                  'No account found with this email address. Please sign up first.',
              },
            ],
          };
        }

        if (target.password && target.password !== pwd) {
          throw {
            errors: [
              {
                message:
                  'Incorrect password! Please check your password and try again.',
              },
            ],
          };
        }

        setLocalSession(target);
        return {
          status: 'complete',
          createdSessionId: `sess_${target.id}`,
        };
      },
      authenticateWithRedirect: async () => {
        // Google OAuth requires Clerk – not available in local fallback mode.
      },
      attemptFirstFactor: async ({ code, password }: { code?: string; password?: string }) => {
        if (!code || code.trim().length < 4) {
          throw { errors: [{ message: 'Please enter a valid verification code.' }] };
        }
        const pwdVal = validatePassword(password || '');
        if (!pwdVal.isValid) {
          throw { errors: [{ message: pwdVal.error }] };
        }
        return { status: 'complete', createdSessionId: `sess_reset_${Date.now()}` };
      },
    },
    setActive: async ({ session }: { session?: string | null }) => {
      if (session && !localUser) {
        // keep active
      }
    },
  };
}

/**
 * Dedicated Google OAuth flow.
 *
 * Unlike `useSignUp`/`useSignIn` (which may fall back to the local demo mode
 * when Clerk loads slowly), this hook always talks to the real Clerk OAuth
 * provider whenever Clerk is configured. This guarantees the "Continue with
 * Google" button opens the actual Google sign-in instead of a demo form.
 */
export function useGoogleOAuth() {
  // The Clerk *instance* (useClerk) keeps a stable object identity across
  // renders, so reading its live getters inside the async polling loop below is
  // always up to date. The useSignUp/useSignIn hook objects are recreated on
  // every render and would go stale inside an async closure, and window.Clerk
  // is only set when ClerkJS is loaded via the CDN script — so we treat the
  // instance as the primary source and keep both others as fallbacks.
  let clerkInstance: ReturnType<typeof useClerk> | null = null;
  let clerkSignUp: ReturnType<typeof useClerkSignUp> | null = null;
  let clerkSignIn: ReturnType<typeof useClerkSignIn> | null = null;

  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      clerkInstance = useClerk();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      clerkSignUp = useClerkSignUp();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      clerkSignIn = useClerkSignIn();
    } catch {
      // Clerk provider unavailable – Google OAuth will report unavailable
    }
  }

  /**
   * Waits for the Clerk SDK to finish loading in the browser. Clerk loads
   * asynchronously after the page mounts, so a user can click the Google button
   * before it is ready. We wait up to `timeoutMs` and then proceed — this avoids
   * the misleading "still initializing, try again" dead-end.
   *
   * Note: on a Clerk instance, `loaded` is a BOOLEAN getter (status ===
   * "ready"), NOT a method — read it as a flag, never call it as a function.
   */
  const waitForClerkReady = async (timeoutMs = 8000): Promise<boolean> => {
    if (!isClerkConfigured) return false;
    const inst = clerkInstance as any;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const clerkGlobal = (window as any).Clerk;
      // Live sources only: the stable instance (useClerk) and the global
      // window.Clerk. The hook objects are omitted on purpose — they are
      // recreated each render and would go stale inside this async closure.
      const isReady =
        inst?.loaded === true ||
        (typeof inst?.isLoaded === 'function' && inst.isLoaded()) ||
        Boolean(inst?.signUp) ||
        Boolean(inst?.signIn) ||
        clerkGlobal?.loaded === true ||
        (typeof clerkGlobal?.isLoaded === 'function' && clerkGlobal.isLoaded()) ||
        Boolean(clerkGlobal?.signUp) ||
        Boolean(clerkGlobal?.signIn);
      if (isReady) return true;
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  };

  const signUpWithGoogle = async ({
    role,
    redirectUrlComplete,
  }: {
    role: string;
    redirectUrlComplete: string;
  }): Promise<boolean> => {
    if (!isClerkConfigured) return false;

    const ready = await waitForClerkReady();
    if (!ready) return false;

    // Prefer the live instance resource, then the global, then the hook.
    const signUpResource =
      (clerkInstance as any)?.signUp || (window as any).Clerk?.signUp || clerkSignUp?.signUp;
    if (!signUpResource?.authenticateWithRedirect) return false;
    try {
      await signUpResource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete,
        unsafeMetadata: { role },
      });
      return true;
    } catch {
      return false;
    }
  };

  const signInWithGoogle = async ({
    redirectUrlComplete,
  }: {
    redirectUrlComplete: string;
  }): Promise<boolean> => {
    if (!isClerkConfigured) return false;

    const ready = await waitForClerkReady();
    if (!ready) return false;

    const signInResource =
      (clerkInstance as any)?.signIn || (window as any).Clerk?.signIn || clerkSignIn?.signIn;
    if (!signInResource?.authenticateWithRedirect) return false;
    try {
      await signInResource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete,
      });
      return true;
    } catch {
      return false;
    }
  };

  return { signUpWithGoogle, signInWithGoogle };
}

// Remembers the most recently created local account so the OTP-verification step
// completes against the same user id (keeps profile & session consistent).
let lastCreatedLocalUser: LocalUser | null = null;

export function useSignUp() {
  const localUser = useLocalAuthState();

  let clerkSignUp: ReturnType<typeof useClerkSignUp> | null = null;
  let fallbackActive = true;

  if (isClerkConfigured) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const csu = useClerkSignUp();
      clerkSignUp = csu;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const fallbackFromTimeout = useClerkFallbackActive(csu.isLoaded);
      fallbackActive = isLocalAuthMode() || fallbackFromTimeout;
    } catch {
      // Clerk provider unavailable – fall through to local mode
    }
  }

  if (isClerkConfigured && !fallbackActive && clerkSignUp) {
    return clerkSignUp;
  }

  return {
    isLoaded: true,
    signUp: {
      status: 'complete',
      createdUserId: localUser?.id || null,
      createdSessionId: localUser ? `sess_${localUser.id}` : null,
      create: async ({
        emailAddress,
        password,
        firstName,
        lastName,
      }: {
        emailAddress?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
      }) => {
        const email = (emailAddress || '').trim();
        const pwd = password || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';

        const val = validateEmail(email);
        if (!val.isValid) {
          throw { errors: [{ message: val.error }] };
        }

        const pwdVal = validatePassword(pwd);
        if (!pwdVal.isValid) {
          throw { errors: [{ message: pwdVal.error }] };
        }

        const users = getLocalUsers();
        const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (existing) {
          throw {
            errors: [
              {
                message:
                  'An account with this email address is already registered. Please sign in instead.',
              },
            ],
          };
        }

        const newUser: LocalUser = {
          id: `usr_local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          email,
          name: fullName,
          password: pwd,
          role: 'user',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D9488&color=fff`,
          createdAt: new Date().toISOString(),
        };

        lastCreatedLocalUser = newUser;
        saveLocalUser(newUser);
        setLocalSession(newUser);

        // Sync with Supabase profile table if available
        void createOrUpsertProfile(newUser.id, {
          name: newUser.name,
          email: newUser.email,
          role: 'user',
        });

        return {
          status: 'missing_requirements',
          createdSessionId: `sess_${newUser.id}`,
          createdUserId: newUser.id,
        };
      },
      prepareEmailAddressVerification: async ({ strategy }: { strategy?: string } = {}) => {
        return { status: 'unverified' };
      },
      attemptEmailAddressVerification: async ({ code }: { code: string }) => {
        if (!code || code.trim().length < 4) {
          throw { errors: [{ message: 'Please enter a valid verification code.' }] };
        }
        // Complete against the account created in `create()` so the profile is
        // saved under the correct user id and the session stays consistent.
        if (lastCreatedLocalUser) {
          return {
            status: 'complete',
            createdSessionId: `sess_${lastCreatedLocalUser.id}`,
            createdUserId: lastCreatedLocalUser.id,
          };
        }
        return {
          status: 'complete',
          createdSessionId: `sess_${Date.now()}`,
          createdUserId: `usr_${Date.now()}`,
        };
      },
      authenticateWithRedirect: async () => {
        // Google OAuth requires Clerk – not available in local fallback mode.
      },
    },
    setActive: async ({ session }: { session?: string | null }) => {
      if (session && !localUser) {
        // active session
      }
    },
  };
}

export const UserButton = LocalUserButton;
