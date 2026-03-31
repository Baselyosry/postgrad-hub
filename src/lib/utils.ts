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
