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

// ─── Password Hashing (SubtleCrypto / SHA-256) ───────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ayushline_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  if (storedHash.length !== 64) {
    return inputPassword === storedHash;
  }
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'doctor' | 'student' | 'org';
  avatarUrl?: string;
  password?: string;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'ayush_registered_users_v2';
const STORAGE_SESSION_KEY = 'ayush_active_session_v2';

const PUBLISHABLE_KEY = ((import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY as string) || '').trim();
export const isClerkConfigured =
  Boolean(PUBLISHABLE_KEY) &&
  (PUBLISHABLE_KEY.startsWith('pk_live_') || PUBLISHABLE_KEY.startsWith('pk_test_')) &&
  PUBLISHABLE_KEY.length > 20 &&
  PUBLISHABLE_KEY !== 'pk_test_placeholder' &&
  !PUBLISHABLE_KEY.startsWith('pk_test_your_');

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const CLERK_LOAD_TIMEOUT_MS = isLocalhost && PUBLISHABLE_KEY.startsWith('pk_live_') ? 1000 : 3500;

let activeLocalAuthMode = false;

function useClerkFallbackActive(clerkIsLoaded: boolean): boolean {
  const [timedOut, setTimedOut] = useState<boolean>(false);

  useEffect(() => {
    if (!isClerkConfigured) {
      setTimedOut(true);
      return;
    }
    if (clerkIsLoaded) {
      setTimedOut(false);
      activeLocalAuthMode = false;
      return;
    }
    const t = setTimeout(() => {
      activeLocalAuthMode = true;
      setTimedOut(true);
    }, CLERK_LOAD_TIMEOUT_MS);

    return () => clearTimeout(t);
  }, [clerkIsLoaded]);

  return !isClerkConfigured || (timedOut && !clerkIsLoaded);
}

export function isLocalAuthMode(): boolean {
  return activeLocalAuthMode || !isClerkConfigured;
}

export function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalUser(user: LocalUser) {
  const users = getLocalUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

  const currentSession = getLocalSession();
  if (currentSession && (currentSession.id === user.id || currentSession.email.toLowerCase() === user.email.toLowerCase())) {
    const updatedSession = { ...currentSession, ...user };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedSession));
    window.dispatchEvent(new CustomEvent('ayush_auth_change'));
  }
}

export function getLocalSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLocalSession(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
  window.dispatchEvent(new CustomEvent('ayush_auth_change'));
}

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

// ─── Clerk Authentication Hook (Guaranteed zero conditional returns before hooks) ───
function useClerkAuthHook(localUser: LocalUser | null) {
  // ALL hooks MUST be invoked at the top before any conditional return statements
  const cAuth = useClerkAuth();
  const cUser = useClerkUser();
  const fallbackFromTimeout = useClerkFallbackActive(cAuth.isLoaded);

  const clerkUserObj = useMemo(() => {
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

  useEffect(() => {
    if (clerkUserObj && clerkUserObj.id) {
      saveLocalUser({
        id: clerkUserObj.id,
        email: clerkUserObj.email,
        name: clerkUserObj.name,
        role: (clerkUserObj.role as any) || 'user',
        avatarUrl: clerkUserObj.avatarUrl,
        createdAt: new Date().toISOString(),
      });
      void createOrUpsertProfile(clerkUserObj.id, {
        name: clerkUserObj.name,
        email: clerkUserObj.email,
        role: (clerkUserObj.role as any) || 'user',
        avatar_url: clerkUserObj.avatarUrl,
      });
    }
  }, [clerkUserObj?.id, clerkUserObj?.email, clerkUserObj?.name, clerkUserObj?.role, clerkUserObj?.avatarUrl]);

  // Priority 1: User is signed into Clerk (e.g. Google or Clerk on production)
  if (cAuth?.isSignedIn && clerkUserObj) {
    return {
      isLoaded: true,
      isSignedIn: true,
      userId: cAuth.userId,
      sessionId: cAuth.sessionId,
      user: clerkUserObj,
      getToken: cAuth.getToken,
      signOut: async () => {
        setLocalSession(null);
        await cAuth.signOut();
      },
    };
  }

  // Priority 2: User is signed into Local storage session (e.g. email/password on localhost or fallback)
  if (localUser) {
    return {
      isLoaded: true,
      isSignedIn: true,
      userId: localUser.id,
      sessionId: `sess_${localUser.id}`,
      user: localUser,
      getToken: async () => null,
      signOut: async () => {
        setLocalSession(null);
        if (cAuth?.signOut) {
          try { await cAuth.signOut(); } catch {}
        }
      },
    };
  }

  // Priority 3: Not signed in
  const isReady = Boolean(cAuth?.isLoaded || fallbackFromTimeout);

  return {
    isLoaded: isReady,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    user: null,
    getToken: async () => null,
    signOut: async () => {
      setLocalSession(null);
      if (cAuth?.signOut) {
        try { await cAuth.signOut(); } catch {}
      }
    },
  };
}

function useLocalAuthHook(localUser: LocalUser | null) {
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

export function useAuth() {
  const localUser = useLocalAuthState();
  if (isClerkConfigured) {
    return useClerkAuthHook(localUser);
  }
  return useLocalAuthHook(localUser);
}

// ─── Clerk SignIn Hook ────────────────────────────────────────────────────────
function useClerkSignInHook(localUser: LocalUser | null) {
  const csi = useClerkSignIn();
  const fallbackFromTimeout = useClerkFallbackActive(csi?.isLoaded ?? false);
  const localSignIn = useLocalSignInHook(localUser);

  if (csi?.isLoaded && csi?.signIn && !fallbackFromTimeout) {
    return csi;
  }
  return localSignIn;
}

function useLocalSignInHook(localUser: LocalUser | null) {
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

        if (target.password) {
          const passwordValid = await verifyPassword(pwd, target.password);
          if (!passwordValid) {
            throw {
              errors: [
                {
                  message:
                    'Incorrect password! Please check your password and try again.',
                },
              ],
            };
          }
          if (target.password.length !== 64) {
            const hashed = await hashPassword(pwd);
            const updatedTarget = { ...target, password: hashed };
            saveLocalUser(updatedTarget);
            setLocalSession(updatedTarget);
            return { status: 'complete', createdSessionId: `sess_${target.id}` };
          }
        }

        setLocalSession(target);
        return {
          status: 'complete',
          createdSessionId: `sess_${target.id}`,
        };
      },
      authenticateWithRedirect: async () => {},
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
        // active session
      }
    },
  };
}

export function useSignIn() {
  const localUser = useLocalAuthState();
  if (isClerkConfigured) {
    return useClerkSignInHook(localUser);
  }
  return useLocalSignInHook(localUser);
}

// ─── Error Message Sanitizer (Never reveal third-party vendor names) ──────────
export function cleanAuthErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected error occurred. Please try again.';
  return msg
    .replace(/clerk/gi, 'Authentication')
    .replace(/supabase/gi, 'Database')
    .replace(/vercel/gi, 'Cloud')
    .trim();
}

// ─── Google OAuth Hook ────────────────────────────────────────────────────────
function useClerkGoogleOAuthHook() {
  const clerkInstance = useClerk();
  const clerkSignUp = useClerkSignUp();
  const clerkSignIn = useClerkSignIn();

  const waitForClerkReady = async (timeoutMs = 3000): Promise<boolean> => {
    if (!isClerkConfigured) return false;
    const inst = clerkInstance as any;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const clerkGlobal = (window as any).Clerk;
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
      await new Promise((r) => setTimeout(r, 200));
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
    if (!isClerkConfigured) {
      throw new Error('Authentication service is not configured. Please use email registration.');
    }

    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost && PUBLISHABLE_KEY.startsWith('pk_live_')) {
      throw new Error(
        'Google Sign-In is configured for the live production domain (ayushline.com). For local testing, please register with your email.'
      );
    }

    const ready = await waitForClerkReady(3000);
    if (!ready) {
      throw new Error('Authentication service is taking longer than expected. Please refresh the page or use email registration.');
    }

    const signUpResource =
      (clerkInstance as any)?.signUp || (window as any).Clerk?.signUp || clerkSignUp?.signUp;
    if (!signUpResource?.authenticateWithRedirect) {
      throw new Error('Authentication sign-up service is temporarily unavailable. Please use email registration.');
    }
    try {
      await signUpResource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete,
        unsafeMetadata: { role },
      });
      return true;
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Google authentication error';
      throw new Error(cleanAuthErrorMessage(msg));
    }
  };

  const signInWithGoogle = async ({
    redirectUrlComplete,
  }: {
    redirectUrlComplete: string;
  }): Promise<boolean> => {
    if (!isClerkConfigured) {
      throw new Error('Authentication service is not configured. Please use email sign-in.');
    }

    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost && PUBLISHABLE_KEY.startsWith('pk_live_')) {
      throw new Error(
        'Google Sign-In is configured for the live production domain (ayushline.com). For local testing, please log in with your email.'
      );
    }

    const ready = await waitForClerkReady(3000);
    if (!ready) {
      throw new Error('Authentication service is taking longer than expected. Please refresh the page or use email sign-in.');
    }

    const signInResource =
      (clerkInstance as any)?.signIn || (window as any).Clerk?.signIn || clerkSignIn?.signIn;
    if (!signInResource?.authenticateWithRedirect) {
      throw new Error('Authentication sign-in service is temporarily unavailable. Please use email sign-in.');
    }
    try {
      await signInResource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete,
      });
      return true;
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Google authentication error';
      throw new Error(cleanAuthErrorMessage(msg));
    }
  };

  return { signUpWithGoogle, signInWithGoogle };
}

function useLocalGoogleOAuthHook() {
  return {
    signUpWithGoogle: async () => {
      throw new Error('Google Sign-In is temporarily unavailable. Please register with your email.');
    },
    signInWithGoogle: async () => {
      throw new Error('Google Sign-In is temporarily unavailable. Please log in with your email.');
    },
  };
}

export function useGoogleOAuth() {
  if (isClerkConfigured) {
    return useClerkGoogleOAuthHook();
  }
  return useLocalGoogleOAuthHook();
}

// ─── Clerk SignUp Hook ────────────────────────────────────────────────────────
let lastCreatedLocalUser: LocalUser | null = null;

function useClerkSignUpHook(localUser: LocalUser | null) {
  const csu = useClerkSignUp();
  const fallbackFromTimeout = useClerkFallbackActive(csu?.isLoaded ?? false);
  const localSignUp = useLocalSignUpHook(localUser);

  if (csu?.isLoaded && csu?.signUp && !fallbackFromTimeout) {
    return csu;
  }
  return localSignUp;
}

function useLocalSignUpHook(localUser: LocalUser | null) {
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
        role = 'user',
      }: {
        emailAddress?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        role?: LocalUser['role'];
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

        const hashedPwd = await hashPassword(pwd);

        const newUser: LocalUser = {
          id: `usr_local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          email,
          name: fullName,
          password: hashedPwd,
          role: (role === ('institution' as string) ? 'org' : (role || 'user')) as LocalUser['role'],
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1B3A4B&color=D4A853`,
          createdAt: new Date().toISOString(),
        };

        lastCreatedLocalUser = newUser;
        saveLocalUser(newUser);
        setLocalSession(newUser);

        void createOrUpsertProfile(newUser.id, {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        });

        return {
          status: 'missing_requirements',
          createdSessionId: `sess_${newUser.id}`,
          createdUserId: newUser.id,
        };
      },
      prepareEmailAddressVerification: async () => {
        return { status: 'unverified' };
      },
      attemptEmailAddressVerification: async ({ code }: { code: string }) => {
        if (!code || code.trim().length < 4) {
          throw { errors: [{ message: 'Please enter a valid verification code.' }] };
        }
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
      authenticateWithRedirect: async () => {},
    },
    setActive: async ({ session }: { session?: string | null }) => {
      if (session && !localUser) {
        // active session
      }
    },
  };
}

export function useSignUp() {
  const localUser = useLocalAuthState();
  if (isClerkConfigured) {
    return useClerkSignUpHook(localUser);
  }
  return useLocalSignUpHook(localUser);
}

export const UserButton = LocalUserButton;
