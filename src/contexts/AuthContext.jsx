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
        let isMounted = true;

        const initSession = async () => {
            // Timeout de seguridad: Si en 5 segundos no conecta, soltamos la pantalla de carga
            const timeout = setTimeout(() => {
                if (isMounted && loading) {
                    console.warn('Auth timeout: Forzando fin de carga');
                    setLoading(false);
                }
            }, 5000);

            try {
                const { data, error } = await supabase.auth.getSession()

                if (error) throw error;

                if (isMounted) {
                    setSession(data.session)
                    setUser(data.session?.user ?? null)

                    if (data.session?.user) {
                        await fetchProfile(data.session.user.id)
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
                if (isMounted) {
                    const url = import.meta.env.VITE_SUPABASE_URL;
                    if (!url || url.includes('UPDATE_THIS') || url.includes('placeholder')) {
                        setConfigError('Las credenciales de Supabase no son válidas o faltan en Vercel.')
                    }
                }
            } finally {
                clearTimeout(timeout);
                if (isMounted) setLoading(false);
            }
        }

        initSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!isMounted) return;
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

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        }
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
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
                <h1 style={{ color: '#ef4444' }}>⚠️ Error de Conexión</h1>
                <p style={{ maxWidth: '500px', margin: '1rem auto', color: '#666' }}>{configError}</p>
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'left', display: 'inline-block', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#1e293b' }}>Pasos para solucionar:</strong>
                    <ol style={{ marginTop: '1rem', color: '#475569', lineHeight: '1.6' }}>
                        <li>Ve al Panel de Vercel - Settings - Environment Variables.</li>
                        <li>Asegúrate de que <b>VITE_SUPABASE_URL</b> sea correcta.</li>
                        <li>Asegúrate de que <b>VITE_SUPABASE_ANON_KEY</b> sea correcta.</li>
                        <li>Haz un nuevo <b>Redeploy</b> desde la pestaña Deployments.</li>
                    </ol>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div className="animate-pulse" style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500' }}>Iniciando ZenithFlow...</p>
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                `}</style>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
