import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [configError, setConfigError] = useState(null)

    const fetchProfile = async (userId) => {
        console.log('[Auth] Fetching profile for ID:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('[Auth] Profile fetch error:', error.message);
                return null;
            }
            return data;
        } catch (error) {
            console.error('[Auth] Profile exception:', error);
            return null;
        }
    }

    useEffect(() => {
        let isMounted = true;

        if (!isSupabaseConfigured) {
            setConfigError('Configuración de Supabase no detectada.')
            setLoading(false)
            return;
        }

        // EMERGENCIA: Timeout de seguridad. Si en 10 segundos no ha cargado, forzamos el fin del loading.
        const emergencyTimeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('[Auth] Emergency timeout reached. Forcing loading to false.');
                setLoading(false);
            }
        }, 10000);

        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()

                if (isMounted) {
                    setSession(currentSession)
                    setUser(currentSession?.user ?? null)

                    if (currentSession?.user) {
                        const profileData = await fetchProfile(currentSession.user.id)
                        setProfile(profileData)
                    }
                }
            } catch (err) {
                console.error('[Auth] Init error:', err)
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(emergencyTimeout);
                }
            }
        }

        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                if (!isMounted) return;

                setSession(currentSession)
                setUser(currentSession?.user ?? null)

                if (currentSession?.user) {
                    const profileData = await fetchProfile(currentSession.user.id)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(emergencyTimeout);
        }
    }, [])

    const value = {
        session,
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'superadmin',
        isBranchManager: profile?.role === 'branch_manager'
    }

    if (configError) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h1>Error de Configuración</h1></div>
    }

    // Usamos un render condicional simple
    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#64748b', fontWeight: '500' }}>Cargando ZenithFlow...</p>
                        <button
                            onClick={() => setLoading(false)}
                            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                        >
                            ¿Tardando mucho? Haz clic aquí para forzar entrada
                        </button>
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : children}
        </AuthContext.Provider>
    )
}
