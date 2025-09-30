import { createClient } from "@supabase/supabase-js";

// read envs
const supabaseUrl: string = process.env.SUPABASE_URL ?? "";
const supabaseKey: string = process.env.SUPABASE_ANON_KEY ?? "";

// create client only if both exist
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ Supabase URL or Key is missing. Some features may not work.");
}

export default supabase;
