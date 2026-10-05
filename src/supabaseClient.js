// =====================================================================
// Supabase Client Initialization & Connectivity Helper
// =====================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  isValidHttpUrl(supabaseUrl) &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl.startsWith('sb_publishable_')
);

let client = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    client = null;
  }
}

export const supabase = client;
