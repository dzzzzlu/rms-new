# Regis Marie College — Document Request System (Next.js + Supabase)

Full rebuild of the PHP/MySQL system as a Next.js + Supabase app: **left
sidebar** in a deep-blue theme, role-aware nav, and all three portals working
end-to-end.

**Student:** dashboard, new request + GCash payment proof upload, request
history/tracking, profile.
**Registrar:** dashboard, manage requests (status updates), verify payments
(view proof, approve/reject), reports + CSV export.
**Admin:** dashboard, manage users (change role, activate/deactivate),
analytics (requests by status/month), reports + CSV export.

## 1. Supabase setup

1. Create a project at https://supabase.com.
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
   This creates all tables, the `profiles` auto-provisioning trigger, Row Level
   Security policies, and a private `payment-proofs` storage bucket.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon
   public key**.
4. Create your first admin/registrar accounts by registering through the app
   (`/register` currently signs people up as `student`), then in the SQL
   editor run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
5. **Email verification** is on by default in Supabase: new sign-ups get a
   confirmation email and can't sign in until they click it (the app's
   `/register` page shows a "check your email" screen, and `/auth/confirm`
   handles the confirmation link). To customize it:
   - **Auth → Providers → Email**: toggle "Confirm email" on/off.
   - **Auth → URL Configuration**: add your site's URL (and
     `http://localhost:3000` for local dev) to the redirect allow-list, or
     the confirmation link will fail.
   - **Auth → Email Templates**: edit the "Confirm signup" template if you
     want Regis Marie branding in the email itself.
   - The login page has a "Resend verification email" link that appears if
     someone tries to sign in before confirming.

## 2. Local development

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Phase 1: Next.js + Supabase scaffold, left sidebar, blue theme"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 4. Deploy on Vercel

1. https://vercel.com → **Add New Project** → import the GitHub repo.
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Every push to `main` will auto-redeploy.

## Design notes

- Sidebar is fixed to the **left**, full height, gradient from `brand-950`
  (near-navy) down to `brand-700`, with role-specific nav items and an active
  state highlight.
- Color scale lives in `tailwind.config.ts` under `brand.50`–`brand.950` —
  edit those hex values to shift the whole app's shade of blue in one place.
- `app/(dashboard)/layout.tsx` is a server component that loads the signed-in
  user's profile (name + role) and feeds it to `DashboardShell`, which renders
  `Sidebar` + `Topbar` + page content. Every role's pages live under
  `app/(dashboard)/<role>/...` and automatically get the sidebar.

## Not included yet

- Email notifications for status changes (the `notifications` table exists;
  wiring it to actual emails would use a Supabase Edge Function + an email
  provider like Resend). Signup verification emails, however, are already
  handled by Supabase Auth (see step 5 above).
