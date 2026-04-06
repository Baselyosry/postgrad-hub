import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract a readable message from Supabase/React Query errors */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("Failed to fetch")) {
      return "Could not reach Supabase. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env, that your Supabase project is active, then restart the dev server.";
    }
    return msg;
  }
  if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (typeof err === "string") return err;
  console.error("[Supabase] Unhandled error shape:", err);
  return "Unable to connect to the database. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env and restart the dev server.";
}

/** Resolve app-relative paths (e.g. /staff/photo.png) for Vite `public/` and optional `base` URL. */
export function resolvePublicMediaUrl(href: string | null | undefined): string | undefined {
  if (href == null || href === "") return undefined;
  if (/^https?:\/\//i.test(href) || href.startsWith("data:") || href.startsWith("blob:")) return href;
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const path = href.startsWith("/") ? href.slice(1) : href;
  return `${normalizedBase}${path}`;
}
