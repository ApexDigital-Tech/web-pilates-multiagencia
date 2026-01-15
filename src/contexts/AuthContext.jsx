import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [configError, setConfigError] = useState(null)

    useEffect(() => {
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error;

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setLoading(false)
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
                // If it's a configuration error (e.g. invalid URL)
                if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('UPDATE_THIS')) {
                    setConfigError('Supabase no está configurado. Por favor, añade las variables de entorno en Vercel.')
                }
                setLoading(false)
            }
        }

        initSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }
            setProfile(data)
        } catch (error) {
            console.error('Profile fetch exception:', error)
        } finally {
            setLoading(false)
        }
    }

    const value = {
        session,
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'superadmin',
        isBranchManager: profile?.role === 'branch_manager'
    }

    if (configError) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff' }}>
                <h1 style={{ color: '#ef4444' }}>Error de Configuración</h1>
                <p>{configError}</p>
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'left', display: 'inline-block' }}>
                    <strong>Instrucciones:</strong>
                    <ol>
                        <li>Ve a tu proyecto en Vercel -> Settings -> Environment Variables</li>
                        <li>Añade <code>VITE_SUPABASE_URL</code></li>
                        <li>Añade <code>VITE_SUPABASE_ANON_KEY</code></li>
                        <li>Redespliega el proyecto.</li>
                    </ol>
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Cargando ZenithFlow...</div>
                </div>
            )}
        </AuthContext.Provider>
    )
}
