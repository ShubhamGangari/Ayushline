# AYUSHLINE — Complete Setup Guide (Beginner Friendly)

This is the step-by-step guide to take the project from "works on your PC" to a live website with real login (Clerk), a real database (Supabase), and deployment (Vercel).

> **You need 2 free accounts:** [Clerk](https://clerk.com) for login, [Supabase](https://supabase.com) for the database. Plus a [GitHub](https://github.com) account to host the code for deployment.

---

## TABLE OF CONTENTS

1. [Overview: How the pieces fit together](#1-overview)
2. [Step 1 — Create your GitHub repository](#2-step-1--create-your-github-repository)
3. [Step 2 — Get Clerk credentials (login)](#3-step-2--get-clerk-credentials-login)
4. [Step 3 — Set up Supabase (database)](#4-step-3--set-up-supabase-database)
5. [Step 4 — Put credentials in your local .env file](#5-step-4--put-credentials-in-your-local-env-file)
6. [Step 5 — Run the app locally to test](#6-step-5--run-the-app-locally-to-test)
7. [Step 6 — Deploy to Vercel](#7-step-6--deploy-to-vercel)
8. [Step 7 — Make yourself the Admin](#8-step-7--make-yourself-the-admin)
9. [Step 8 — Final checklist & verification](#9-step-8--final-checklist--verification)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. OVERVIEW

| Piece | What it does | Where you get credentials |
|-------|--------------|---------------------------|
| **Clerk** | Handles sign up / sign in / Google login | Clerk Dashboard → API Keys |
| **Supabase** | Stores all data (doctors, posts, events, appointments) | Supabase Dashboard → Project Settings → API |
| **Vercel** | Hosts your website on the internet | Vercel (import from GitHub) |

The app reads these credentials from **environment variables**. In this project those are all the `VITE_*` values listed in `.env.example`.

**Important rule:** Because this is a static website, the credentials are "baked in" at build time. So you must set them **before** building/deploying. Any time you change a credential, you must redeploy.

---

## 2. STEP 1 — Create your GitHub repository

1. Go to https://github.com and sign in (create a free account if needed).
2. Click **+** (top right) → **New repository**.
3. Name it `ayushline` (or anything). Keep it **Private** or **Public** — your choice.
4. **Do not** check "Add a README" (your project already has one).
5. Click **Create repository**.
6. Now push this project up to it. Open a terminal in the project folder and run:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ayushline.git
   git push -u origin main
   ```

   > Replace `YOUR_USERNAME` with your GitHub username.

You'll need this GitHub repo in Step 6 (deployment).

---

## 3. STEP 2 — Get Clerk credentials (login)

Clerk is the authentication service. It gives you one key the app needs.

### 3.1 Create a Clerk account & app
1. Go to https://clerk.com → click **Sign up** → create a free account.
2. After sign-in, you'll be in the Clerk Dashboard. Click **+ New application** (or **Create application**).
3. Give it a name, e.g. `ayushline`.
4. Choose your sign-in methods. **Recommended:**
   - Turn on **Email** (password-based).
   - Turn on **Google** (social login) — this is the "Sign in with Google" button in the app,5. Click **Create application**.

### 3.2 Copy the Publishable Key
1. In the left sidebar go to **API Keys** (it's the first item after your app loads).
2. You'll see two keys:
   - **Publishable Key** — looks like `pk_test_xxxxxxxxxxxxxxxx`. **This is the one you need.**
   - Secret Key — `sk_test_...` — **do NOT use this** in the app (it's secret).
3. Copy the **Publishable Key**. You'll paste it into `.env` and Vercel as `VITE_CLERK_PUBLISHABLE_KEY`.

### 3.3 Set the redirect URLs (needed for Google login)
1. In Clerk, go to **Sessions** (left sidebar).
2. Scroll to **Redirect URLs** → click **+ Add URL**.
3. Add both:
   - `http://localhost:3000/sso-callback` (for testing on your PC)
   - `https://YOUR_DOMAIN/sso-callback` (for after deployment — add the domain later)
4. Also add:
   - `http://localhost:3000`
   - `https://YOUR_DOMAIN`

> The app sends users to `<origin>/sso-callback` after Google login, so these must be allowed.

### 3.4 (Optional) Google OAuth setup
If you enabled **Google** login, Clerk can use its own quick Google setup:
1. In your Clerk app, go to **User & Authentication → Social Connections**.
2. Click **Google** → follow the steps. For a quick start, use Clerk's **"Use Clerk's managed credentials"** option (they'll provide the Google client ID/secret automatically). For a real production app you'd create your own Google OAuth app, but for a working site the Clerk-managed option is fine.

> You now have the Clerk Publishable Key — save it somewhere. We'll use it in Step 4.

---

## 4. STEP 3 — Set up Supabase (database)

Supabase is your database + backend. The app talks to it to save and load all data.

### 4.1 Create a Supabase project
1. Go to https://supabase.com → **Sign up** / **Sign in**.
2. Click **New project**.
3. Choose an **Organization** (create one if needed).
4. **Project name:** `ayushline`.
5. Set a strong **Database password** and **save it** (needed later if you connect from tools).
6. Choose a **Region** close to your users (e.g. `Singapore` for India / `Mumbai` if available).
7. Click **Create new project**. Wait ~1–2 minutes for it to provision.

### 4.2 Create the database tables (run the schema)
The project ships with a ready-made schema file: `supabase/schema.sql`. It creates all the tables, security rules, and sample data.

1. In Supabase Dashboard, in your project, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Copy the **entire contents** of the file `supabase/schema.sql` from this project.
4. Paste it into the SQL editor.
5. Click **Run** (top right).
6. You should see "Success. No rows returned" — the tables are created.

> **Photos/images:** The same `schema.sql` also creates a public Storage bucket called `images` automatically. The app uploads photos (avatars, doctor photos, event banners, article thumbnails) there and stores only the small file URL in the database — the image bytes never go into the tables. So you do **not** need to create any bucket manually.
>
> If you ever add images in Supabase's own dashboard, keep them in the `images` bucket so the app can display them.

> You can verify: left sidebar → **Table Editor** → you should see tables: `profiles`, `doctors`, `doctor_reviews`, `appointments`, `posts`, `events`, `discussions`, `discussion_replies`, `notifications`.

### 4.3 Copy the Project URL & Anon Key
1. In Supabase Dashboard, go to **Project Settings** (gear icon, bottom-left) → **API**.
2. Under **Project URL**, copy the URL — it looks like `https://abcdefghijklmnopqrst.supabase.co`.
3. Under **Project API keys**, find the **anon** `public` key — it looks like `eyJhbGciOiJIUzI1NiIsInR5cCI6...`. Copy it.
   - ⚠️ Use the **anon** (public) key, **NOT** the `service_role` key. The `service_role` key bypasses security and must never go into the website.

> You now have: Supabase URL + anon key. Save them for Step 4.

---

## 5. STEP 4 — Put credentials in your local .env file

The project reads credentials from a file called `.env`. `/.env.example` shows all the variables.

### 5.1 Create `.env`
1. In the project folder, copy `.env.example` to `.env`:
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`

### 5.2 Fill in your real values
Open `.env` in an editor and replace the placeholders:

```dotenv
# 1. CLERK — paste your publishable key (from Step 2)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_COPIED_KEY_HERE

# 2. SUPABASE — paste your project URL + anon key (from Step 3)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# 3. ADMIN — THIS IS YOU. Add your own email(s) so you can access /admin
VITE_ADMIN_USER_ID=
VITE_ADMIN_USER_IDS=
VITE_ADMIN_EMAIL=
VITE_ADMIN_EMAILS=your@email.com
```

> **Important about the admin lines:** To make yourself the admin, put **your own email** in `VITE_ADMIN_EMAILS` (lowercase). Or, better, put your Clerk user ID in `VITE_ADMIN_USER_IDS` (see Step 7). If you leave them blank, you won't get access to the `/admin` panel.

### 5.3 Never commit `.env`
`.env` is already in `.gitignore`, so it won't be uploaded to GitHub. Only `.env.example` (the template) is committed. Good.

---

## 6. STEP 5 — Run the app locally to test

1. Install dependencies (once):
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open **http://localhost:3000** in your browser (if port `3000` is already in use by another app, Vite will pick a different port — use whichever URL the terminal prints, e.g. `http://localhost:3100`).

4. Test:
   - Click **Sign in / Sign up** → you should see the Clerk modal (or Google button).
   - Click **Sign in with Google** → it should redirect to Google and come back to `http://localhost:3000/sso-callback`.
   - Sign up → then go to a doctor's page and book an appointment; check that it saves (Supabase).
   - Visit `http://localhost:3000/admin` with your admin email → you should see the Admin panel.

> **If Google login doesn't finish:** double-check the redirect URLs in Clerk (Step 3.3) include `http://localhost:3000/sso-callback`.

---

## 7. STEP 6 — Deploy to Vercel

Vercel will build the site with your credentials and host it.

### 7.1 Import your repository
1. Go to https://vercel.com → **Sign up** with GitHub (recommended).
2. Click **Add New → Project**.
3. It will list your GitHub repositories. Select **ayushline**.
4. Vercel auto-detects **Vite** as the framework. Keep the defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 7.2 Add your environment variables
This is the most important part. On the project setup screen (or later under **Settings → Environment Variables**), add each variable with its real value (the same ones from your `.env`):

| Key | Value |
|-----|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | your Clerk publishable key |
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_ADMIN_EMAILS` | your email (to be admin) |
| `VITE_ADMIN_USER_IDS` | your Clerk user ID (optional, see Step 7) |

> Add them for **Production** environment (and optionally Preview/Development).

### 7.3 Deploy
1. Click **Deploy**. Wait a minute or two.
2. Vercel gives you a URL, e.g. `https://ayushline.vercel.app`.

### 7.4 Add the production redirect URL to Clerk
1. Go back to Clerk → **Sessions → Redirect URLs**.
2. Add `https://ayushline.vercel.app/sso-callback` and `https://ayushline.vercel.app`.
3. Now Google login will work on the live site.

> **Custom domain (optional):** In Vercel → **Settings → Domains**, add your own domain (e.g. `www.ayushline.com`). Then update Clerk redirect URLs to your real domain.

---

## 8. STEP 7 — Make yourself the Admin

There are two good ways. Use **one** of them:

### Option A — By email (simplest)
1. Put your email (lowercase) in `VITE_ADMIN_EMAILS` in both your local `.env` and Vercel's environment variables.
2. Sign up / sign in with that email.
3. Visit `https://your-site/admin`.

### Option B — By Clerk user ID (recommended, more secure)
1. Sign in to your site with Clerk.
2. In Clerk Dashboard → **Users** → find yourself → copy your **User ID** (starts with `user_2...`).
3. Put it in `VITE_ADMIN_USER_IDS` (comma-separated for multiple admins).
4. Redeploy on Vercel so the change takes effect.

> You can also set a user's **public metadata** to `role: "admin"` in Clerk — the app also checks that.

---

## 9. STEP 8 — Final checklist & verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` succeeds.
- [ ] Local `npm run dev` runs, Clerk login works, Google login returns to `/sso-callback`.
- [ ] Supabase tables exist (ran `schema.sql`).
- [ ] Booking an appointment / submitting a post saves to Supabase (check Supabase **Table Editor** for new rows).
- [ ] `/admin` opens for your admin email.
- [ ] Deployed on Vercel with env vars set.
- [ ] Clerk redirect URLs include the live `https://your-site/sso-callback`.
- [ ] Live site loads and login works on the deployed URL.

---

## 10. TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| App opens but login is the old email/password form, no Clerk | `VITE_CLERK_PUBLISHABLE_KEY` missing/invalid/placeholder. Set the real key and rebuild/deploy. |
| Google login spins or fails | Add `<origin>/sso-callback` to Clerk **Redirect URLs**; ensure HTTPS; wait a few seconds. |
| Data won't save (only shows in browser, resets) | Supabase vars are missing/placeholder. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and redeploy. Also make sure you ran `schema.sql`. |
| `Supabase URL is missing` / connection errors | Double-check the URL (no trailing `/`) and that the anon key is the `anon` key, not `service_role`. |
| Admin dashboard says "Demo mode" or no access | Check `VITE_ADMIN_EMAILS` / `VITE_ADMIN_USER_IDS` match your signed-in identity; redeploy. |
| Changes to env vars don't show | Env vars are compile-time → **redeploy** on Vercel after changing them. |
| Deep link (e.g. `/doctor/123`) gives 404 | This means SPA fallback isn't set. Vercel uses `vercel.json` automatically; make sure the project uses the committed config. |
| "Cannot read properties of undefined (reading 'emailAddress')" | Clerk still loading — refresh, or check the publishable key is valid. |
