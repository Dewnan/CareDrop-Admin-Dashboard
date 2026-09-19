import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Creates an authenticated Supabase client using the Firebase ID Token
 * @param firebaseToken Firebase Auth ID token (JWT)
 */
export const getSupabaseClient = (firebaseToken?: string | null): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: firebaseToken
        ? { Authorization: `Bearer ${firebaseToken}` }
        : {},
    },
  });
};

// Export default unauthenticated instance for initial render
export const supabase = getSupabaseClient();
