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
    const { profile, user } = useAuth();

    const handleLogout = async () => {
        console.log('Logging out...');
        try {
            // 1. Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // 2. Clear all local session data
            localStorage.clear();
            sessionStorage.clear();

            // 3. Force hard reload to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
            // Fallback for emergency
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

    // Safely get current role from profile
    const currentRole = profile?.role || 'client';

    // Sort and filter menu based on role permissions
    const filteredMenu = menuItems.filter(item => {
        if (!item.roles) return true;
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
                        <p className="user-role">
                            {currentRole === 'superadmin' ? 'Super Administrador' :
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fda4af',
                        transition: 'all 0.2s ease',
                        marginTop: '10px'
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontWeight: '600' }}>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
