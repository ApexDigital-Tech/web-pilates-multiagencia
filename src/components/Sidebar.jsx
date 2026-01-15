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
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

export default function Sidebar() {
    const { profile, user } = useAuth();

    const handleLogout = () => supabase.auth.signOut();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
        { name: 'Calendario', icon: Calendar, path: '/calendar', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
        { name: 'Clientes', icon: Users, path: '/clients', roles: ['superadmin', 'branch_manager'] },
        { name: 'Planes', icon: CreditCard, path: '/plans', roles: ['superadmin'] },
        { name: 'Sedes', icon: MapPin, path: '/locations', roles: ['superadmin'] },
        { name: 'Ajustes', icon: Settings, path: '/settings', roles: ['superadmin', 'branch_manager', 'instructor', 'client'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role));

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">ZF</div>
                <span className="logo-text">ZenithFlow</span>
            </div>

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
                        <p className="user-name">{profile?.full_name || user?.email?.split('@')[0]}</p>
                        <p className="user-role">{profile?.role}</p>
                    </div>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
