# Carnival

Clerk-authenticated Next.js admin/content app prepared for Tencent EdgeOne Makers. File uploads are intentionally disabled. Dynamic page text and signup settings use managed Neon Postgres, not the deployment filesystem.

## Requirements and services

- Node.js 20 or newer and npm
- A Clerk application
- A Neon Postgres database (or another PostgreSQL service with a compatible HTTP driver; this project uses Neon serverless)
- Tencent Cloud EdgeOne Makers project connected to this GitHub repository

The app does not write uploads, settings, or page text to the local filesystem. User identities/actions are managed by Clerk; app settings and homepage HTML are stored in Postgres. Use production Clerk keys and a production database for production deployments.

## Configure Clerk

1. Create a Clerk application and enable the email/password or other sign-in methods you want.
2. Add the deployed EdgeOne domain to Clerk's allowed origins/redirect URLs per the Clerk dashboard.
3. Set the following environment variables in EdgeOne Makers for the deployment environment:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY` (secret; server only)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin`
   - `ADMIN_EMAILS=troy@troysmithson.com` (Troy is always included by the app)
4. Verify `troy@troysmithson.com` in Clerk before opening `/admin`. The app checks verified email addresses server-side; it does not trust browser-supplied admin flags.

## Configure persistent database

1. Create a Neon project/database and copy its pooled or serverless connection string.
2. Add `DATABASE_URL` to EdgeOne Makers environment variables as a secret. Do not commit credentials or expose this value with a `NEXT_PUBLIC_` prefix.
3. The app creates `carnival_app_data` on first request and stores `settings` and `site-content` as JSONB records. For stricter production operations, run the schema in `db/schema.sql` as a migration before deploying.
4. The database must accept HTTPS serverless connections from the deployed app. If using a different PostgreSQL provider, test its driver/runtime compatibility first.

## Deploy with EdgeOne Makers

1. Push this repository to GitHub and connect it in the Tencent Cloud EdgeOne Makers console.
2. Select the repository and `main` branch. Choose the Next.js framework preset if offered.
3. Configure the build command as `npm run build`. Use the platform's Next.js full-stack/SSR deployment mode; do not select static export (`output: export`) because Clerk auth and admin route handlers require server execution.
4. Add the Clerk and `DATABASE_URL` variables to the project's environment-variable settings for Preview and Production as appropriate. Mark secret values as secret.
5. Deploy. Visit `/`, `/sign-in`, `/sign-up`, then log in as the verified admin and open `/admin`.
6. Check the Makers build and function logs. Test signup close/open, page content save/reload, and user actions in a non-production Clerk instance first.
7. Attach a custom domain and configure the same production URL in Clerk's allowed domains/redirect configuration.

EdgeOne Makers product features and UI labels can differ by region/account. Confirm the current Next.js SSR deployment/runtime and environment-variable workflow in the Makers console/docs. This code uses `runtime = 'nodejs'` for the database and Clerk admin API handlers; if the selected EdgeOne deployment target only supports Edge runtime for Next.js handlers, this project needs a supported Node/cloud-function target rather than static export.

## Local development

```bash
cp .env.example .env.local
# Fill in Clerk keys and DATABASE_URL
npm install
npm run dev
```

Then use `npm run build` to check the production build. Never add `.env.local` to Git.

## Security and operational notes

- Admin authorization is checked server-side using Clerk's server SDK and verified email.
- The homepage editor output is sanitized both when saved and when read.
- Account state-changing actions are server-side Clerk calls. Password resets remain in Clerk's built-in user-initiated "Forgot password" flow; the app does not send custom reset emails.
- Security headers are configured in `next.config.mjs`; test Clerk sign-in and any custom domain after deployment because a restrictive Content Security Policy may need the Clerk domains for your instance.
- Signup setting/content are dynamic and backed by Postgres. Keep DB connection secrets private and take database backups.
- File upload endpoints remain disabled; no `/files` uploads are offered.

## Project scripts

- `npm run dev` — local Next.js development server
- `npm run build` — production build
- `npm start` — local production server
