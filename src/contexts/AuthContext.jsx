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

    useEffect(() => {
        let isMounted = true;

        if (!isSupabaseConfigured) {
            setConfigError('Las credenciales de Supabase no están configuradas correctamente en Vercel (VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY faltan o son inválidas).')
            setLoading(false)
            return;
        }

        const initSession = async () => {
            const timeout = setTimeout(() => {
                if (isMounted && loading) {
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
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Error de Configuración</h1>
                <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#666', lineHeight: '1.5' }}>{configError}</p>
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'left', display: 'inline-block', border: '1px solid #e2e8f0', margin: '0 auto' }}>
                    <strong style={{ color: '#1e293b' }}>Cómo solucionarlo en Vercel:</strong>
                    <ol style={{ marginTop: '1rem', color: '#475569', lineHeight: '1.8' }}>
                        <li>Ve a tu proyecto en <b>Vercel</b>.</li>
                        <li>Entra en <b>Settings</b> - <b>Environment Variables</b>.</li>
                        <li>Añade <b>VITE_SUPABASE_URL</b> (Ej: <i>https://abc.supabase.co</i>).</li>
                        <li>Añade <b>VITE_SUPABASE_ANON_KEY</b> (Tu llave larga).</li>
                        <li>Ve a <b>Deployments</b> y haz un <b>Redeploy</b> del último commit.</li>
                    </ol>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500' }}>Iniciando ZenithFlow...</p>
                </div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
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
