import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.warn(
    '[Vittkly] EXPO_PUBLIC_SUPABASE_URL no está configurado o no comienza con "https://". Revisa tu archivo .env / .env.local.',
  );
}

if (!supabaseAnonKey) {
  console.warn(
    '[Vittkly] EXPO_PUBLIC_SUPABASE_ANON_KEY está vacío. Revisa tu archivo .env / .env.local.',
  );
}

const resolvedUrl = supabaseUrl.startsWith('https://')
  ? supabaseUrl
  : 'https://placeholder.supabase.co';
const resolvedKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
