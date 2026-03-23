# Postgraduate Studies Management Portal — Project Documentation

This document describes the **Postgraduate Hub** (postgrad-hub) project so that teammates can understand what it does, how it works, and how to work on it safely.

---

## 1. Project Overview

### Project name
**Postgraduate Studies Management Portal** (internally: `vite_react_shadcn_ts` in `package.json`)

### Purpose
A single web application that acts as the main hub for a postgraduate studies department. It centralizes academic resources, schedules, research archives, and contact with the administration.

### Core idea
- **Public users** (students, researchers, visitors) can browse admissions info, schedules, templates, research archive, and submit contact inquiries—no login required.
- **Admins** sign in and use an Admin Panel to view inquiries and see counts for archive, schedules, and templates. Content (archive, schedules, templates, etc.) is managed via the **Supabase backend** (database and storage); the app mainly reads and displays that data.

### Target users
- **Visitors / students**: Anyone who needs admissions info, schedules, templates, or the research archive.
- **Department staff / admins**: People who need to view inquiries and manage portal content (via Supabase or future admin UI).

### Main features (simple explanation)
| Feature | What it does |
|--------|----------------|
| **Home** | Landing page with links to Admissions, Schedules, Templates, Research Archive, Contact. |
| **Admissions** | Shows Masters and PhD requirements and document checklists (currently **static** content in the code; database table exists for future use). |
| **Schedules** | Lists study plans, exam schedules, and research plans from the database, with optional file links. |
| **Templates** | Lists downloadable document templates (PDFs, etc.) from the database. |
| **Research Archive** | Searchable and filterable list of theses and research papers (title, author, year, type, department, abstract, file link). |
| **Contact** | Form to submit an inquiry (name, email, message); stored in the database; admins see them in the Admin Panel. |
| **Admin Panel** | Login-only dashboard: stats (inquiries, archive/schedules/templates counts) and recent inquiries list. |
| **Login** | Email/password sign-in for admins; redirects to Admin Panel. |
| **SignUp** | Student registration flow. |
| **Student Dashboard** | Post-login dashboard for students. |
| **Submit Application** | Application submission flow. |

---

## 2. High-Level Architecture

### In simple terms
- **Frontend**: A single-page app built with **React**, **TypeScript**, and **Vite**. The UI uses **shadcn/ui** (Radix-based components) and **Tailwind CSS**. There is **no separate backend server** in this repo; the backend is **Supabase** (hosted).
- **Backend**: **Supabase** provides authentication, PostgreSQL database, and file storage. The app talks to Supabase from the browser via the Supabase JavaScript client.
- **Database**: **PostgreSQL** (Supabase). Tables: `user_roles`, `research_archive`, `inquiries`, `schedules`, `templates`, `admissions`.
- **Communication**: Browser → Supabase client (`@/integrations/supabase/client`) → Supabase API (HTTPS) → Database/Storage/Auth. No custom REST API in the repo.
- **Authentication**: Supabase Auth (email/password). Session is stored in **localStorage** and refreshed automatically. Admin role is determined by a `user_roles` table and a `has_role` RPC.
- **Data storage**: Structured data in Supabase **PostgreSQL**; files (e.g. PDFs) in Supabase **Storage** bucket `documents`. File URLs in tables point to those stored files.

### Architecture diagram (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React + TypeScript)                            │
│  • Pages: Index, Admissions, Schedules, Templates, Archive,     │
│    Contact, Login, SignUp, Admin, StudentDashboard, Submit,     │
│    NotFound                                                       │
│  • AuthContext (session, user, isAdmin, signIn, signOut)         │
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
| **`/src/pages`** | One component per main screen | `Index.tsx`, `Admissions.tsx`, `Schedules.tsx`, `Templates.tsx`, `ArchivePage.tsx`, `Contact.tsx`, `Login.tsx`, `SignUp.tsx`, `Admin.tsx`, `StudentDashboard.tsx`, `SubmitApplication.tsx`, `NotFound.tsx`. |
| **`/src/components`** | Reusable UI and layout | `PageHeader.tsx`, `NavLink.tsx`, `EmptyState.tsx`, `ResearchCard.tsx`, `SkeletonCard.tsx`, `ErrorBoundary.tsx`, plus `layout/` (`AppLayout.tsx`, `PublicLayout.tsx`, `AdminLayout.tsx`, `AppSidebar.tsx`) and `ui/` (shadcn components: button, card, input, etc.). |
| **`/src/components/ui`** | shadcn/ui primitives | Many small components (button, card, input, dialog, tabs, etc.). **Prefer not modifying** unless you need a local override; use composition in your own components instead. |
| **`/src/contexts`** | React context providers | `AuthContext.tsx` — provides `session`, `user`, `isAdmin`, `loading`, `signIn`, `signOut`. |
| **`/src/hooks`** | Custom React hooks | `useArchiveData.ts` (archive list with search/type filter), `useDebounce.ts`, `use-mobile.tsx`, `use-toast.ts` (and `use-toast.ts` in components/ui). |
| **`/src/integrations/supabase`** | Supabase connection and types | `client.ts` (single Supabase client instance), `types.ts` (generated DB types). **Do not edit** `client.ts` logic carelessly; `types.ts` is often auto-generated. |
| **`/src/lib`** | Shared utilities | `utils.ts` (e.g. `cn()` for class names). |
| **`/supabase`** | Supabase config and schema | `config.toml` (project id), `migrations/` (SQL that creates tables, RLS, storage). **Critical**: avoid changing migrations that are already applied; add new migrations for schema changes. |
| **`/public`** | Static assets | e.g. `robots.txt`. |
| **Root** | Config and entry | `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`, `components.json` (shadcn). |

### What teammates should avoid changing (without review)
- **`src/integrations/supabase/client.ts`** — Central Supabase setup; env vars must stay correct.
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
- **`AppLayout`**: Route switcher—uses `PublicLayout` for all routes except `/admin/*`; uses `AdminLayout` for admin routes.
- **`PublicLayout`**: Public header with logo, nav (Home, Admissions, Schedules, Archive, Templates, Contact). Header uses a centered three-column grid: logo left, nav center, spacer right. Logo text "MUST · Postgraduate Portal" is hidden on small screens (`sm:inline`).
- **`AdminLayout`**: Admin-specific layout with sidebar (if applicable).

---

## 4. Core System Flow

### When a user opens the app
1. **Browser** loads the app (Vite dev server or built static files).
2. **React** mounts; **AuthProvider** runs, calls `supabase.auth.getSession()` and subscribes to `onAuthStateChange`.
3. **Session** (if any) is stored in state; **admin** flag is set by calling `has_role(userId, 'admin')` (RPC on `user_roles`).
4. **AppLayout** chooses layout by route: `PublicLayout` for public pages (header with logo + nav), `AdminLayout` for `/admin/*`. For admin routes, sidebar shows "Admin Login" or "Sign Out" and optional "Admin Panel" based on `user` and `isAdmin`.
5. **Router** shows the page for the current URL (e.g. `/` → Index, `/archive` → ArchivePage).

### When a user logs in (admin)
1. User goes to **Login** page, enters email and password, submits.
2. **Login** calls `signIn(email, password)` from **AuthContext**.
3. **AuthContext** calls `supabase.auth.signInWithPassword({ email, password })`.
4. Supabase validates credentials and returns a **session** (stored in localStorage by the client).
5. **onAuthStateChange** fires; context updates `session`, `user`, and calls `has_role(userId, 'admin')` to set `isAdmin`.
6. **Login** page shows success toast and **navigates to `/admin`**.
7. **Admin** page only renders if `isAdmin` is true; otherwise it redirects to **`/login`**.

### When a main feature is used (examples)
- **Contact form**: User fills name, email, message → form validated with **Zod** → **React Query mutation** calls `supabase.from('inquiries').insert([...])` → success toast and form reset. Data is in `inquiries`; admins see it in Admin.
- **Research Archive**: User types in search or changes type filter → **useArchiveData** (with debounced search) runs a **Supabase** query on `research_archive` (optional filters) → results shown as **ResearchCard** list.
- **Schedules / Templates**: Page loads → **useQuery** fetches from `schedules` or `templates` → table or cards rendered; file links point to Supabase Storage or `file_url`.

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
| **user_roles** | Links a user (Supabase Auth) to an app role | `user_id` (→ `auth.users.id`), `role` (`admin` or `user`). One row per user-role pair. |
| **research_archive** | Theses and research papers | `title`, `author`, `year`, `type` (master/phd/research), `department`, `abstract`, `file_url`, `created_at`, `updated_at`. |
| **inquiries** | Contact form submissions | `name`, `email`, `message`, `is_read`, `created_at`. |
| **schedules** | Academic schedules and plans | `title`, `category` (study / exams / research_plan), `file_url`, `description`, `date_info`, `created_at`. |
| **templates** | Downloadable documents | `title`, `description`, `file_url`, `file_size`, `category`, `created_at`. |
| **admissions** | Admissions content (for future use) | `degree_type` (master/phd), `title`, `requirements` (JSONB), `documents` (JSONB), `created_at`, `updated_at`. |

**Relationships (simple)**:
- **user_roles** references **auth.users** (Supabase built-in). No other tables reference each other in the schema; they are independent content tables.
- **Storage**: The `documents` bucket holds files; `file_url` in tables typically point to Supabase Storage URLs.

**Security**: Row Level Security (RLS) is enabled on all these tables. For example: everyone can **read** archive, schedules, templates, admissions; only **authenticated users with admin role** can insert/update/delete. Inquiries: anyone can insert; only admins can read/update/delete. The `has_role(_user_id, _role)` function (security definer) is used in RLS policies.

---

## 6. Authentication and Authorization

### How login works
- **Login** is email + password via Supabase Auth (`signInWithPassword`).
- There is **no registration flow in the app**. Admin users are created in Supabase (Dashboard or API); then an admin must insert a row into **user_roles** with `role = 'admin'` for that user to see the Admin Panel.

### Sessions / tokens
- Supabase stores the **session** (including JWT) in **localStorage** (see `client.ts`: `storage: localStorage`, `persistSession: true`, `autoRefreshToken: true`).
- The client automatically sends the JWT with requests to Supabase; Supabase validates it and RLS uses `auth.uid()` to restrict rows.

### Roles and permissions
- **Roles** are in **user_roles** (`admin`, `user`).
- **Admin check** in the app: `AuthContext` calls `supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })` and sets `isAdmin`.
- **Admin-only UI**: Admin page and Admin Panel link in sidebar are shown only when `isAdmin` is true; Admin page redirects to `/login` if not admin.
- **Backend enforcement**: All write operations and sensitive reads are enforced by **RLS** in the database using `has_role(auth.uid(), 'admin')`. So even if someone tampers with the frontend, the database still restricts access.

### What not to break
- Do not disable RLS or loosen policies without a security review.
- Do not remove or bypass the `has_role` check in **AuthContext** or in RLS.
- Keep **client.ts** auth options (storage, persistSession, autoRefreshToken) unless you have a good reason to change them.

---

## 7. Environment Setup Guide

### Prerequisites
- **Node.js** (LTS, e.g. 18 or 20) and **npm**.

### Step 1: Clone and install
```bash
git clone <repository-url>
cd postgrad-hub
npm install
```

### Step 2: Environment variables
The app expects these **Vite** env vars (used in `src/integrations/supabase/client.ts`):

- **`VITE_SUPABASE_URL`** — Supabase project URL (e.g. `https://xxxx.supabase.co`).
- **`VITE_SUPABASE_PUBLISHABLE_KEY`** — Supabase anonymous/public key (starts with `eyJ...`).

Create a **`.env`** file in the project root (do not commit real keys to Git):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Optional: **`VITE_SUPABASE_PROJECT_ID`** may appear in the repo for tooling; the running app only needs the two above.

### Step 3: Run locally
```bash
npm run dev
```
- App runs at **http://localhost:8080** (see `vite.config.ts`).
- Changing code triggers hot reload.

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
- **New page**: Add a component in `src/pages/`, add a **Route** in `App.tsx`, and add a link in `AppSidebar.tsx` if it should appear in the nav.
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
- **Critical paths**: Open home → Admissions, Schedules, Templates, Archive, Contact; submit contact form; log in as admin → open Admin Panel, see inquiries and counts.
- **Auth**: Log in with an admin user; log out; open Admin while logged out (should redirect to Login).
- **Archive**: Use search and type filter; check loading and empty states.

### Where to look when something breaks
- **Blank or wrong data**: Check Supabase (Dashboard → Table Editor, Logs). Confirm RLS policies and that the correct project is used (env vars).
- **Login fails**: Supabase Dashboard → Authentication; check user exists and password; check browser console for Supabase errors.
- **Admin panel not visible or redirects**: Ensure the user has a row in **user_roles** with `role = 'admin'`.
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
- **Admissions page**: Currently uses hardcoded content; could be driven by the **admissions** table and an admin UI to edit requirements/documents.
- **Admin content management**: Add admin UI to create/edit/delete archive entries, schedules, templates (and optionally admissions), instead of editing only in Supabase Dashboard.
- **Registration**: If the department wants self-service accounts, add a registration flow and optionally tie it to **user_roles**.
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
| **Stack** | Vite, React, TypeScript, shadcn/ui, Tailwind, Supabase (Auth + PostgreSQL + Storage) |
| **Data** | PostgreSQL tables + Storage bucket; frontend reads/writes via Supabase client |
| **Auth** | Supabase email/password; admin = row in `user_roles` with role `admin` |
| **Safe to edit** | Pages, project-specific components, hooks, layout, styles |
| **Edit with care** | Supabase client/types, AuthContext, migrations, App routing and config |

This documentation reflects the **current state** of the repository. If something is missing or unclear in the codebase, assumptions are stated in the sections above. For anything not covered, check the code in the paths referenced in this document.

---

## 11. Recent Changes (Changelog)

### Public layout header (PublicLayout.tsx)
- **Header layout**: Switched from centered flex column/row to a three-column grid (`grid-cols-[1fr_auto_1fr]`)—logo left, nav centered, spacer right.
- **Responsive logo text**: "MUST · Postgraduate Portal" is now hidden on small screens (`hidden sm:inline`) so only the logo image shows on mobile.
- **Accessibility**: Added `aria-hidden` spacer div for symmetry on larger screens.

### Pages and routes
- **SignUp** (`/signup`), **StudentDashboard** (`/dashboard`), **SubmitApplication** (`/submit`) added to routing and documentation.
- **Layout split**: `AppLayout` uses `PublicLayout` for public routes and `AdminLayout` for `/admin/*`.
