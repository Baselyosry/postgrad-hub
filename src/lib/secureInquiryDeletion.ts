import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Permanently deletes an inquiry row so name, email, phone, subject, and message are no longer stored.
 * Use this for TA-requested erasure of contact records (no soft-delete table).
 */
export async function secureDeleteInquiryRecord(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("inquiries").delete().eq("id", id);
  if (error) throw error;
}
