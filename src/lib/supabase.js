import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your-supabase-url-here') {
  console.warn(
    '⚠️  VITE_SUPABASE_URL is not configured.\n' +
    '   Copy .env.example to .env and add your Supabase project URL.\n' +
    '   Get it from: https://app.supabase.com → Project Settings → API'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key-here') {
  console.warn(
    '⚠️  VITE_SUPABASE_ANON_KEY is not configured.\n' +
    '   Copy .env.example to .env and add your Supabase anon key.\n' +
    '   Get it from: https://app.supabase.com → Project Settings → API'
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default supabase;
