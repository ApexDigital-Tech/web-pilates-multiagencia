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
        try {
            // Clear all local storage just in case
            localStorage.clear();
            sessionStorage.clear();
            await supabase.auth.signOut();
            // Force a hard redirect to the login page to clear all React states
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            // Fallback redirect
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

    // Get current role safely, default to 'client' for UX
    const currentRole = profile?.role || 'client';
    const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

    return (
        <aside className="sidebar">
            <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                        <p className="user-name">{profile?.full_name || 'Usuario'}</p>
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
                    style={{ cursor: 'pointer', zIndex: 100 }}
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
