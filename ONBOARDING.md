# Codebase Onboarding

Postgraduate Hub is a **single-package React + TypeScript SPA** (Vite 7) for a university postgraduate portal. Data and auth come from **Supabase** (Postgres, Auth, Storage, PostgREST). There is **no custom HTTP API** in this repo—only the browser client.

---

## Quick start

1. **Clone** the repository.
2. **Install dependencies** (pick one lockfile workflow; both `package-lock.json` and Bun lockfiles exist):
   ```bash
   npm install
   ```
3. **Environment** — create a `.env` at the repo root (not committed). Required for runtime:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`  
   There is no `.env.example` in-tree; see `README.md` and `PROJECT_DOCUMENTATION.md` for details.
4. **Database** — migrations live in `supabase/migrations/`. For local Supabase:
   ```bash
   npm run supabase:start
   npm run db:push
   ```
   Regenerate TypeScript types after schema changes:
   ```bash
   npm run supabase:types
   ```
5. **Dev server**:
   ```bash
   npm run dev
   ```
   Default dev URL: **http://localhost:8080** (`vite.config.ts`).

Other useful scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run test`.

---

## Architecture

| Area | Notes |
|------|--------|
| **Entry** | `index.html` → `src/main.tsx` |
| **Framework** | React 18, React Router |
| **Build** | Vite 7 + `@vitejs/plugin-react-swc` |
| **Styling** | Tailwind CSS, PostCSS; **shadcn/ui**-style components under `src/components/ui/` (Radix primitives) |
| **State / server cache** | TanStack React Query v5 (`QueryClient` in `src/App.tsx`: aggressive refetch defaults) |
| **Forms** | React Hook Form + Zod |
| **Motion** | Framer Motion (landing / marketing surfaces) |
| **Tests** | Vitest (`vitest.config.ts`) |
| **Lint** | ESLint flat config (`eslint.config.js`) |
| **Monorepo** | **No** — one npm package, no `apps/` split |
| **Backend in repo** | Supabase CLI project: `supabase/config.toml`, SQL migrations only; **no `supabase/functions/`** checked in |

### Top-level layout

| Path | Purpose |
|------|---------|
| `src/` | Pages, components, hooks, `lib/`, `contexts/`, integrations |
| `public/` | Static assets |
| `supabase/` | Migrations, local project config |
| `.github/workflows/` | CI (e.g. Supabase `db push` on migration changes) |
| `.agents/` | Agent skills (not runtime) |

Path alias: `@/*` → `src/*` (`tsconfig.app.json`).

---

## Data models

- **Source of truth:** SQL in `supabase/migrations/`.
- **Types:** `src/integrations/supabase/types.ts` (regenerate after migrations).

### Notable tables (public)

Content is mostly **flat tables** without FKs between content entities; linking is by convention (slugs, categories, app routes).

| Table | Role |
|-------|------|
| `user_roles` | `user_id` → `auth.users`, `role` (`app_role`: `admin`, `user`, `student`) |
| `research_plans` | Study plan / regulation PDFs and milestones (`regulation_track`, `program_group`, `file_url`) |
| `study_plans` | Legacy study-plan documents (`file_url`) — distinct from UI “study plan” which often reads **`research_plans`** |
| `schedules` | Timetable-style rows: `category` (`study` \| `exams` \| `research_plan`), `date_info`, optional `file_url` |
| `research_database`, `research_archive`, `templates`, `admissions`, `admission_docs` | Portal content |
| `staff_cv` | Faculty profiles + `cv_pdf_url` |
| `news_posts`, `events`, `service_offerings` | Marketing / portal |
| `inquiries` | Contact form (public insert, admin read) |
| `student_submissions`, `thesis_upload_submissions` | Authenticated / guest submissions |

### Helpers & RLS

- **`has_role(_user_id, _role)`** — `SECURITY DEFINER`; used in RLS for admin checks.
- **`handle_new_user_student_role`** — on `auth.users` insert, ensures a `student` row in `user_roles`.
- **Pattern:** public `SELECT` on most portal tables; writes for **`has_role(auth.uid(), 'admin')`** (see portal migrations, e.g. `20260406120000_portal_academics_news_events.sql`).
- **Storage:** `documents` bucket (+ thesis paths under `thesis-submissions`); policies in later migrations.

Seeds are **inside migrations** (e.g. `20260407130000_consolidated_demo_data.sql`), not a separate seed runner.

---

## “API” and data access

There are **no REST/GraphQL/tRPC routes** in this app.

| Mechanism | Usage |
|-----------|--------|
| **PostgREST** | `supabase.from('<table>').select|insert|update|delete` |
| **Auth** | `supabase.auth.*` via `AuthContext` |
| **RPC** | `supabase.rpc('has_role', …)` for roles |
| **Storage** | `supabase.storage.from('documents').upload` + `getPublicUrl` |

Client: `src/integrations/supabase/client.ts` (`isSupabaseConfigured` guards UI when env is missing).

**React Query:** reads in `useQuery`, writes in `useMutation`, then `invalidateQueries` on admin screens. Much logic lives **in page components** rather than a thick `hooks/` data layer (exception: `useArchiveData`).

**PDF download helper:** `src/lib/downloadPdf.ts` — used with public URLs resolved by `resolvePublicMediaUrl` in `src/lib/utils.ts`.

---

## Authentication

| Piece | Location |
|-------|----------|
| Provider | `src/contexts/AuthContext.tsx` |
| Consumer | `useAuth()` — `session`, `user`, `role` (`'admin' \| 'student' \| null`), `isAdmin`, `isStudent`, `signIn`, `signUp`, `signOut` |
| Admin shell | `src/components/layout/RequireAdmin.tsx` wraps `/admin/*` in `src/App.tsx` |
| Login / signup | `src/pages/Login.tsx`, `src/pages/SignUp.tsx` |

**Important:** role checks after `onAuthStateChange` are **deferred** (`setTimeout(0)`) when calling `has_role` to avoid a known supabase-js deadlock (see comment in `AuthContext.tsx`).

**Defense in depth:** UI checks + **Postgres RLS**. New users get **`student`** via DB trigger; **`admin`** is assigned manually (e.g. insert into `user_roles`).

---

## Deployment & infrastructure

- **Docker / Fly / Terraform:** not present in-repo.
- **CI:** `.github/workflows/` — Supabase migration push workflow when `supabase/migrations/**` or `supabase/config.toml` changes (uses repo secrets for Supabase CLI).
- **Production build:** static `dist/` from `npm run build`; configure `VITE_*` at **build time** for the target Supabase project.

---

## UI / UX patterns (product consistency)

These patterns matter when adding new sections (e.g. **Academic calendar**):

1. **Page shell** — `PageHeader` (`src/components/PageHeader.tsx`) for title + description on full pages.
2. **Cards & tables** — shadcn `Card`, `Table`, `Dialog`, `Alert`, `Skeleton` for admin lists and forms.
3. **Institutional buttons** — admin/dashboard uses classes like `btn-primary-institutional` where established (`Admin.tsx`).
4. **Breadcrumbs** — `SiteBreadcrumbs` + `src/lib/siteBreadcrumbs.ts` for public and admin trails.
5. **Navigation** — Public mega-nav in `src/components/layout/PublicLayout.tsx` (`NAV` constant); admin sidebar `src/components/layout/AppSidebar.tsx`; path constants `src/lib/adminRoutes.ts` (`ADMIN_PATHS`).
6. **Embedded sections** — Many pages accept `embedded?: boolean` for use inside `src/components/landing/LandingEmbeds.tsx` (no iframes; full page components with tighter layout).
7. **PDFs today** — **`RegulationPdfBlock`**: “Download PDF” + “Open PDF” (new tab). **No in-app PDF iframe**; “view” = open in browser/PDF viewer via new tab.
8. **Admin file upload** — **`PdfUploadField`** (`src/components/admin/PdfUploadField.tsx`) + `src/lib/uploadPdf.ts` uploads to Storage bucket **`documents`** with a folder prefix (e.g. `schedules`).

---

## Implementing: Academic calendar (PDF submenu + admin CRUD)

This section maps the feature request to existing patterns so implementation stays consistent.

### Product placement

- **Public submenu:** Add an item under **Academics** (or the nav block you use for PG hub) in `PublicLayout.tsx` `NAV`, and mirror links on **`AcademicsOverview.tsx`**, **`LandingEmbeds.tsx`** / **`HomeHighlights.tsx`** if the calendar should appear on the landing grid—match how **Schedules** and **Study plan** are linked today.
- **Routes:** Add a route in `src/App.tsx` (e.g. `/academics/academic-calendar`) and lazy-loaded page component under `src/pages/`.

### Data model options

| Approach | When to use |
|----------|-------------|
| **A. Extend `schedules`** | Add a new `category` value (e.g. `academic_calendar`) via migration (`CHECK` constraint), then filter that category on a dedicated public page. **Admin:** extend `AdminSchedules.tsx` filters + copy, or add a thin wrapper page that reuses the same table with a fixed category. |
| **B. New table** `academic_calendar` (or similar) | If you need different columns (e.g. semester, audience) or do not want to overload `schedules`. Mirror **`AdminSchedules.tsx`** + RLS: public read, admin CRUD via `has_role`. |

Either way: store **`file_url`** (public Storage URL) like existing PDF rows.

### PDF view + download

- Reuse **`RegulationPdfBlock`** for parity with study plans and schedules.
- Extend **`PdfSurface`** in `src/components/RegulationPdfBlock.tsx` with e.g. `"academic-calendar"` and add **`defaultEmptyHint`** text pointing admins to the new admin screen.
- **Upload path:** pass a dedicated `storageFolder` to **`PdfUploadField`** (e.g. `academic-calendar`) consistent with `uploadPdf.ts` / bucket policies (may need a migration tweak if policies are path-prefix specific).

### Admin dashboard

1. Add **`ADMIN_PATHS.academicCalendar`** (or similar) in `src/lib/adminRoutes.ts`.
2. Register route under the existing **`<RequireAdmin />`** tree in `src/App.tsx`; add **legacy redirect** if you replace an old path.
3. Add sidebar entry in **`AppSidebar.tsx`** and a quick link on **`Admin.tsx`**.
4. Add breadcrumbs in **`siteBreadcrumbs.ts`**.
5. Implement **`src/pages/admin/AdminAcademicCalendar.tsx`** (name as you prefer) following **`AdminSchedules.tsx`**: React Query list, dialog form, `PdfUploadField`, toast + `invalidateQueries`, `Navigate` to `/login` if `!isAdmin`.

### After schema changes

1. New migration under `supabase/migrations/`.
2. **`npm run supabase:types`** (or remote variant) to refresh `src/integrations/supabase/types.ts`.
3. Ensure RLS policies match other portal tables (select public, mutate admin).

### Optional enhancement

If you need **true in-page PDF preview** (embedded), that would be a **new** pattern (e.g. `<iframe title="…" src={href} />` with sandbox considerations and mobile fallbacks). The current design intentionally uses **open in new tab** for consistency and simpler CSP/sizing behavior.

---

## Key files to know

| File | Why it matters |
|------|----------------|
| `src/App.tsx` | Routes, lazy pages, `QueryClientProvider`, `AuthProvider`, admin layout |
| `src/contexts/AuthContext.tsx` | Session, roles, sign-in/out |
| `src/integrations/supabase/client.ts` | Supabase browser client |
| `src/lib/adminRoutes.ts` | Canonical admin URLs |
| `src/lib/siteBreadcrumbs.ts` | Public + admin breadcrumb labels |
| `src/components/layout/PublicLayout.tsx` | Public nav structure |
| `src/components/layout/AppSidebar.tsx` | Admin nav |
| `src/components/RegulationPdfBlock.tsx` | Standard PDF actions |
| `src/components/admin/PdfUploadField.tsx` | Admin PDF upload |
| `src/pages/admin/AdminSchedules.tsx` | Closest CRUD reference for calendar-like PDF rows |
| `src/pages/Schedules.tsx` | Public schedules + PDF blocks |
| `src/pages/StudyPlan.tsx` | Reads `research_plans`, uses `RegulationPdfBlock` |
| `supabase/migrations/*.sql` | Schema and RLS |

---

## Gotchas

- **Lockfiles:** Both npm and Bun artifacts may exist—align the team on one package manager.
- **Env:** No `.env.example`; document `VITE_*` in team wiki or add `.env.example` locally if desired.
- **Study plan naming:** Public **Study plan** UI often queries **`research_plans`**, not `study_plans`—confirm table before editing.
- **Roles:** DB enum includes `user`; client role union focuses on `admin` / `student`.
- **Security:** Never rely on UI alone; every write path must be allowed by **RLS** for the intended role.

---

*Generated from a parallel codebase scan (architecture, database, data access, auth, deployment/UI patterns) and aligned with the repo state at onboarding time.*
