# 🌿 AYUSHLINE — Comprehensive AYUSH Health & Wellness Platform

Ayushline is a production-ready web portal for the AYUSH systems of healthcare — **Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy**. It connects patients, certified AYUSH practitioners, students, and organizations through online consultations, a verified doctor directory, academic resources, research publications, community discussions, and event management.

> **Note:** The AYUSH platform is a single-page application (SPA) built with React, TypeScript, and Vite. It uses **Clerk** for authentication and **Supabase** as the PostgreSQL backend, with a resilient browser-local fallback when cloud services are not configured.

> 🟢 **New here? Start with [docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** — a complete beginner walkthrough for getting Clerk & Supabase credentials, where to put them, running locally, deploying to Vercel, and becoming the admin.

---

## 📚 Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Authentication & Roles](#authentication--roles)
- [Running Tests & Quality Checks](#running-tests--quality-checks)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Key Features

- **AYUSH Directory & Consultations** — Find verified practitioners across all five AYUSH systems with role-based appointment booking, confirmation, and schedule management.
- **Multi-Role Dashboards** — Customized interfaces for Patients, Doctors, Students, Organizations, and System Administrators (`/admin`).
- **Research & Publications** — Moderated blog and case-study archive with per-system filtering and categorization.
- **Events & Seminars** — Search, browse, and RSVP to national seminars, workshops, and webinars.
- **Community Discussions** — Topic-based discussion boards with threaded replies.
- **Durable Persistence & Hybrid Fallback** — Dual architecture supporting Supabase (PostgreSQL) plus a resilient browser-localStorage fallback so the app works even before cloud credentials are configured.
- **Performance-First SPA** — Route-level code splitting, manual vendor chunking, and zero sourcemaps in production.

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, TypeScript ~5.8 |
| Build Tool  | Vite 6 |
| Styling   | Tailwind CSS 4 (`@tailwindcss/vite`), Tailwind Merge |
| UI/Icons  | Lucide React, Framer Motion |
| Routing   | React Router DOM 7 |
| Auth      | Clerk (`@clerk/clerk-react`) + local browser fallback |
| Database   | Supabase (`@supabase/supabase-js`) |
| Testing   | Playwright 1.62 (E2E, configurable) |

---

## 🏗️ Architecture Overview

The application is a **client-side SPA** that is fully static and deployable to any CDN (Vercel, Netlify, AWS S3 + CloudFront, etc.). There is no application server — business logic runs in the browser against Supabase (PostgreSQL) with Row-Level Security (RLS), and Clerk handles identities.

Key architectural points:

1. **Two-mode persistence.** Every data access layer (`src/lib/api/*`) first checks whether Supabase is configured. If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are present and not placeholder values, the app talks to Supabase. Otherwise it transparently falls back to `localStorage`.
2. **Authentication fallback.** When `VITE_CLERK_PUBLISHABLE_KEY` is missing/invalid, the app uses a local email/password registration + login flow (SHA-256 hashed, `localStorage`). When Clerk is configured, Clerk becomes the source of truth and local users are kept in sync (`createOrUpsertProfile`).
3. **Admin detection is environment-driven.** Admin access is derived from `VITE_ADMIN_USER_ID`, `VITE_ADMIN_USER_IDS`, `VITE_ADMIN_EMAIL`, `VITE_ADMIN_EMAILS`, or a user's Clerk `role` metadata — never hardcoded.
 4. **Code splitting.** Each route is lazy-loaded; third-party libraries are split into manual vendor chunks (`react-vendor`, `router`, `clerk`, `motion`, `icons`, `supabase`) to keep the initial bundle small.
5. **Security defaults.** Production builds drop `console`/`debugger` and disable sourcemaps. The app includes an `ErrorBoundary` and suppresses harmless third-party network rejection noise.

For a deep dive, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 📂 Directory Structure

```
ayushline/
├── public/                     # Static assets (favicon, logo, social og-image)
│   ├── _redirects             # Netlify SPA redirects
│   ├── favicon.svg            # Favicon
│   ├── ayushline-logo.png     # Brand logo
│   └── og-image.png           # Open Graph / Twitter share card
├── src/
│   ├── main.tsx               # React entry point + ClerkProvider bootstrap
│   ├── App.tsx                # Router & route definitions
│   ├── index.css              # Global styles / Tailwind entry
│   ├── components/
│   │   ├── auth/              # Clerk wrappers, auth modal, RequireAuth guard
│   │   ├── common/            # ErrorBoundary
│   │   ├── dashboard/         # Role-specific dashboards (user/student/practitioner/org)
│   │   ├── layout/            # Layout, Navbar, Footer, NotificationBell
│   │   └── ui/                # Reusable UI primitives (Button, Card, Logo, icons)
│   ├── hooks/
│   │   ├── useAuth.ts         # Unified auth hook (Clerk + local fallback)
│   │   └── useAdmin.ts        # Environment-driven admin access logic
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client + Database type definitions
│   │   ├── authValidation.ts  # Email/password validation
│   │   ├── sanitize.ts        # Input sanitization utilities
│   │   ├── uploadImage.ts     # Client image compression & Supabase Storage upload
│   │   ├── imageUtils.ts      # Image processing utilities
│   │   └── api/               # Data access per entity (profiles, doctors,
│   │                          #   posts, events, appointments, discussions,
│   │                          #   notifications, whatsNew)
│   └── pages/
│       ├── Home, About, Category, Consult, Dashboard, Profile, ...
│       └── admin/             # Admin portal (AdminLayout, AdminDashboard,
│                              #   AdminDoctors, AdminPosts, AdminEvents, AdminUsers)
├── supabase/
│   └── schema.sql             # Complete Supabase schema (tables, indexes, RLS, seed data)
├── index.html                 # SPA HTML shell + SEO/OG metadata
├── package.json
├── vite.config.ts             # Vite config (aliases, chunks, build tuning)
├── vercel.json                # Vercel SPA rewrites
├── tsconfig.json
├── .gitignore
└── .env.example               # Environment variable template
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

> ⚠️ **Important:** Variables prefixed `VITE_` are public and embedded into the client bundle. Never place secrets there.

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Optional* | Clerk publishable key (`pk_test_…` / `pk_live_…`). If unset, the app uses local auth. |
| `VITE_SUPABASE_URL` | Optional* | Supabase project URL. If unset/placeholder, data falls back to localStorage. |
| `VITE_SUPABASE_ANON_KEY` | Optional* | Supabase anon/public key. |
| `VITE_ADMIN_USER_ID` | Optional | Single admin Clerk user ID. |
| `VITE_ADMIN_USER_IDS` | Optional | Comma-separated admin Clerk user IDs. |
| `VITE_ADMIN_EMAIL` | Optional | Single admin email (lowercase). |
| `VITE_ADMIN_EMAILS` | Optional | Comma-separated admin emails. |
| `DISABLE_HMR` | Optional | Dev-only: set to `true` to disable Vite HMR/file watching. |

\* At least one of Clerk or Supabase should be configured for a full experience, but the app runs in local mode with none of them.

**Admin notes:** Admin grants are resolved at runtime from `VITE_ADMIN_USER_ID` → `VITE_ADMIN_USER_IDS` → `VITE_ADMIN_EMAIL` → `VITE_ADMIN_EMAILS`, plus Clerk `role` metadata (value `admin`). See `src/hooks/useAdmin.ts`.

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** 20.19+ or 22+ (LTS recommended; see `.nvmrc`)
- **npm** 9+ (bundled with Node)
- Optional but recommended: a [Clerk](https://clerk.com) account and a [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/ShubhamGangari/Ayushline.git
cd Ayushline
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# then edit .env with your real credentials
```

### 4. Set up Supabase (optional)

If you have a Supabase project:

1. Copy the contents of `supabase/schema.sql`.
2. Open your Supabase Dashboard → **SQL Editor** → paste → **Run**.
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

Without this step the app still runs using the localStorage fallback.

### 5. Set up Clerk (optional)

1. Create an app in the Clerk Dashboard, add **Google** as a social connection.
2. Copy the **Publishable Key** into `VITE_CLERK_PUBLISHABLE_KEY`.
3. Add `http://localhost:3000/sso-callback` to Clerk's **Allowed redirect URLs** (dev).
4. To make a user an admin, add their Clerk User ID/email to the `VITE_ADMIN_*` variables, or set their public metadata `role` to `admin`.

### 6. Start the development server

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

---

## 🔐 Authentication & Roles

The platform supports five roles, each with its own dashboard:

| Role | Description | Dashboard |
|------|-------------|-----------|
| `user` | General wellness seeker/patient | `UserDashboard` |
| `doctor` | Certified AYUSH practitioner | `PractitionerDashboard` |
| `student` | AYUSH student | `StudentDashboard` |
| `org` | Institution / organization | `OrganizationDashboard` |
| `admin` | System administrator | `/admin` portal |

- **Authentication modes:** When Clerk is configured, users sign in with email/password or Google OAuth (`/sso-callback`). Without Clerk, a local email/password flow is used with SHA-256 hashed credentials stored in `localStorage`.
- **Route protection:** Protected routes (e.g. `/dashboard`, `/profile`, `/my-consultations`) are wrapped in `<RequireAuth>`, which redirects unauthenticated users to a sign-in prompt.
- **Admin portal:** `/admin` provides management of doctors (approval), posts, events, and users. Access is gated by the environment-driven admin rules described above.

---

## ✅ Running Tests & Quality Checks

This project uses **TypeScript** for type-checking. Playwright is included as a dependency for end-to-end testing; add a `test:e2e` script (e.g. `playwright test`) when you introduce E2E specs.

```bash
# Type-check the whole project (tsc --noEmit)
npm run lint

# Build the production bundle
npm run build

# Run the end-to-end test suite (once a script is configured)
npx playwright test
```

> **Note:** No unit-test runner is configured by default. The `lint` script is the primary static-quality gate. Add a test runner (e.g. Vitest) if you introduce unit tests.

**Development workflow:**

```bash
npm run dev        # start dev server on :3000
npm run build      # verify a production build compiles
npm run preview    # locally preview the production build
```

---

## 🚢 Production Build

```bash
npm run build          # production build (outputs to dist/)
npm run build:prod     # equivalent, explicitly sets NODE_ENV=production
npm run preview        # serve the built app locally
```

The build is tuned for production:

- Target `es2020`, minified with `esbuild`.
- Sourcemaps disabled; `console`/`debugger` stripped.
- Route-level code splitting + manual vendor chunks (see `vite.config.ts`).

---

## 🌍 Deployment

The app is a static SPA, so it deploys to any static host. The repo ships with Vercel and Netlify configuration out of the box.

### Vercel (recommended)

1. Import the repository on [Vercel](https://vercel.com).
2. Framework preset: **Vite** (auto-detected).
3. Add your environment variables (from `.env.example`) under **Settings → Environment Variables**.
4. Deploy. The included `vercel.json` rewrites all routes to `index.html` so client-side routing works.

```bash
# CLI alternative
vercel
vercel --prod
```

### Netlify

The `public/_redirects` file is already configured for SPA routing:

```text
/* /index.html 200
```

1. Connect the repo to Netlify.
2. Build command: `npm run build`, Publish directory: `dist`.
3. Add environment variables in **Site settings → Environment variables**.

### AWS (S3 + CloudFront) / Other static hosts

1. Build: `npm run build` → output in `dist/`.
2. Upload `dist/` to your static host.
3. Configure a **fallback/404 rewrite** to `index.html` (SPA routing). On CloudFront this is a custom error response → `/index.html` with 200. On S3 website hosting, set the error document to `index.html`.
4. Set the same environment variables in the build environment.

> ⚠️ **Important:** Because all config is baked in at build time, set your environment variables **before** running `npm run build` (i.e. build-time), not at runtime.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guidance including environment variable management and troubleshooting.

---

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Write clear, typed code following the existing patterns (React hooks, API layer under `src/lib/api`, reusable UI in `src/components/ui`).
3. Run `npm run lint` and `npm run build` to verify nothing is broken.
4. For changes that touch the database, update `supabase/schema.sql`.
5. Open a pull request describing the change and any new environment variables.

---

## 📄 License

MIT License. Created for the AYUSH Line Healthcare Initiative.
