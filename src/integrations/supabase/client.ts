import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vjlafhcqlkgxhvfsdsce.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbGFmaGNxbGtneGh2ZnNkc2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDU4MDYsImV4cCI6MjA5MzEyMTgwNn0.14CIrJnUYK9pts6VHLhsLAypi9X9Q4b8DkVRv_5qN_M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
