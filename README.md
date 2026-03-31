# Postgraduate Hub

A postgraduate studies management portal for the MUST department. Students and visitors can browse admissions, schedules, templates, research archive, and submit inquiries. Admins have access to a dashboard and inquiry management.

For full technical documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

## Local development

Prerequisites: **Node.js** (LTS, e.g. 18 or 20) and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <YOUR_GIT_URL>
cd postgrad-hub
npm install
npm run dev
```

The dev server defaults to **http://localhost:8080** (see `vite.config.ts`).

Configure a **`.env`** in the project root with your Supabase credentials (see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) § Environment Setup).

## Other ways to edit

- **GitHub**: Edit files in the web UI and commit.
- **GitHub Codespaces**: Open the repository → **Code** → **Codespaces** → create a new codespace.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)

## Build and preview

```sh
npm run build    # output in dist/
npm run preview  # serve production build locally
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3 + CDN, etc.). Set the same `VITE_*` environment variables your host supports for the build step.
