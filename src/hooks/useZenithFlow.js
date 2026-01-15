import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useZenithFlow = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch classes for a specific date range and location
    const getSchedule = useCallback(async (locationId, startDate, endDate) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('schedule')
                .select(`
                    *,
                    instructor:instructor_id(full_name, avatar_url),
                    bookings(id, user_id, status)
                `)
                .eq('location_id', locationId)
                .gte('start_time', startDate.toISOString())
                .lte('start_time', endDate.toISOString());

            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Book a class
    const bookClass = async (scheduleId) => {
        if (!user) return { error: 'Debes iniciar sesión' };

        setLoading(true);
        try {
            // Check if already booked
            const { data: existing } = await supabase
                .from('bookings')
                .select('id')
                .eq('schedule_id', scheduleId)
                .eq('user_id', user.id)
                .single();

            if (existing) throw new Error('Ya tienes una reserva para esta clase');

            const { data, error } = await supabase
                .from('bookings')
                .insert([
                    { user_id: user.id, schedule_id: scheduleId, status: 'confirmed' }
                ])
                .select();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getSchedule,
        bookClass
    };
};
