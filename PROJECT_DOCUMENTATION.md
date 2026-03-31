# Postgraduate Studies Management Portal — Project Documentation

This document describes the **Postgraduate Hub** (postgrad-hub) project so that teammates can understand what it does, how it works, and how to work on it safely.

---

## 1. Project Overview

### Project name
**Postgraduate Studies Management Portal** (package name: `postgrad-hub` in `package.json`)

### Purpose
A single web application that acts as the main hub for a postgraduate studies department. It centralizes academic resources, schedules, research archives, and contact with the administration.

### Core idea
- **Public users** (visitors, prospective students) can browse admissions info, schedules, templates, research archive, and submit contact inquiries without logging in. The **home page** loads live previews from Supabase and includes an inline contact form.
- **Registered students** use **Sign up** / **Login**. New Auth users automatically receive the **`student`** role (database trigger). They open the **Student Dashboard** and **Submit Application** to file proposals; admins approve or reject submissions from the Admin Dashboard.
- **Admins** use the **Admin Panel**: dashboard stats, submission review, and **in-app CRUD** for archive, schedules, templates, admissions, and inquiries—all backed by Supabase.

### Target users
- **Visitors**: Anyone browsing resources without an account.
- **Students**: Registered users who submit applications or proposals.
- **Admins**: Users with the **`admin`** role in `user_roles` who manage content and submissions.

### Main features (simple explanation)
| Feature | What it does |
|--------|----------------|
| **Home** | Hero **carousel** (images under `public/hero/`), schedule/archive/template previews from DB, document checklist cards, inline **contact** form; warns if env is missing or data fails (with **retry**). |
| **Admissions** | Masters/PhD copy and checklists (**mostly static** on the page; **`admissions`** rows are editable under `/admin/admissions`). |
| **Schedules** | Lists **`schedules`** (study / exams / research plan) with optional file links. |
| **Templates** | Lists **`templates`** with download links. |
| **Research Archive** | Public search/filter over **`research_archive`**. |
| **Contact** | Standalone page → **`inquiries`**. |
| **Login** | Supabase email/password; **redirect by role**: admin → `/admin`, student → `/dashboard`. |
| **Sign up** | **`/signup`** → **`signUp`** in AuthContext; **`student`** role auto-assigned. |
| **Student Dashboard** | **`/dashboard`** → user’s **`student_submissions`**; requires student or admin role; uses **public** header/footer. |
| **Submit Application** | **`/submit`** → insert **`student_submissions`**; requires signed-in user. |
| **Admin Dashboard** | **`/admin`** → stats, submissions tab (approve/reject pending), inquiries tab. |
| **Admin sub-pages** | **`/admin/archive`**, **`schedules`**, **`templates`**, **`admissions`**, **`inquiries`** — admin CRUD / management UIs (sidebar layout). |
| **NotFound** | Unknown routes. |

---

## 2. High-Level Architecture

### In simple terms
- **Frontend**: **React 18**, **TypeScript**, **Vite 7** (React plugin **SWC**). UI: **shadcn/ui** (Radix) + **Tailwind**. Motion: **framer-motion** on some pages. Toasts: **Radix toast** plus **Sonner** (`App.tsx` mounts both). No custom API server in this repo; **Supabase** is the backend.
- **Backend**: **Supabase** (Auth, PostgreSQL, Storage). All data access from the browser via **`@supabase/supabase-js`** typed with **`src/integrations/supabase/types.ts`**.
- **Database**: **PostgreSQL** (Supabase). Core tables: `user_roles`, `research_archive`, `inquiries`, `schedules`, `templates`, `admissions`, **`student_submissions`**.
- **Communication**: Browser → `createClient` in `client.ts` → Supabase REST/Realtime APIs. **`isSupabaseConfigured`** (exported from `client.ts`) gates queries when URL/key are missing so the UI can show setup hints instead of opaque failures.
- **Authentication**: Email/password. Session in **localStorage**, auto-refresh on. **`has_role`** RPC checks **`admin`** first, then **`student`**. Auth uses a **no-op `lock`** in client options to avoid multi-tab **Navigator Lock API** conflicts.
- **Data storage**: Rows in PostgreSQL; files in Storage (e.g. bucket **`documents`**). `file_url` fields reference stored assets.
- **Branding / HTML**: **`index.html`** sets title “MUST Post Graduate”, description, and OG/Twitter meta. **`index.css`** loads **Poppins** + **Open Sans** (Google Fonts) and **MUST** navy/gold CSS variables; **`tailwind.config.ts`** extends **`navy-dark`**, **`must-gold`**, etc., used by the **Footer**.

### Architecture diagram (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React + TypeScript)                            │
│  • Pages: Index, Admissions, Schedules, Templates, Archive,   │
│    Contact, Login, SignUp, Admin + admin/* CRUD,               │
│    StudentDashboard, SubmitApplication, NotFound                │
│  • AuthContext: session, user, role, isAdmin, isStudent,        │
│    signIn, signUp, signOut                                      │
│  • React Query for data fetching                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │  HTTPS (Supabase JS client)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SUPABASE (Backend-as-a-Service)                                 │
│  • Auth (email/password, sessions, JWT)                          │
│  • PostgreSQL (tables below)                                     │
│  • Storage (bucket: documents)                                   │
│  • Row Level Security (RLS) enforces who can read/write          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure Explanation

Based on the actual repository layout:

| Path | Purpose | Contents |
|------|--------|----------|
| **`/src`** | All application source code | React components, pages, hooks, contexts, styles. |
| **`/src/pages`** | Route-level screens | Root: `Index`, `Admissions`, `Schedules`, `Templates`, `ArchivePage`, `Contact`, `Login`, `SignUp`, `Admin`, `StudentDashboard`, `SubmitApplication`, `NotFound`. Subfolder **`admin/`**: `AdminArchive`, `AdminSchedules`, `AdminTemplates`, `AdminInquiries`, `AdminAdmissions`. |
| **`/src/components`** | Reusable UI and layout | `PageHeader.tsx`, `NavLink.tsx`, `EmptyState.tsx`, `ResearchCard.tsx`, **`PostgraduateCard.tsx`**, `SkeletonCard.tsx`, `ErrorBoundary.tsx`, and `layout/` (`AppLayout.tsx`, `PublicLayout.tsx`, **`Footer.tsx`**, `AdminLayout.tsx`, `AppSidebar.tsx`) and `ui/`. |
| **`/src/components/ui`** | shadcn/ui primitives | Many small components (button, card, input, dialog, tabs, etc.). **Prefer not modifying** unless you need a local override; use composition in your own components instead. |
| **`/src/contexts`** | React context providers | `AuthContext.tsx` — `session`, `user`, `role`, `isAdmin`, `isStudent`, `loading`, `signIn`, **`signUp`**, `signOut`. |
| **`/src/hooks`** | Custom React hooks | `useArchiveData.ts` (archive list with search/type filter), `useDebounce.ts`, `use-mobile.tsx`, `use-toast.ts` (and `use-toast.ts` in components/ui). |
| **`/src/integrations/supabase`** | Supabase connection and types | `client.ts` instantiates the client (`isSupabaseConfigured`, auth options). `types.ts` mirrors the DB — regenerate when the schema changes. Treat both as shared infrastructure (review before changing). |
| **`/src/lib`** | Shared utilities | `utils.ts`: **`cn()`** (Tailwind class merge) and **`getErrorMessage()`** (user-facing Supabase/network errors). |
| **`/supabase`** | Supabase config and schema | `config.toml` (project id), `migrations/` (SQL that creates tables, RLS, storage). **Critical**: avoid changing migrations that are already applied; add new migrations for schema changes. |
| **`/public`** | Static assets | e.g. `robots.txt`. |
| **Root** | Config and entry | `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`, `components.json` (shadcn). |

### What teammates should avoid changing (without review)
- **`src/integrations/supabase/client.ts`** — Generated-style entry point: URL/key, **`isSupabaseConfigured`**, **`noOpLock`** auth option; keep env names aligned with Vite.
- **`src/integrations/supabase/types.ts`** — Mirrors the database; regenerate from Supabase if schema changes.
- **`supabase/migrations/*.sql`** — Applied schema; add new migrations instead of editing old ones.
- **`src/contexts/AuthContext.tsx`** — Auth and admin-check logic; changes can affect security.
- **`src/App.tsx`** — Root providers and routing; small, targeted edits only.
- **`vite.config.ts`**, **`tsconfig.json`**, **`tailwind.config.ts`** — Build and tooling; change only when necessary.

### Safer to edit
- **`src/pages/*.tsx`** — Page layout and behavior (e.g. wording, layout, adding fields that already exist in DB).
- **`src/components/PageHeader.tsx`, `EmptyState.tsx`, `ResearchCard.tsx`, `SkeletonCard.tsx`, `NavLink.tsx`** — Project-specific components.
- **`src/components/layout/AppLayout.tsx`, `PublicLayout.tsx`, `AdminLayout.tsx`, `AppSidebar.tsx`** — Layout and navigation (e.g. adding a nav item).
- **`src/hooks/useArchiveData.ts`, `useDebounce.ts`** — When you need different data or behavior.
- **`src/index.css`** — Theme variables (colors, fonts); avoid removing Tailwind layers.
- **New components** under `src/components/` (not under `ui/` if you want to keep shadcn intact).

### Layout components (public vs admin)
- **`AppLayout`**: Chooses layout by path: **`AdminLayout`** only when `pathname.startsWith('/admin')`; everything else (including **`/dashboard`**, **`/submit`**, **`/login`**, **`/signup`**) uses **`PublicLayout`**.
- **`PublicLayout`**: Sticky navy header (logo + **Home, Admissions, Schedules, Archive, Templates, Contact**), main content, then **`Footer`** (quick links, services blurb, contact email placeholder, copyright).
- **`AdminLayout`**: **`SidebarProvider`**, **`AppSidebar`**, top bar with **`SidebarTrigger`**, main area for admin routes.
- **`AppSidebar`**: If **`isAdmin`**, shows links to `/admin` and each **`/admin/...`** tool; if **`isStudent`**, shows **Dashboard** and **Submit Application**. Footer has **Sign out** and email when `user` is set.

---

## 4. Core System Flow

### When a user opens the app
1. **Browser** loads the app (Vite dev server or built static files).
2. **React** mounts; **AuthProvider** runs, calls `supabase.auth.getSession()` and subscribes to `onAuthStateChange`.
3. **Session** (if any) is stored in state; **admin** flag is set by calling `has_role(userId, 'admin')` (RPC on `user_roles`).
4. **AppLayout** uses `PublicLayout` or `AdminLayout` as above (student tools stay on the public shell).
5. **Router** lazy-loads the page matching the URL (`Suspense` fallback uses **`SkeletonCard`** placeholders).

### When a user logs in
1. User submits **Login** → **`signIn`** → `signInWithPassword`.
2. Session is stored; **`checkRole`** runs: RPC **`has_role(..., 'admin')`** first, then **`has_role(..., 'student')`**, setting **`role`**, **`isAdmin`**, **`isStudent`**.
3. **`Login`** `useEffect`: if `user` and `role` exist, **navigate** — **`admin`** → `/admin`, **`student`** → `/dashboard`.
4. **Admin** routes: each page checks **`isAdmin`** and **`Navigate`s to `/login`** if false. **Student dashboard** allows **`isStudent || isAdmin`** (admins can open `/dashboard`).

### When a student signs up
1. **Sign up** form calls **`signUp(email, password)`** → `supabase.auth.signUp`.
2. Supabase creates **`auth.users`** row; trigger **`on_auth_user_created_assign_student`** inserts **`user_roles(user_id, 'student')`** (see migrations).
3. After success, app navigates to **`/dashboard`** (role resolves on next auth event).

### When a main feature is used (examples)
- **Home / Contact**: Inline or standalone contact → **`inquiries`** insert; Index queries use **`enabled: isSupabaseConfigured`**.
- **Submit application**: Authenticated **student** fills form → **`student_submissions`** insert with `user_id`; RLS ensures row ownership. Admin dashboard **updates `status`** (`pending` → `approved` / `rejected`).
- **Research Archive (public)**: **useArchiveData** + debounced search on **`research_archive`**.
- **Admin CRUD** (e.g. **AdminArchive**): **useQuery** lists rows; **useMutation** **insert/update/delete**; invalidate React Query keys on success.
- **Schedules / Templates** (public): **useQuery** on `schedules` / `templates`; links use **`file_url`**.

### Data flow (generic)
```
User action → React (event handler)
  → Optional: React Query (useQuery/useMutation)
    → supabase.from('table').select() / .insert() / .update() / .delete()
      → Supabase API → PostgreSQL (or Storage)
        → Response back to client
          → React state/React Query cache update → UI re-renders
```

---

## 5. Database Structure (Simplified)

All tables live in the **`public`** schema in Supabase (PostgreSQL).

| Table | What it stores | Important fields |
|-------|----------------|------------------|
| **user_roles** | App roles per Auth user | `user_id` → `auth.users.id`, **`app_role`**: **`admin` \| `user` \| `student`**. **Sign up** flow assigns **`student`** automatically (trigger). **`admin`** (and optional **`user`**) rows are added in Supabase for staff. |
| **student_submissions** | Student applications / proposals | `user_id`, `title`, `description`, `degree_type`, `department`, `abstract`, optional `file_url`, **`status`** (`pending` / `approved` / `rejected`), timestamps. RLS: users see/insert own rows; admins see/update all. |
| **research_archive** | Theses and research papers | `title`, `author`, `year`, `type` (master/phd/research), `department`, `abstract`, `file_url`, `created_at`, `updated_at`. |
| **inquiries** | Contact form submissions | `name`, `email`, `message`, `is_read`, `created_at`. |
| **schedules** | Academic schedules and plans | `title`, `category` (study / exams / research_plan), `file_url`, `description`, `date_info`, `created_at`. |
| **templates** | Downloadable documents | `title`, `description`, `file_url`, `file_size`, `category`, `created_at`. |
| **admissions** | Structured admissions content | `degree_type` (master/phd), `title`, `requirements` (JSONB), `documents` (JSONB), timestamps — editable from **`/admin/admissions`**. |

**Relationships (simple)**:
- **user_roles** and **student_submissions** reference **`auth.users`**. Content tables (`research_archive`, `inquiries`, …) are independent of each other aside from Auth.
- **Storage**: The `documents` bucket holds files; `file_url` in tables typically point to Supabase Storage URLs.

**Security**: RLS is enabled on these tables. **Public content** (archive, schedules, templates, admissions): typical pattern is world **read**, **admin** writes (see migrations for exact policies). **Inquiries**: public **insert**; **admin** read/update/delete. **`student_submissions`**: owner (or **admin**) access as described above. The **`has_role`** security-definer function backs admin checks in policies.

---

## 6. Authentication and Authorization

### Registration and login
- **Sign up** (`/signup`) calls **`signUp`** → **`auth.signUp`**. Email confirmation behavior depends on your **Supabase project settings** (confirm email on/off).
- **Login** uses **`signInWithPassword`**.
- **New users**: database trigger **`handle_new_user_student_role`** inserts **`user_roles (user_id, 'student')`** so **`has_role`** succeeds for students without manual seeding.
- **Admins**: create the Auth user in the Dashboard (or invite), then add **`user_roles`** with **`role = 'admin'`** (and remove or avoid conflicting expectations if you also rely on `student`).

### Sessions / tokens
- **localStorage** persistence, **`autoRefreshToken: true`**, custom **`lock: noOpLock`** to reduce multi-tab lock errors.
- JWT is sent on Supabase requests; RLS uses **`auth.uid()`** and **`has_role`**.

### Roles and permissions
- **`AuthContext`** resolves **`role`** with **`has_role`** for **`admin`** first, then **`student`**.
- **`isAdmin` / `isStudent`** drive **AppSidebar** sections and route guards.
- **Student dashboard** intentionally allows **`isAdmin`** so staff can verify the student UX.
- **RLS** on **`student_submissions`**: students **insert/select** own rows; admins **select/update** all (e.g. status). Other tables follow existing policies (public read where applicable, admin writes).

### What not to break
- Do not disable RLS or weaken **`has_role`** policies without review.
- Keep **`checkRole`** order (**admin** before **student**) if users can hold multiple role rows.
- Changing **`client.ts`** env handling (**`isSupabaseConfigured`**, missing-var console error) affects onboarding UX for new devs.

---

## 7. Environment Setup Guide

### Prerequisites
- **Node.js** (LTS, e.g. 18 or 20) and **npm** (the repo also has **`bun.lock`** if you use Bun, but docs assume **npm**).

### Step 1: Clone and install
```bash
git clone <repository-url>
cd postgrad-hub
npm install
```

### Step 2: Environment variables
**`src/integrations/supabase/client.ts`** reads:

| Variable | Purpose |
|----------|---------|
| **`VITE_SUPABASE_URL`** | Project URL (`https://xxxx.supabase.co`). |
| **`VITE_SUPABASE_PUBLISHABLE_KEY`** | Supabase **anon / publishable** key (JWT-shaped string). |

If either is missing, the client logs a **console error** and exports **`isSupabaseConfigured === false`** so pages like **Index** can show a setup **Alert** instead of failing silently.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Create **`.env`** in the project root; keep it out of Git.

### Step 3: Run locally
```bash
npm run dev
```
- **Dev server**: **`host: "::"`** (IPv6 dual-stack), **port `8080`**, **HMR overlay disabled** (`vite.config.ts`).
- Open **http://localhost:8080** (or your machine’s LAN IP on the same port when using `::`).

### Step 4: Database connection
- The app does **not** connect to the database directly; it goes through **Supabase**.
- As long as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` point to the correct Supabase project (where migrations have been applied), the app is "connected" to the right database and storage.

### Common setup mistakes
- **Wrong or missing .env**: Missing or wrong URL/key causes Supabase calls to fail. Check the Supabase project Dashboard → Settings → API.
- **.env committed**: Ensure `.env` is in `.gitignore` and never commit production keys.
- **Node/npm version**: Use a supported Node LTS and run `npm install` after clone.
- **Port 8080 in use**: Change `server.port` in `vite.config.ts` if needed.

---

## 8. How Teammates Should Work on This Project

### Safe development workflow
1. **Pull** latest from the main branch.
2. Create a **new branch** for your task (e.g. `feature/archive-search-improvement`).
3. **Run the app** with `npm run dev` and test your changes.
4. **Commit** small, logical changes with clear messages.
5. **Push** and open a **Pull Request** for review before merging.

### Adding a new feature
- **New page**: Add `src/pages/...`, **`lazy` import** + **`<Route>`** in **`App.tsx`**, and a link in **`PublicLayout`** (`publicNav`) and/or **`AppSidebar`** as needed.
- **New admin tool**: Add under **`src/pages/admin/`**, register **`/admin/...`** in **`App.tsx`**, add to **`adminNav`** in **`AppSidebar.tsx`**, protect with **`isAdmin`** + RLS.
- **New data from Supabase**: Add a **useQuery** or custom hook that uses `supabase.from('tableName')`; if the table or columns are new, update Supabase (migrations) and regenerate `src/integrations/supabase/types.ts` if you use type generation.
- **New UI only**: Add or reuse components under `src/components/` and use existing design tokens (Tailwind, CSS variables in `index.css`).

### Modifying the UI safely
- Prefer **existing** `src/components/ui` and layout components; change **content and layout** in page components rather than editing shadcn primitives.
- Use **Tailwind** and **CSS variables** (e.g. `text-primary`, `bg-card`) so themes stay consistent.
- Test on different screen sizes; the layout is responsive (e.g. sidebar, grids).

### Modifying backend logic safely
- **Backend** here means: Supabase (Auth, DB, Storage). Schema changes: add a **new migration** in `supabase/migrations/` and apply it in Supabase; then update types if needed.
- **RLS**: New tables or new access rules should be expressed in migrations with RLS policies; avoid removing existing policies.
- **Auth / admin**: Changes to who can do what should be done in RLS and in **AuthContext** together; get a review.

### Recommended Git workflow
- **main** (or **master**) = stable, deployable branch.
- Work on **feature/fix branches**; merge via Pull Request after review.
- Do not force-push to shared branches; do not rewrite history that others use.

### Code style and structure
- **TypeScript**: Use types for props and API data; use `src/integrations/supabase/types.ts` for DB shapes where applicable.
- **Components**: Functional components with hooks; keep components focused; put shared logic in hooks.
- **Naming**: PascalCase for components, camelCase for functions/variables, kebab-case for files if the team prefers (this repo uses PascalCase for component files).
- **Imports**: Use the `@/` alias for `src/` (e.g. `@/components/PageHeader`).

---

## 9. Testing and Debugging

### Manual testing
- **Public**: Home carousel and sections; **Contact** (home + `/contact`); **Archive** search/filters; **`/admissions`**, **`/schedules`**, **`/templates`**.
- **Student**: **Sign up** → **`/dashboard`**; **Submit Application** → pending row; RLS ensures students only receive their own rows from **`student_submissions`** even though the query is unfiltered in code.
- **Admin**: **`/admin`** stats + submission actions; smoke-test CRUD on **`/admin/archive`**, **`schedules`**, **`templates`**, **`admissions`**, **`inquiries`**.
- **Auth guards**: **`/admin`** as logged-out or student-only → redirect **Login**; **`/dashboard`** as logged-out → **Login**.

### Where to look when something breaks
- **Blank or wrong data**: Check Supabase (Dashboard → Table Editor, Logs). Confirm RLS policies and that the correct project is used (env vars).
- **Login fails**: Supabase Dashboard → Authentication; check user exists and password; check browser console for Supabase errors.
- **Admin panel not visible or redirects**: User needs **`user_roles.role = 'admin'`**. **Dashboard** requires **`student`** or **`admin`**.
- **Sign up works but dashboard redirects to login**: Wait for session/role refresh; confirm trigger **`on_auth_user_created_assign_student`** ran and **`has_role(..., 'student')`** is true in SQL.
- **Build errors**: Run `npm run build`; fix TypeScript or missing env vars (Vite inlines them at build time).

### Debugging tips
- **Browser DevTools**: Network tab for Supabase requests; Console for errors and `console.error` from **ErrorBoundary**.
- **React Query**: React Query DevTools (if added) can show cache and refetch; for now, use console and network.
- **ErrorBoundary**: Catches React rendering errors and shows "Something went wrong" and the error message; check console for full stack.

### Logging and errors
- **ErrorBoundary** logs caught errors with `console.error('ErrorBoundary caught:', error, info)`.
- **NotFound** logs 404s with `console.error('404 Error: User attempted to access non-existent route:', location.pathname)`.
- Supabase errors are returned from `supabase.from(...)` and `supabase.auth`; pages and hooks often throw or pass them to toast (e.g. Contact, Login). Check `error.message` in catch blocks.

---

## 10. Future Improvements and Scalability

### Possible improvements
- **Admissions public page**: Surface **`admissions`** table content on **`/admissions`** (beyond static copy) for a single source of truth with **`/admin/admissions`**.
- **File uploads**: **`student_submissions.file_url`** and admin forms could integrate **Supabase Storage** uploads instead of pasting URLs manually.
- **Email confirmation / password reset** flows and clearer post-signup messaging if the project requires verified emails.
- **Tests**: The repo has a minimal Vitest example; add unit tests for hooks and components and integration tests for critical flows.
- **Error and loading states**: Standardize toasts and error messages; consider a global error handler or more granular ErrorBoundaries.

### Scalability
- **Frontend**: Single Vite app; can be deployed as static files to any host (CDN). For very large lists (e.g. archive), consider pagination or virtual scrolling.
- **Backend**: Supabase scales with its plan; RLS and indexes (e.g. on `research_archive(year, type)`, `inquiries(created_at)`) help as data grows.
- **Storage**: File URLs in DB; ensure bucket policies and CDN/caching if traffic grows.

### Refactoring and performance
- **Data fetching**: React Query already centralizes server state; keep using it for new Supabase data.
- **Bundle size**: Routes are lazy-loaded in `App.tsx`; watch for large new dependencies.
- **Types**: Keep Supabase types in sync with the database (e.g. `supabase gen types`) when schema changes.

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Stack** | Vite 7, React 18, TypeScript, shadcn/ui, Tailwind, TanStack Query, framer-motion, Sonner + Radix toast, Supabase JS |
| **Data** | PostgreSQL + Storage; **`student_submissions`** and admin CRUD pages |
| **Auth** | Email/password; **`student`** auto on signup; **`admin`** via `user_roles`; **`has_role`** RPC |
| **Safe to edit** | Pages (including **`admin/`**), layout, **Footer**, hooks, project components |
| **Edit with care** | `client.ts` (env + auth lock), **AuthContext**, **types.ts**, migrations, **App.tsx** routes |

This documentation reflects the **current state** of the repository. If something is missing or unclear in the codebase, assumptions are stated in the sections above. For anything not covered, check the code in the paths referenced in this document.

---

## 11. Recent Changes (Changelog)

Use this section as a high-level diary for teammates. Details live in Git history.

### 2026 — Student accounts and submissions
- **`student_submissions`** table with RLS (own rows for students; full access for admins).
- **`app_role`** extended with **`student`**; trigger on **`auth.users`** assigns **`user_roles.student`** on signup.
- **`AuthContext`**: **`role`**, **`isStudent`**, **`signUp`**, sequential **`has_role`** checks (**admin** then **student**).
- **`/signup`**, **`/dashboard`**, **`/submit`**; **`Login`** redirects by role (**`/admin`** vs **`/dashboard`**).
- **Admin dashboard** (**`Admin.tsx`**): submission list with **approve/reject**, expanded stats (including admissions count).

### 2026 — Admin content management UI
- Routes: **`/admin/archive`**, **`/admin/schedules`**, **`/admin/templates`**, **`/admin/admissions`**, **`/admin/inquiries`** with list/table + dialog CRUD patterns (see **`AdminArchive.tsx`** as reference).
- **`AppSidebar`**: **`adminNav`** + **`studentNav`** sections driven by **`isAdmin`** / **`isStudent`**.

### 2026 — Home page and public UX
- **`Index.tsx`**: hero **carousel** (`public/hero/slide-*.jpg`), live previews for schedules/archive/templates/research, checklist cards, **inline contact** form.
- **`isSupabaseConfigured`** disables queries and shows setup **Alert** when env is incomplete; **retry** on load errors via **`getErrorMessage`**.
- **`Footer.tsx`**: institutional footer on **`PublicLayout`**.

### Tooling and Supabase client
- **`VITE_SUPABASE_PUBLISHABLE_KEY`** naming in **`client.ts`**; startup log when vars missing.
- **`isSupabaseConfigured`** export; auth **`lock`** no-op for multi-tab stability.
- **`getErrorMessage`** in **`lib/utils.ts`** for consistent user-facing errors.
- **Vite**: **`host: "::"`**, port **8080**, **HMR `overlay: false`**.

### Branding
- **`index.html`** title and meta (MUST Post Graduate / OG tags).
- **Theme**: Poppins + Open Sans, navy/gold tokens in **`index.css`** and **`tailwind.config.ts`**.

### Layout (recap)
- **`PublicLayout`**: grid header (`grid-cols-[1fr_auto_1fr]`), nav items, **`hidden sm:inline`** portal title, **`Footer`**.
- **`AppLayout`**: **`AdminLayout`** only for **`/admin/*`**; student routes use the **public** shell.
