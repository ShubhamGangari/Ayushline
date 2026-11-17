# AYUSHLINE — Architecture Overview

This document explains how the Ayushline application is structured, how data flows, and how the hybrid Clause/Supabase/local fallback layers work together.

---

## 1. High-Level Flow

```
┌──────────────────────────────┐
│        Browser / SPA         │
│  React 19 + TypeScript + Vite│
└──────────────┬───────────────┘
               │
        ┌──────▼───────┐
        │   React Router│   lazy-loaded page chunks
        └──────┬───────┘
               │
     ┌─────────┼──────────────┐
     │         │              │
┌────▼────┐ ┌──▼─────┐  ┌────▼─────┐
│  Clerk   │ │Supabase │  │ Local    │
│ Auth     │ │PostgreSQL│  │ storage  │
│(optional)│ │ (opt.)   │  │ fallback │
└────┬────┘ └──┬─────┘  └────┬─────┘
     │         │              │
     └─────────┴──────────────┘
          unified hooks / API layer
```

The app is fully client-side. There is **no application server**. All persistence is either Supabase (PostgreSQL) or browser `localStorage`.

---

## 2. Authentication (`src/hooks/useAuth.ts`)

### Modes

1. **Clerk mode** — activated when `VITE_CLERK_PUBLISHABLE_KEY` is present, non-placeholder, and starts with `pk_test_`/`pk_live_`. Clerk manages identity (email/password + Google OAuth via `/sso-callback`).
2. **Local fallback mode** — activated when Clerk is not configured, or when Clerk fails to load within a timeout (`CLERK_LOAD_TIMEOUT_MS`). Users register/log in with email + password; passwords are hashed with SHA-256 (WebCrypto `SubtleCrypto`) plus a static salt. Users and sessions live in `localStorage`:
   - `ayush_registered_users_v2` — all registered users
   - `ayush_active_session_v2` — the active session

### Unified hooks

- `useAuth()` — returns a consistent shape (`isLoaded`, `isSignedIn`, `userId`, `user`, `getToken`, `signOut`) regardless of mode; `useAuth` can be via `useAuth` (Clerk) or `useLocalAuthHook`.
- `useSignIn()` / `useSignUp()` — unified sign-in/sign-up that delegates to Clerk or the local flow.
- `useGoogleOAuth()` — Google OAuth via Clerk, or a clear error in local mode.
- **User sync:** whenever a Clerk user is present, the app upserts the user's profile (via `createOrUpsertProfile`) and keeps the local registry in sync, so the dashboard and admin views work across both modes.

---

## 3. Admin & Role Access (`src/hooks/useAdmin.ts`)

Admin status is resolved at runtime from, in order:

1. `VITE_ADMIN_USER_ID` (single Clerk user ID)
2. `VITE_ADMIN_USER_IDS` (comma-separated Clerk user IDs)
3. `VITE_ADMIN_EMAIL` (single email)
4. `VITE_ADMIN_EMAILS` (comma-separated emails)
5. Clerk user `publicMetadata.role === 'admin'` (or Unsafe metadata)
6. Local profile `role === 'admin'`

The `useAdmin()` hook returns `{ isAdmin, isLoaded, userId, userEmail }`. The `/admin` route tree is gated so only admins can manage doctors, posts, events, and users.

Roles: `user`, `doctor`, `student`, `org` (institution), `admin`. Each non-admin role drives a dedicated dashboard component under `src/components/dashboard/`.

---

## 4. Data Layer (`src/lib`)

### Supabase client — `src/lib/supabase.ts`

- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Cleans the URL (strips trailing slashes and `/rest/v1`).
- `isSupabaseConfigured` is true only when both values are present **and** not the helper placeholders.
- Exports a typed `Database` interface describing all tables: `profiles`, `doctors`, `posts`, `events`, `discussions`, `appointments` (plus `doctor_reviews`, `discussion_replies`, `notifications` in the schema).

### API modules — `src/lib/api/*`

Each module follows the same pattern:

1. Check `isSupabaseConfigured`.
2. If yes → call Supabase (e.g. `supabase.from('doctors').select(...)`).
3. If no, or on error → fall back to `localStorage` (`ayush_profile_*`, `ayush_registered_users_v2`, etc.).

Modules: `profiles.ts`, `doctors.ts`, `posts.ts`, `events.ts`, `appointments.ts`, `discussions.ts`, `discussionReplies.ts`, `notifications.ts`, `whatsNew.ts`.

---

## 5. UI & Routing

- `src/App.tsx` defines the full route table, **lazy-loading every page** to keep the initial bundle small.
- Routing groups:
  - Public marketing pages (`/`, `/ayurveda`, `/yoga`, `/unani`, `/siddha`, `/homeopathy`, `/about`, `/consult`, `/whats-new`, `/events`, `/join/*`, `/guidelines`, `/submit-content`, privacy/disclaimer/sitemap).
  - Protected user routes wrapped in `<RequireAuth>` (`/dashboard`, `/profile`, `/my-consultations`, `/my-events`).
  - Admin portal (`/admin` + subroutes: `doctors`, `posts`, `events`, `users`).
  - Misc (`/sso-callback`, `/article/:id`, `/doctor/:id`, `*` → NotFound).
- `src/components/layout/Layout.tsx`, `Navbar.tsx`, `Footer.tsx` provide the chrome. `NotificationBell.tsx` shows per-user notifications.
- Reusable UI lives in `src/components/ui/` (Button, Card, Logo, SystemIcons) and `src/components/common/ErrorBoundary.tsx` catches render errors.

---

## 6. Build & Performance (`vite.config.ts`)

- **Alias:** `@` → project root.
- **Manual chunking** of third-party libraries into named vendor chunks (`react-vendor`, `router`, `clerk`, `motion`, `icons`, `supabase`) so large vendors load only when needed and are cached independently.
- **Production hardening:** sourcemaps off, `esbuild` minification, `console`/`debugger` stripped via `build:prod` (NODE_ENV=production).
- **Dev server:** defaults to port `3000`, host `0.0.0.0`, HMR configurable via `DISABLE_HMR`.

---

## 7. Persistence Contract (local fallback keys)

| Key | Purpose |
|-----|---------|
| `ayush_registered_users_v2` | All locally registered users (id, email, name, role, hashed password, timestamps). |
| `ayush_active_session_v2` | Active local session user object. |
| `ayush_profile_<userId>` | Individual profile objects (one per user). |
| `ayush_auth_change` | Custom window event dispatched to notify auth state changes to listeners. |

> The local fallback is a developer/demo convenience and a resilience net. For any serious multi-user deployment, configure Clerk + Supabase so data is durable and shared across devices.

---

## 8. Database Schema (`supabase/schema.sql`)

Tables (all with Row-Level Security enabled):

- `profiles` — user identity/profile, role (user/doctor/student/org/admin).
- `doctors` — practitioner directory (specialization, system, qualification, city, cert URL, approval status, rating).
- `doctor_reviews` — ratings/comments per doctor.
- `appointments` — consultation bookings (patient/doctor, preferred date/time, status).
- `posts` — blog/case-study articles (type, system, thumbnail, publication status, views).
- `events` — seminars/webinars (type, date, location, registration link, status).
- `discussions` + `discussion_replies` — community threads.
- `notifications` — per-user notification items.

RLS policies are intentionally permissive (`USING (true)`) for this codebase; for a hardened production deployment, restrict policies to authenticated users and server-generated tokens.
