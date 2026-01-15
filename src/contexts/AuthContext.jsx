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
        console.log('Fetching profile for:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, organizations(*)')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Profile fetch error:', error);
                // Si el error es que no existe el perfil, podemos crear uno básico o dejarlo como null
                if (error.code === 'PGRST116') {
                    console.warn('No hay perfil en DB para este usuario.');
                }
                return null;
            }

            console.log('Profile loaded successfully:', data);
            return data;
        } catch (error) {
            console.error('Profile fetch exception:', error);
            return null;
        }
    }

    useEffect(() => {
        let isMounted = true;

        if (!isSupabaseConfigured) {
            setConfigError('Configuración de Supabase incompleta en Vercel.')
            setLoading(false)
            return;
        }

        const initialize = async () => {
            try {
                // 1. Get initial session
                const { data: { session: initialSession }, error } = await supabase.auth.getSession()
                if (error) throw error;

                if (isMounted) {
                    setSession(initialSession)
                    setUser(initialSession?.user ?? null)

                    if (initialSession?.user) {
                        const profileData = await fetchProfile(initialSession.user.id)
                        setProfile(profileData)
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        initialize()

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('Auth event:', event);

                if (isMounted) {
                    setSession(currentSession)
                    setUser(currentSession?.user ?? null)

                    if (currentSession?.user) {
                        const profileData = await fetchProfile(currentSession.user.id)
                        setProfile(profileData)
                    } else {
                        setProfile(null)
                    }

                    // Aseguramos que el estado de carga termine en cualquier cambio de auth
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

    if (configError) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h1>⚠️ Error de Configuración</h1>
                <p>{configError}</p>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Cargando ZenithFlow...</p>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AuthContext.Provider>
    )
}
