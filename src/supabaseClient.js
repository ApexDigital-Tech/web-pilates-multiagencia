import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

const isConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('UPDATE_THIS') &&
    import.meta.env.VITE_SUPABASE_ANON_KEY

if (!isConfigured) {
    console.warn('Supabase credentials are missing or placeholders. Please update environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
