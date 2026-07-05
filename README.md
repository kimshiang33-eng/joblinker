# JobLinker

JobLinker is a mobile-first Malaysian job board. Employers publish moderated listings and job seekers contact them through WhatsApp.

## Local app

Requirements: Node.js 20+ and a Supabase project.

Create `.env.local` with:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Then run:

```powershell
npm.cmd install
npm.cmd run dev -- -H 0.0.0.0 -p 3000
```

Useful checks:

```powershell
npm.cmd run lint
npm.cmd run build
```

## Database migrations

`supabase/migrations` is the authoritative database history. Files are applied in timestamp order. The older `supabase/schema` directory is retained only as implementation reference; do not run those files against a new project.

For a new environment:

```powershell
npx.cmd --yes supabase start
npx.cmd --yes supabase db reset
```

To deploy after linking the intended project:

```powershell
npx.cmd --yes supabase link
npx.cmd --yes supabase db push --dry-run
npx.cmd --yes supabase db push
```

Do not edit the remote schema in the Dashboard after adopting migrations. Create each future change with:

```powershell
npx.cmd --yes supabase migration new descriptive_change_name
```

## Security and legal notes

- Public jobs are read through `get_public_jobs`; direct anonymous table access is not used.
- Employer and admin access is enforced by Supabase Auth, RLS and guarded RPC functions.
- The unused application/resume flow is disabled. Its table and private bucket may remain in an existing project, but `anon` and `authenticated` roles have no access.
- Signup records the accepted Terms of Use and Privacy Policy versions in `legal_acceptances`. Clients cannot read or modify those records.
- Before public launch, replace the legal operator name, registered address, support email and privacy contact placeholders.

## Admin access

An administrator must first have a normal Supabase Auth user. Add that user's UUID to `public.admin_users` using a trusted SQL/admin workflow. Never expose a service-role key to the browser.
