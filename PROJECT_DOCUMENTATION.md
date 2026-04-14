# Postgraduate Studies Management Portal — Project Documentation

This document describes the **Postgraduate Hub** (`post-graduate-studies-platform` / postgrad-hub) so teammates can understand what it does, how it works, and how to work on it safely. It reflects the repository as of the latest scan (Vite + React SPA, Supabase backend, academics and research portal routes).

---

## 1. Project Overview

### Project name
**Postgraduate Studies Management Portal** (npm package: `post-graduate-studies-platform` in `package.json`)

### Purpose
A single-page web application for a postgraduate studies department: public browsing of academics, research resources, news/events, admission guidance, and services; student accounts for submissions; an admin panel for content and inquiries.

### Core idea
- **Public users** browse `/`, `/academics`, `/research/*`, `/news`, `/events`, `/schedules`, `/services`, `/contact`, admission pages, and more—often without logging in. The home page loads live previews from Supabase where configured.
- **Registered students** use **Sign up** / **Login**. New Auth users get the **`student`** role via a database trigger. They use **Student Dashboard** (`/dashboard`), **Submit Application** (`/submit`), **Submission portal** (`/submissions`), and related flows; RLS scopes data by `user_id` where applicable.
- **Admins** use **`/admin`**: dashboard stats, submission review, inquiries, and CRUD for portal content—all backed by Supabase. Route paths for tools are centralized in **`src/lib/adminRoutes.ts`** (`ADMIN_PATHS`).

### Target users
- **Visitors**: Browse without an account.
- **Students**: `user_roles` includes **`student`** (default on signup).
- **Admins**: `user_roles` includes **`admin`** (assigned manually in Supabase).

### Main features (routes in parentheses)
| Feature | What it does |
|--------|----------------|
| **Home** | Hero carousel (`public/hero/`), highlights, optional live data; setup alert if Supabase env missing. |
| **Academics hub** | `/academics` overview; staff CV (`/academics/academic-staff`); **Study plan** (`/academics/study-plan`) with regulation PDFs; **Research plan** milestones (`/academics/research-plan`); legacy regulation redirects (`/academics/regulations/masters`, `/phd`). |
| **Schedules** | Standalone PG calendar: `/schedules` (table **`schedules`**). |
| **Research section** | `/research` layout: **database** (`/research/database`), **thesis archive** (`/research/thesis-archive`), **templates** (`/research/templates`). |
| **News / Events** | `/news`, `/events` from **`news_posts`** / **`events`**. |
| **Services** | `/services` (landing embed + anchors); admin manages **`service_offerings`**. |
| **Admission (portal)** | `/admission/how-to-apply`, `/admission/required-documents` (content partly from **`admission_docs`**). External university admission site linked from nav. |
| **Contact** | `/contact` and forms → **`inquiries`**. |
| **Login** | `/login` — Supabase email/password; redirect: admin → **`ADMIN_PATHS.root`** (`/admin`), student → `/dashboard`. |
| **Sign up** | `/signup` → `student` role via trigger. |
| **Student Dashboard** | `/dashboard` — submissions; requires **student** or **admin**. |
| **Submit Application** | `/submit` — **`student_submissions`**. |
| **Submission portal** | `/submissions` — signed-in students upload **proposal** or **thesis** PDFs → **`thesis_upload_submissions`**. |
| **Admin Dashboard** | `/admin` — stats, quick links, submissions + inquiries tabs. |
| **Admin tools** | Sidebar + lazy routes (see §2.1 and `ADMIN_PATHS`). Legacy URLs redirect to canonical slugs. |
| **Unknown paths** | Router sends `*` → **`/`** (home), not a dedicated 404 route. A **`NotFound.tsx`** file exists but is not registered in `App.tsx`. |

---

## 2. High-Level Architecture

### In simple terms
- **Frontend**: **React 18**, **TypeScript**, **Vite 7** (`@vitejs/plugin-react-swc`). UI: **shadcn/ui** (Radix) + **Tailwind**. **TanStack Query** for server state. **framer-motion** on key pages. **Sonner** + Radix toaster in `App.tsx`. **No app-owned HTTP API** in this repo.
- **Backend**: **Supabase** (Auth, PostgreSQL, Storage). Access via **`@supabase/supabase-js`** and **`src/integrations/supabase/types.ts`**.
- **Database**: PostgreSQL on Supabase. Schema source: **`supabase/migrations/*.sql`** (add new migrations; do not rewrite applied history).
- **Communication**: Browser → `createClient` in `client.ts` → PostgREST, Auth, Storage. **`isSupabaseConfigured`** avoids blind queries when env vars are missing.
- **Authentication**: Email/password, **localStorage** session, **`has_role`** RPC for **`admin`** / **`student`**. Custom **`lock`** no-op avoids multi-tab Navigator Lock issues.
- **Files**: Storage bucket **`documents`**; `file_url` / upload helpers in **`src/lib/uploadPdf.ts`**, **`src/lib/uploadImage.ts`**; downloads may use **`src/lib/downloadPdf.ts`** (`fetch` to public URLs).

### 2.1 Application routes (React Router)

**Public (selected)**  
`/`, `/academics`, `/academics/academic-staff`, `/academics/study-plan`, `/academics/research-plan`, `/academics/regulations/masters`, `/academics/regulations/phd`, `/schedules`, `/research`, `/research/database`, `/research/thesis-archive`, `/research/templates`, `/services`, `/news`, `/events`, `/contact`, `/admission/how-to-apply`, `/admission/required-documents`, `/login`, `/signup`, `/dashboard`, `/submit`, `/submissions`.

**Admin (canonical paths — use these in new code)**  
Defined in **`src/lib/adminRoutes.ts`** as **`ADMIN_PATHS`**:

| Key | Path | Page component |
|-----|------|----------------|
| `root` | `/admin` | `Admin.tsx` |
| `staffCv` | `/admin/staff-cv` | `AdminStaffCv` |
| `studyPlanRegulations` | `/admin/study-plan-regulations` | `AdminResearchPlans` |
| `programPdfsLegacy` | `/admin/program-pdfs-legacy` | `AdminStudyPlans` |
| `schedules` | `/admin/schedules` | `AdminSchedules` |
| `researchDatabase` | `/admin/research-database` | `AdminResearchDatabase` |
| `templates` | `/admin/templates` | `AdminTemplates` |
| `thesisArchive` | `/admin/thesis-archive` | `AdminArchive` |
| `degreeRequirements` | `/admin/degree-requirements` | `AdminAdmissions` |
| `admissionPages` | `/admin/admission-pages` | `AdminAdmissionDocs` |
| `news` | `/admin/news` | `AdminNews` |
| `events` | `/admin/events` | `AdminEvents` |
| `services` | `/admin/services` | `AdminServices` |
| `contactInquiries` | `/admin/contact-inquiries` | `AdminInquiries` |

**Legacy admin URLs (redirect with `replace` to the row above)**  
`/admin/research-plans` → study plan & regulations; `/admin/study-plans` → program PDFs legacy; `/admin/archive` → thesis archive; `/admin/admissions` → degree requirements; `/admin/admission-docs` → admission pages; `/admin/inquiries` → contact inquiries.

All **`/admin/*`** routes (including redirects) are nested under **`RequireAdmin`** in **`App.tsx`**.

### Architecture diagram (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React + TypeScript)                            │
│  • Pages: Index, Academics, StudyPlan, ResearchPlan, Research/*, │
│    News, Events, Schedules, Services, Contact, Admission, …    │
│    Admin + pages/admin/*, StudentDashboard, Submit, Submissions  │
│  • AuthContext: session, user, role, isAdmin, isStudent          │
│  • React Query; lazy routes + Suspense                           │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS (Supabase JS)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SUPABASE                                                        │
│  • Auth · PostgreSQL · Storage (`documents`) · RLS · has_role    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure Explanation

| Path | Purpose |
|------|--------|
| **`/src`** | Application source: `main.tsx`, `App.tsx`, pages, components, hooks, contexts, `lib/`, `integrations/supabase/`. |
| **`/src/pages`** | Route screens: root pages (`Index`, `Login`, `SignUp`, `Admin`, `StudentDashboard`, …), **`academics/`**, **`research/`**, **`admin/`** (CRUD modules). |
| **`/src/pages/admin`** | Admin CRUD: archive, schedules, templates, inquiries, admissions, staff CV, study plans (legacy PDFs), research plans (study plan & regulations), research database, admission docs, news, events, services. |
| **`/src/components`** | Shared UI, **`layout/`** (`AppLayout`, `PublicLayout`, `AdminLayout`, `AppSidebar`, `Footer`), **`landing/`**, **`admin/`** helpers, **`ui/`** (shadcn). |
| **`/src/contexts`** | **`AuthContext.tsx`** — session, role, signIn, signUp, signOut. |
| **`/src/hooks`** | e.g. **`useArchiveData.ts`**, **`useDebounce.ts`**, **`use-mobile.tsx`**, toasts. |
| **`/src/integrations/supabase`** | **`client.ts`**, generated **`types.ts`**. |
| **`/src/lib`** | **`utils.ts`** (`cn`, `getErrorMessage`), **`adminRoutes.ts`** (`ADMIN_PATHS`), upload/download helpers, domain helpers (e.g. study plan grouping). |
| **`/supabase`** | **`config.toml`**, **`migrations/`** — schema, RLS, storage policies. |
| **`/public`** | Static assets: logos, hero images, `robots.txt`, etc. |
| **`/.github/workflows`** | e.g. **`supabase-db-push.yml`** — push migrations on `main` when `supabase/**` changes (requires repo secrets). |
| **`/.agents`** | Local agent skills; not part of the runtime bundle. |

### What to change carefully
- **`src/integrations/supabase/client.ts`**, **`types.ts`**, **`AuthContext.tsx`**, **`App.tsx`** routing — security and wiring.
- **`supabase/migrations/*.sql`** — append new migrations instead of editing deployed history.

### Safer to edit
- **`src/pages/**`** and **`src/components/layout/**`** for UX and copy.
- New **`src/components/**`** (outside `ui/` primitives when possible).

### Layout
- **`AppLayout`**: If `pathname.startsWith('/admin')` → **`AdminLayout`**; else **`PublicLayout`** (including `/dashboard`, `/submit`, `/login`).
- **`PublicLayout`**: Full institutional header (multi-level nav, external MUST links + PG hub routes), content, **`Footer`**.
- **`AdminLayout`**: Sidebar + admin chrome.
- **`AppSidebar`**: Admin groups (**Overview**, **Academics**, **Admission**, **Engagement**) and student links when **`isStudent`**; URLs come from **`ADMIN_PATHS`**.

---

## 4. Core System Flow

### App boot
1. Vite serves the SPA; **`AuthProvider`** runs **`getSession()`** and **`onAuthStateChange`**.
2. **`checkRole`** calls **`has_role`** for **admin** then **student** (deferred with **`setTimeout(0)`** inside the auth callback to avoid a Supabase client deadlock).
3. **`AppLayout`** picks public vs admin shell.
4. **`Suspense`** + lazy pages show **`SkeletonCard`** while chunks load.

### Login
1. **`signInWithPassword`**.
2. **`Login`** redirects: **admin** → **`ADMIN_PATHS.root`**, **student** → **`/dashboard`**.
3. **`RequireAdmin`** gates all **`/admin`** routes.

### Signup
1. **`auth.signUp`** → trigger **`on_auth_user_created_assign_student`** runs **`handle_new_user_student_role()`** → inserts **`user_roles`** with **`student`**.

### Data flow (generic)
User action → React → React Query → `supabase.from(...)` / `storage` / `rpc('has_role')` → Supabase → UI update.

---

## 5. Database Structure (Simplified)

Tables live in **`public`** unless noted. Exact columns: **`types.ts`** + migrations.

| Table | Role |
|-------|------|
| **user_roles** | **`app_role`**: `admin`, `user`, `student`. **`has_role`** checks this. |
| **student_submissions** | Student applications; **`status`**, RLS by **`user_id`**. |
| **thesis_upload_submissions** | Thesis/proposal uploads (see migrations for **`submission_type`**, status). |
| **research_archive** | Thesis archive listings (public + admin). |
| **research_database** | Publication-style entries. |
| **research_plans** | Study plan & regulations rows (tracks, programme grouping, PDFs, milestones copy). |
| **study_plans** | Legacy programme PDF metadata (**Program PDFs (legacy)** admin). |
| **staff_cv** | Academic staff profiles and assets. |
| **schedules** | Schedule entries (**category** includes study / exams / research_plan). |
| **templates** | Downloadable templates. |
| **admissions** | Structured degree requirements (master/phd JSON fields). |
| **admission_docs** | Admission page sections / PDFs. |
| **inquiries** | Contact messages; public insert, admin read. |
| **news_posts** / **events** | Portal news and events. |
| **service_offerings** | IT services (iThenticate, EKB, etc.). |

**Storage**: Bucket **`documents`** with RLS on **`storage.objects`**; some paths allow authenticated student uploads (see **`20260410120000_storage_documents_bucket_policies.sql`**, **`20260414120000_portal_routes_schema.sql`**).

**Security**: RLS on all sensitive tables; admin writes often use **`has_role(auth.uid(), 'admin')`**. React route guards are **not** a substitute for RLS.

---

## 6. Authentication and Authorization

- **Signup / login**: As above; email confirmation depends on Supabase project settings.
- **Admins**: Insert **`user_roles`** with **`admin`** for the user’s **`auth.users.id`**.
- **Sessions**: **`localStorage`**, **`autoRefreshToken`**, custom **`lock`**.
- **`StudentDashboard`**: Requires **student** or **admin**.
- Do not weaken **`has_role`** or RLS without security review.

---

## 7. Environment Setup Guide

### Prerequisites
- **Node.js** LTS and **npm**. A **`bun.lock`** may exist; docs assume **npm**.

### Install and run
```bash
git clone <repository-url>
cd postgrad-hub
npm install
npm run dev
```
Dev server: **`vite.config.ts`** — host **`::`**, port **`8080`** → **http://localhost:8080**.

### Environment variables
There is **no** committed **`.env.example`**; create **`.env`** locally (gitignored).

| Variable | Purpose |
|----------|---------|
| **`VITE_SUPABASE_URL`** | Project URL (`https://xxxx.supabase.co`). |
| **`VITE_SUPABASE_PUBLISHABLE_KEY`** | Supabase anon / publishable key. |

Read in **`src/integrations/supabase/client.ts`**. If missing, **`isSupabaseConfigured`** is false and the UI can show setup hints.

### Database from CLI
Scripts in **`package.json`**: **`supabase:start`**, **`db:push`**, **`db:reset`**, **`supabase:types`**, **`supabase:types:remote`**. CI: **`.github/workflows/supabase-db-push.yml`** needs secrets **`SUPABASE_ACCESS_TOKEN`**, **`SUPABASE_PROJECT_REF`**, **`SUPABASE_DB_PASSWORD`** (if you use that workflow).

### Deploy
Build **`npm run build`** → **`dist/`**. Static hosting (Netlify, Vercel, Cloudflare Pages, S3+CDN, etc.); set **`VITE_*`** at build time. No Dockerfile in repo.

### Common mistakes
Wrong/missing **`.env`**, port **8080** busy, schema out of sync with **`types.ts`** (regenerate after migrations).

---

## 8. How Teammates Should Work on This Project

### Workflow
Branch → **`npm run dev`** → small commits → PR.

### Adding a route
1. **`lazy`** import in **`App.tsx`** + **`<Route>`** (and **`Navigate`** if replacing an old path).
2. Link from **`PublicLayout`** / **`Index`** / **`AppSidebar`** as needed.
3. For admin paths, add or reuse a key in **`ADMIN_PATHS`** and wire **`AppSidebar`** / **`Admin.tsx`** to it.

### Adding admin CRUD
New page under **`src/pages/admin/`**, register under **`RequireAdmin`**, extend **`ADMIN_PATHS`**, add RLS migration for new tables.

### Types
After schema changes: **`npm run supabase:types`** (local) or **`supabase:types:remote`** (linked project).

### Style
**`@/`** alias, TypeScript, functional components, Tailwind + design tokens.

---

## 9. Testing and Debugging

### Manual smoke tests
- **Public**: `/`, `/academics/study-plan`, `/academics/research-plan`, `/research/database`, `/news`, `/events`, `/schedules`, `/contact`.
- **Student**: signup → dashboard; submit application; **`/submissions`** if using uploads.
- **Admin**: **`/admin`**; open each **`ADMIN_PATHS`** URL; confirm legacy URLs redirect once.
- **Guards**: non-admin hitting **`/admin/...`** → login.

### When things break
Supabase Dashboard (logs, RLS), browser Network tab, **`ErrorBoundary`** console logs.

---

## 10. Future Improvements and Scalability

- Richer **admissions** surfacing on public pages from **`admissions`** / **`admission_docs`**.
- More **Vitest** coverage (hooks, critical flows).
- Pagination/virtualization for large lists.
- Optional dedicated **404** route instead of redirecting unknown paths to **`/`**.

---

## 11. Summary

| Aspect | Detail |
|--------|--------|
| **Stack** | Vite 7, React 18, TS, shadcn/ui, Tailwind, TanStack Query, framer-motion, Sonner, Supabase JS |
| **Data** | Supabase Postgres + Storage; many content tables + **`student_submissions`** / thesis uploads |
| **Auth** | Email/password; **`student`** on signup; **`admin`** manual; **`has_role`** |
| **Admin URLs** | **`ADMIN_PATHS`** in **`src/lib/adminRoutes.ts`**; legacy paths redirect in **`App.tsx`** |
| **Safe to edit** | Pages, layout, landing components, hooks |
| **Edit with care** | **`client.ts`**, **AuthContext**, **types.ts**, migrations, root routes |

---

## 12. Recent Changes (Changelog)

High-level diary; details live in Git.

### 2026 — Portal routes and academics
- **`/academics/*`**, **`/research/*`**, **`/schedules`**, **`/news`**, **`/events`**, **`/services`**, **`/admission/*`**, **`/submissions`**.
- **Study plan** vs **Research plan** public pages; regulation PDFs and admin **Study plan & regulations** (`AdminResearchPlans`).

### 2026 — Admin URL slugs
- Canonical admin paths aligned with dashboard/sidebar labels via **`ADMIN_PATHS`**; old paths (**`/admin/research-plans`**, **`/admin/study-plans`**, **`/admin/archive`**, **`/admin/admissions`**, **`/admin/admission-docs`**, **`/admin/inquiries`**) redirect.

### 2026 — Student accounts and submissions
- **`student_submissions`**, **`student`** role, **`AuthContext`** role checks, **`/signup`**, **`/dashboard`**, **`/submit`**.

### 2026 — Extended admin and content
- Staff CV, research database, admission docs, news, events, services admin pages; portal tables in migrations (see **`20260406120000_portal_academics_news_events.sql`** and follow-ups).

### Tooling
- **Vitest**, ESLint flat config, Supabase CLI scripts, GitHub Action for **`supabase db push`** on **`main`**.

### Branding and layout
- MUST-themed header/footer, carousel, institutional styling (**`index.html`**, **`index.css`**, **`tailwind.config.ts`**).

---

*If anything in the tree drifts from this file, prefer the code in **`App.tsx`**, **`adminRoutes.ts`**, and **`supabase/migrations/`** as the source of truth.*
