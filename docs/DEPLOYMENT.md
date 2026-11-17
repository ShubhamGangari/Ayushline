# AYUSHLINE — Deployment Guide

This guide covers deploying the Ayushline single-page application to common hosting platforms, managing environment variables safely, and troubleshooting common deployment issues.

> **Core rule for all platforms:** Because the app is a static SPA, all configuration is **baked in at build time**. Environment variables must be present when `npm run build` runs — they cannot be injected at runtime (unless you add a server-side layer).

---

## 1. Prerequisites

- A production build that passes locally:
  ```bash
  npm ci
  npm run lint
  npm run build   # outputs to dist/
  ```
- The real values for the variables listed in `.env.example` (Clerk publishable key, Supabase URL + anon key, admin IDs/emails).

---

## 2. General SPA Deployment Checklist

Regardless of host, the following must be true:

1. **Publish directory** → the build output (`dist/`).
2. **SPA fallback** → all unknown routes must serve `index.html` (so React Router handles 404s and deep links like `/doctor/:id` or `/admin`).
3. **Environment variables** → set in the host's build environment *before* `npm run build`.
4. **HTTPS** → enable on the host (required for Clerk OAuth redirects).
5. **Clerk redirect URLs** → add the production origin (e.g. `https://your-domain.com/sso-callback`) to Clerk's allowed redirect URLs.

---

## 3. Deploying to Vercel (recommended)

Vercel auto-detects Vite projects. A `vercel.json` is already committed with SPA rewrites.

### Steps

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Vercel, click **New Project** → import the repo.
3. **Framework Preset:** Vite (auto-detected). Build command `npm run build`, output directory `dist`.
4. Under **Settings → Environment Variables**, add every variable from `.env.example` with production values.
5. Click **Deploy**.

### CLI alternative

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

### Vercel notes
- The committed `vercel.json` rewrites every path to `/index.html`, so deep links work out of the box.
- Redeploy after any environment variable change (variables are baked in at build time).

---

## 4. Deploying to Netlify

A `public/_redirects` file is already committed:

```text
/* /index.html 200
```

### Steps

1. Connect the repo in Netlify (New site from Git).
2. **Build command:** `npm run build` — **Publish directory:** `dist`.
3. **Site settings → Environment variables:** add all variables from `.env.example`.
4. Deploy.

> Netlify also supports drag-and-drop of the `dist/` folder for a quick manual deploy (in that case set env vars via the UI and rebuild locally first).

---

## 5. Deploying to AWS (S3 + CloudFront)

### 5.1 Build

```bash
npm ci
npm run build
```

Upload the contents of `dist/` to your S3 bucket (enable **Static website hosting**, document `index.html`, error `index.html`).

### 5.2 CloudFront SPA routing

Add a **Custom Error Response**:

- Error Code: `403` and `404`
- Response Page Path: `/index.html`
- HTTP Response Code: `200`

### 5.3 Notes
- Set environment variables before building (either in CI or via the host's environment).
- For Clerk OAuth, ensure the CloudFront/S3 domain is HTTPS and that `/sso-callback` is allowed in Clerk.

---

## 6. Environment Variable Management

| Variable | Where used | Safe to commit? |
|----------|------------|:----------------:|
| `VITE_CLERK_PUBLISHABLE_KEY` | Browser (public) | No (rotate per env) |
| `VITE_SUPABASE_URL` | Browser (public) | No |
| `VITE_SUPABASE_ANON_KEY` | Browser (public) | No |
| `VITE_ADMIN_USER_ID` | Browser (identifies admins) | No — keep private |
| `VITE_ADMIN_USER_IDS` | Browser | No — keep private |
| `VITE_ADMIN_EMAIL` | Browser | No — keep private |
| `VITE_ADMIN_EMAILS` | Browser | No — keep private |
| `DISABLE_HMR` | Dev only | No |

> ⚠️ **Security:** `VITE_*` variables ship to the browser. Treat admin IDs/emails carefully — exposing them reveals who the admins are. For stricter protection, prefer role-based checks (Clerk `publicMetadata.role = "admin"`) over exposing IDs, or gate sensitive admin actions behind a server-side layer.

### Env separation

Create distinct variable sets per environment (dev / staging / production) in your host, and never reuse the production Clerk live key in local dev.

---

## 7. Production Checklist

- [ ] `npm run lint` passes (TypeScript clean).
- [ ] `npm run build` succeeds and `dist/` is generated.
- [ ] SPA fallback configured (Vercel/Netlify/AWS/nginx).
- [ ] Clerk **Publishable Key** uses `pk_live_` in production.
- [ ] Clerk allowed redirect URLs include the production `/sso-callback`.
- [ ] Supabase schema (`supabase/schema.sql`) applied to the production project.
- [ ] Admin users configured via env vars or Clerk metadata.
- [ ] HTTPS enabled everywhere.
- [ ] Sourcemaps disabled (already the default) — no `console` output in prod bundles (already stripped).

---

## 8. Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| Deep links return 404 | SPA fallback not configured — ensure all routes rewrite to `index.html`. |
| Clerk sign-in modal never loads | `VITE_CLERK_PUBLISHABLE_KEY` missing/invalid — ensure it starts with `pk_test_`/`pk_live_`; verify it's set at build time. |
| Google OAuth fails | Add the exact origin + `/sso-callback` to Clerk's allowed redirect URLs; ensure HTTPS. |
| Data appears only in browser / resets | Supabase env vars missing/placeholder — set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and re-build; verify schema ran. |
| "Demo Mode Active" on admin dashboard | Supabase not configured — same as above. |
| Admin cannot access `/admin` | Check `VITE_ADMIN_*` values or Clerk user `role` metadata. |
| Auth not persisted across sessions (local mode) | Local mode stores in `localStorage` — clearing browser data logs users out. Configure Clerk for persistent auth. |
| Auth errors after updating a key | Rebuild — env variables are compile-time. |
