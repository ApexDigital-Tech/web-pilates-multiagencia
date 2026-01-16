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
                console.error('[Auth] Profile fetch error:', error.message, error.code);
                return null;
            }

            console.log('[Auth] Profile fetched successfully. Role:', data?.role);
            return data;
        } catch (error) {
            console.error('[Auth] Profile exception:', error);
            return null;
        }
    }

    useEffect(() => {
        let isMounted = true;

        if (!isSupabaseConfigured) {
            setConfigError('Credenciales de Supabase no validas en este entorno.')
            setLoading(false)
            return;
        }

        const initializeAuth = async () => {
            console.log('[Auth] Initializing session...');
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()
                if (error) throw error;

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
                    console.log('[Auth] Init finished. Loading -> false');
                    setLoading(false);
                }
            }
        }

        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('[Auth] State change event:', event);

                if (isMounted) {
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
            }
        )

        return () => {
            isMounted = false;
            subscription.unsubscribe();
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

    // Pantalla de error de configuración (solo si las llaves de Vercel estan mal)
    if (configError) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>⚠️ Error Crítico</h1>
                <p>{configError}</p>
                <p style={{ marginTop: '1rem', color: '#666' }}>Revisa las variables de entorno en Vercel.</p>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Cargando datos de sesión...</p>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AuthContext.Provider>
    )
}
