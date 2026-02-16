import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("UYARI: Supabase anahtarları bulunamadı. Oyun demo modunda veya hatalı çalışabilir.");
}

export const supabase = createClient(
  supabaseUrl || 'https://whlefhukybfeasdntmiz.supabase.co',
  supabaseAnonKey || 'sb_publishable_CBnOmjtdMC0EzjoCcHrPIw_mUWPz8xI'
);