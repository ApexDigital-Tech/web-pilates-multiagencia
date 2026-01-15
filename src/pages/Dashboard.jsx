import {
    Users,
    Calendar,
    TrendingUp,
    Plus,
    MoreHorizontal,
    Clock,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { profile } = useAuth();

    const stats = [
        { label: 'Clientes Activos', value: '124', icon: Users, color: '#6366f1', bg: '#e0e7ff' },
        { label: 'Clases Hoy', value: '8', icon: Calendar, color: '#10b981', bg: '#dcfce7' },
        { label: 'Ingresos Mes', value: '$4,250', icon: TrendingUp, color: '#f59e0b', bg: '#fef3c7' },
    ];

    const recentBookings = [
        { id: 1, client: 'Ana García', activity: 'Reformer Pilates', time: '10:00 AM', status: 'Confirmado' },
        { id: 2, client: 'Carlos López', activity: 'Mat Pilates', time: '11:30 AM', status: 'Confirmado' },
        { id: 3, client: 'Marta Pérez', activity: 'Yoga Flow', time: '04:00 PM', status: 'Pendiente' },
    ];

    return (
        <div className="dashboard-content">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl">Panel de Control</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Bienvenido de nuevo, {profile?.full_name?.split(' ')[0]}</p>
                </div>

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
                        Nueva Sede
                    </button>
                )}
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Próximas Clases */}
                <div className="card">
                    <div className="flex justify-between items-center mb-8">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Próximas Reservas</h2>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="bookings-list">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="booking-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem 0',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem'
                                }}>
                                    <Clock size={18} color="var(--text-muted)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{booking.client}</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{booking.activity}</p>
                                </div>
                                <div style={{ textAlign: 'right', marginRight: '2rem' }}>
                                    <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{booking.time}</p>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        background: booking.status === 'Confirmado' ? '#dcfce7' : '#fef3c7',
                                        color: booking.status === 'Confirmado' ? '#166534' : '#92400e'
                                    }}>{booking.status}</span>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Card / Quick Glance */}
                <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Sede Actual</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Rendimiento</p>
                            <p style={{ fontWeight: '600' }}>+12% este mes</p>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '0.5rem' }}>Capacidad Promedio</p>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '75%', height: '100%', background: 'white' }}></div>
                        </div>
                        <p style={{ fontSize: '0.875rem', textAlign: 'right', marginTop: '0.5rem' }}>75%</p>
                    </div>

                    <button style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Ver Reporte Detallado
                    </button>
                </div>
            </div>
        </div>
    );
}
