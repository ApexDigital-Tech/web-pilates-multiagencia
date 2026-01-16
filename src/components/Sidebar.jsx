import {
    LayoutDashboard,
    Calendar,
    Users,
    CreditCard,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

export default function Sidebar() {
    const { profile, user, loading } = useAuth();

    const handleLogout = async () => {
        console.log('[Sidebar] Initiating logout...');
        try {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            // Force a hard jump to login to kill any local state
            window.location.href = '/login';
        } catch (error) {
            console.error('[Sidebar] Logout error:', error);
            window.location.href = '/login';
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
        { name: 'Calendario', icon: Calendar, path: '/calendar', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
        { name: 'Clientes', icon: Users, path: '/clients', roles: ['superadmin', 'branch_manager'] },
        { name: 'Planes', icon: CreditCard, path: '/plans', roles: ['superadmin'] },
        { name: 'Sedes', icon: MapPin, path: '/locations', roles: ['superadmin'] },
        { name: 'Ajustes', icon: Settings, path: '/settings', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
    ];

    // DETERMINAR ROL REAL
    // Importante: Si 'loading' es true o no hay profile, no podemos confiar en el rol aun.
    const currentRole = profile?.role;

    const filteredMenu = menuItems.filter(item => {
        if (!currentRole) return item.roles.includes('client'); // Default safe view
        return item.roles.includes(currentRole);
    });

    return (
        <aside className="sidebar">
            <Link to="/" className="sidebar-logo">
                <div className="logo-icon">ZF</div>
                <span className="logo-text">ZenithFlow</span>
            </Link>

            <nav className="sidebar-nav">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                        <ChevronRight className="chevron" size={14} />
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" />
                        ) : (
                            <UserCircle size={32} strokeWidth={1} />
                        )}
                    </div>
                    <div className="user-info">
                        <p className="user-name">{profile?.full_name || user?.email?.split('@')[0] || 'Cargando...'}</p>
                        <p className="user-role" style={{ color: currentRole === 'superadmin' ? '#6366f1' : 'inherit', fontWeight: currentRole === 'superadmin' ? 'bold' : 'normal' }}>
                            {!currentRole ? 'Identificando...' :
                                currentRole === 'superadmin' ? 'Super Administrador' :
                                    currentRole === 'branch_manager' ? 'Gerente de Sede' :
                                        currentRole === 'instructor' ? 'Instructor' : 'Cliente'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="logout-btn"
                    type="button"
                    style={{
                        cursor: 'pointer',
                        width: '100%',
                        background: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fda4af',
                        padding: '12px',
                        borderRadius: '10px',
                        marginTop: '10px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
