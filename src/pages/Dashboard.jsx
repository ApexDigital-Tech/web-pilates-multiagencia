import {
    Users,
    Calendar as CalendarIcon,
    TrendingUp,
    Plus,
    MoreHorizontal,
    Clock,
    ArrowRight,
    Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    // En producción estos vendrían de una query agregada de Supabase
    const stats = [
        { label: 'Clientes Activos', value: '12', icon: Users, color: '#6366f1', bg: '#e0e7ff' },
        { label: 'Clases Hoy', value: '3', icon: CalendarIcon, color: '#10b981', bg: '#dcfce7' },
        { label: 'Ocupación', value: '85%', icon: Activity, color: '#f59e0b', bg: '#fef3c7' },
    ];

    return (
        <div className="dashboard-content animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl">
                        {profile?.role === 'superadmin' ? 'Admin Global' : 'Panel de Sede'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Bienvenido a {profile?.organizations?.name || 'ZenithFlow'}, {profile?.full_name?.split(' ')[0]}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/calendar')}
                        className="flex items-center gap-2"
                        style={{
                            background: 'white',
                            color: 'var(--primary)',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Ver Calendario
                    </button>

                    {profile?.role === 'superadmin' && (
                        <button className="flex items-center gap-2" style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            <Plus size={18} />
                            Añadir Recurso
                        </button>
                    )}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-info">
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                {/* Próximas Clases */}
                <div className="card">
                    <div className="flex justify-between items-center mb-8">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Actividad de hoy</h2>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="bookings-list">
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                            <p>No hay actividad registrada para hoy.</p>
                            <button
                                onClick={() => navigate('/calendar')}
                                style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: '600', marginTop: '0.5rem', cursor: 'pointer' }}>
                                Ir al calendario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Branding Profile Card */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #333 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.5rem' }}>
                            <Activity size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            {profile?.organizations?.name || 'Franquicia Zenith'}
                        </h2>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                            Estás gestionando la sede: <br />
                            <strong>{profile?.location_id ? 'Sede Central' : 'Acceso Global'}</strong>
                        </p>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                            <span>Plan Enterprise</span>
                            <span>80% Uso</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <div style={{ width: '80%', height: '100%', background: 'white', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
