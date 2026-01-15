import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Comprobación rápida para evitar que se quede colgado si no hay config
            const url = import.meta.env.VITE_SUPABASE_URL;
            if (!url || url.includes('UPDATE_THIS') || url.includes('placeholder')) {
                throw new Error('Configuración de Supabase no detectada. Por favor, añade VITE_SUPABASE_URL en Vercel.');
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

            if (signInError) {
                setError(signInError.message)
            } else if (data) {
                navigate('/')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Error al intentar iniciar sesión. Revisa tu conexión.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7f6' }}>
            <form onSubmit={handleLogin} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' }}>ZenithFlow</h1>
                <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>Ingresa a tu cuenta de bienestar</p>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                        placeholder="tu@email.com"
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#000', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', marginBottom: '1.5rem' }}
                >
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
                    ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Regístrate aquí</Link>
                </p>
            </form>
        </div>
    )
}
