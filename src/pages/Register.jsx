import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            if (!url || url.includes('UPDATE_THIS') || url.includes('placeholder')) {
                throw new Error('Configuración de Supabase no detectada.');
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (signUpError) {
                setError(signUpError.message)
            } else {
                setSuccess(true)
                if (data?.session) {
                    navigate('/')
                }
            }
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message || 'Error al intentar registrarse.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7f6' }}>
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        ✓
                    </div>
                    <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>¡Registro Exitoso!</h1>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Hemos enviado un enlace de confirmación a tu correo. Por favor revísalo para activar tu cuenta.</p>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Volver al Inicio de Sesión</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f7f6' }}>
            <form onSubmit={handleRegister} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' }}>Crear Cuenta</h1>
                <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>Únete a ZenithFlow y gestiona tu bienestar</p>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Nombre Completo</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                        placeholder="Ej. Ana García"
                    />
                </div>

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
                        minLength={6}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#000', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', marginBottom: '1.5rem' }}
                >
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión</Link>
                </p>
            </form>
        </div>
    )
}
