import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Función para validar si es una URL real
const isValidUrl = (url) => {
    try {
        return url && url.startsWith('http');
    } catch {
        return false;
    }
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder-project.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Exportamos una bandera para que otros componentes sepan si la config es real
export const isSupabaseConfigured = isValidUrl(rawUrl) && !!rawKey && !rawUrl.includes('UPDATE_THIS');
