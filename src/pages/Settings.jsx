import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Save, User as UserIcon, Building } from 'lucide-react';

export default function Settings() {
    const { profile, user } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(profile?.location_id || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const { data, error } = await supabase
            .from('locations')
            .select('*, organizations(name)');

        if (!error) setLocations(data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Obtener el ID de la organización basado en la sede seleccionada
            const location = locations.find(l => l.id === selectedLocation);

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    location_id: selectedLocation,
                    organization_id: location?.organization_id
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ text: 'Perfil actualizado con éxito. Refresca para ver los cambios.', type: 'success' });
        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <header className="mb-8">
                <h1 className="text-2xl">Configuración de Perfil</h1>
                <p style={{ color: 'var(--text-muted)' }}>Personaliza tu experiencia en ZenithFlow</p>
            </header>

            <div className="card">
                <form onSubmit={handleSave}>
                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                            color: message.type === 'error' ? '#b91c1c' : '#15803d',
                            fontWeight: '600'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="flex items-center gap-2 mb-2" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                            <UserIcon size={16} /> Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="card"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="flex items-center gap-2 mb-2" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                            <Building size={16} /> Selecciona tu Sede
                        </label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="card"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'white' }}
                        >
                            <option value="">-- Elige una sede --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.organizations.name} - {loc.name}
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <MapPin size={12} style={{ verticalAlign: 'middle' }} /> Esto determinará qué calendario de clases verás.
                        </p>
                    </div>

                    <button
                        disabled={loading}
                        className="flex items-center justify-center gap-2"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        <Save size={18} />
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
