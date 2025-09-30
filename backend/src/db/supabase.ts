import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL || "";
const supabaseKey: string | undefined = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Key in environment variables.");
}

// Initialize and export the client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export function logSupabaseStatus() {
    console.log('Supabase client initialized and ready.');
}