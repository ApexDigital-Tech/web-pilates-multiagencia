import { useState, useEffect, useCallback } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useZenithFlow } from '../hooks/useZenithFlow';

export default function Calendar() {
    const { profile, user } = useAuth();
    const { getSchedule, bookClass, loading: apiLoading } = useZenithFlow();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchMonthContent = useCallback(async () => {
        if (!profile?.location_id) return;

        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));

        const data = await getSchedule(profile.location_id, start, end);
        setClasses(data || []);
    }, [currentMonth, profile?.location_id, getSchedule]);

    useEffect(() => {
        fetchMonthContent();
    }, [fetchMonthContent]);

    const handleBooking = async (claseId) => {
        const { error } = await bookClass(claseId);
        if (error) {
            setMessage({ text: error, type: 'error' });
        } else {
            setMessage({ text: '¡Reserva confirmada con éxito!', type: 'success' });
            fetchMonthContent(); // Recargar datos
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl" style={{ textTransform: 'capitalize' }}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona las clases y reservas en {profile?.organizations?.name}</p>
                </div>

                {message.text && (
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: message.type === 'error' ? '#b91c1c' : '#15803d',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="flex gap-2">
                    <button className="card" style={{ padding: '0.5rem' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={20} />
                    </button>
                    <button className="card" style={{ padding: '0.5rem' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem' }}>
                {days.map((day, i) => (
                    <div key={i} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let daysArr = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayClasses = classes.filter(c => isSameDay(new Date(c.start_time), cloneDay));
                const isSelected = isSameDay(day, selectedDate);

                daysArr.push(
                    <div
                        key={day.toString()}
                        onClick={() => setSelectedDate(cloneDay)}
                        style={{
                            padding: '1.25rem 0.5rem',
                            textAlign: 'center',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary)' : 'white',
                            color: isSelected ? 'white' : 'inherit',
                            opacity: !isSameMonth(day, monthStart) ? 0.3 : 1,
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                    >
                        <span style={{ fontWeight: '600' }}>{format(day, 'd')}</span>
                        {dayClasses.length > 0 && (
                            <div style={{
                                width: '6px', height: '6px', borderRadius: '50%', margin: '4px auto 0',
                                background: isSelected ? 'white' : 'var(--accent)'
                            }}></div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {daysArr}
                </div>
            );
            daysArr = [];
        }
        return <div>{rows}</div>;
    };

    const renderSelectedDayClasses = () => {
        const dayClasses = classes.filter(c => isSameDay(new Date(c.start_time), selectedDate));

        return (
            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Clases para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h2>

                {apiLoading ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando clases...</p>
                ) : dayClasses.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay clases programadas.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {dayClasses.map((clase) => {
                            const isFull = clase.bookings?.length >= clase.capacity;
                            const isBooked = clase.bookings?.some(b => b.user_id === user?.id);

                            return (
                                <div key={clase.id} className="card" style={{ background: '#fafafa', border: '1px solid var(--border)' }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 style={{ fontWeight: '700' }}>{clase.activity_type}</h3>
                                            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                                                <Clock size={14} />
                                                {format(new Date(clase.start_time), 'HH:mm')}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            background: isBooked ? '#dcfce7' : isFull ? '#fee2e2' : '#e0e7ff',
                                            color: isBooked ? '#166534' : isFull ? '#991b1b' : '#3730a3'
                                        }}>
                                            {isBooked ? 'Agendado' : isFull ? 'Lleno' : 'Disponible'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center" style={{ fontSize: '0.875rem' }}>
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>{clase.instructor?.full_name || 'Sin instructor'}</span>
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{clase.bookings?.length || 0}/{clase.capacity}</span>
                                    </div>

                                    {!isBooked && (
                                        <button
                                            onClick={() => handleBooking(clase.id)}
                                            disabled={isFull || apiLoading}
                                            style={{
                                                width: '100%', marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px', border: 'none',
                                                background: isFull ? '#f1f5f9' : 'var(--primary)',
                                                color: isFull ? 'var(--text-muted)' : 'white',
                                                fontWeight: '600', cursor: isFull ? 'not-allowed' : 'pointer',
                                                transition: 'opacity 0.2s'
                                            }}
                                        >
                                            {isFull ? 'Sin Cupos' : 'Reservar Lugar'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="calendar-container">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {renderSelectedDayClasses()}
        </div>
    );
}
