// =====================================================================
// Supabase Client Initialization & Dynamic Connectivity Engine
// =====================================================================

import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://arwqafuudyvvqqiktvop.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_tJ73CcH6LZbIouXSCfrxPw_63cfsEao';

const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (trimmed.startsWith('sb_publishable_') || trimmed.startsWith('sb_secret_') || trimmed.includes('your-project.supabase.co')) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const isValidAnonKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length > 15 && trimmed !== 'your-anon-key' && trimmed !== 'your-anon-key-here' && !trimmed.startsWith('sb_secret_');
};

// Retrieve configured Supabase URL (from localStorage runtime config, build env, or production project default)
export const getActiveSupabaseUrl = () => {
  const custom = typeof localStorage !== 'undefined' ? localStorage.getItem('noc_supabase_url') : null;
  if (custom) {
    if (isValidHttpUrl(custom)) return custom.trim();
    // If user previously saved a publishable key in URL field, remove bad entry
    if (typeof localStorage !== 'undefined') localStorage.removeItem('noc_supabase_url');
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && isValidHttpUrl(envUrl)) return envUrl.trim();
  return DEFAULT_SUPABASE_URL;
};

// Retrieve configured Supabase Anon Key (from localStorage runtime config, build env, or production project default)
export const getActiveSupabaseAnonKey = () => {
  const custom = typeof localStorage !== 'undefined' ? localStorage.getItem('noc_supabase_anon_key') : null;
  if (custom && isValidAnonKey(custom)) return custom.trim();
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && isValidAnonKey(envKey)) return envKey.trim();
  return DEFAULT_SUPABASE_ANON_KEY;
};

let activeClient = null;

const createSupabaseInstance = (url, key) => {
  if (!isValidHttpUrl(url) || !isValidAnonKey(key)) {
    return null;
  }
  try {
    return createClient(url, key, {
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
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};

// Initialize default client
const initialUrl = getActiveSupabaseUrl();
const initialKey = getActiveSupabaseAnonKey();
activeClient = createSupabaseInstance(initialUrl, initialKey);

export let supabase = activeClient;
export let isSupabaseConfigured = Boolean(activeClient && initialUrl && initialKey);

// Update runtime Supabase config and recreate client
export const setRuntimeSupabaseConfig = (url, key) => {
  const cleanUrl = url ? url.trim() : '';
  const cleanKey = key ? key.trim() : '';

  if (cleanUrl) {
    localStorage.setItem('noc_supabase_url', cleanUrl);
  } else {
    localStorage.removeItem('noc_supabase_url');
  }

  if (cleanKey) {
    localStorage.setItem('noc_supabase_anon_key', cleanKey);
  } else {
    localStorage.removeItem('noc_supabase_anon_key');
  }

  activeClient = createSupabaseInstance(getActiveSupabaseUrl(), getActiveSupabaseAnonKey());
  supabase = activeClient;
  isSupabaseConfigured = Boolean(activeClient);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('noc_supabase_config_changed', {
      detail: { client: activeClient, url: cleanUrl, isConfigured: isSupabaseConfigured }
    }));
  }

  return isSupabaseConfigured;
};

// Test connection to Supabase project
export const testSupabaseConnection = async (testUrl, testKey) => {
  const targetUrl = testUrl ? testUrl.trim() : getActiveSupabaseUrl();
  const targetKey = testKey ? testKey.trim() : getActiveSupabaseAnonKey();

  if (!isValidHttpUrl(targetUrl)) {
    return { ok: false, message: 'Invalid Supabase Project URL. Must start with https:// (e.g. https://xyz.supabase.co)' };
  }

  if (!isValidAnonKey(targetKey)) {
    return { ok: false, message: 'Invalid Supabase Anon Key. Must be a valid project anon public key.' };
  }

  try {
    const tempClient = createClient(targetUrl, targetKey);
    const { data, error } = await tempClient.from('organizations').select('count', { count: 'exact', head: true });
    
    if (error) {
      return { 
        ok: false, 
        message: `Supabase returned an error: ${error.message} (Code: ${error.code || 'UNKNOWN'}). Verify database migrations and RLS policies.` 
      };
    }

    return { 
      ok: true, 
      message: 'Successfully connected to Supabase database! Organizations table verified.' 
    };
  } catch (err) {
    return { 
      ok: false, 
      message: `Connection failed: ${err.message || 'Network error connecting to Supabase.'}` 
    };
  }
};
