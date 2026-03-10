// backend/src/services/appointmentService.js
const supabase = require('../config/supabase');

class AppointmentService {
    // Get all doctors
    async getDoctors() {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get doctors error:', error);
            throw error;
        }
    }

    // Get available time slots for a doctor
    async getAvailableSlots(doctorId, date) {
        try {
            // Get doctor's availability
            const { data: doctor, error: doctorError } = await supabase
                .from('doctors')
                .select('available_time_slots')
                .eq('id', doctorId)
                .single();

            if (doctorError) throw doctorError;

            // Get booked appointments for this date
            const { data: booked, error: bookedError } = await supabase
                .from('appointments')
                .select('appointment_time')
                .eq('doctor_id', doctorId)
                .eq('appointment_date', date)
                .neq('status', 'cancelled');

            if (bookedError) throw bookedError;

            const bookedTimes = booked.map(b => b.appointment_time);
            const availableSlots = doctor.available_time_slots.filter(
                slot => !bookedTimes.includes(slot)
            );

            return availableSlots;
        } catch (error) {
            console.error('Get available slots error:', error);
            throw error;
        }
    }

    // Create new appointment
    async createAppointment(appointmentData, userId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: userId,
                    doctor_id: appointmentData.doctorId,
                    doctor_name: appointmentData.doctorName,
                    doctor_specialty: appointmentData.doctorSpecialty,
                    appointment_date: appointmentData.appointmentDate,
                    appointment_time: appointmentData.appointmentTime,
                    reason: appointmentData.reason,
                    symptoms: appointmentData.symptoms || [],
                    urgency: appointmentData.urgency || 'low',
                    status: 'scheduled',
                    booked_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Create appointment error:', error);
            throw error;
        }
    }

    // Get user's appointments
    async getUserAppointments(userId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', userId)
                .order('appointment_date', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get user appointments error:', error);
            throw error;
        }
    }

    // Get upcoming appointments
    async getUpcomingAppointments(userId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', userId)
                .eq('status', 'scheduled')
                .gte('appointment_date', today)
                .order('appointment_date', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get upcoming appointments error:', error);
            throw error;
        }
    }

    // Cancel appointment
    async cancelAppointment(appointmentId, userId) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId)
                .eq('patient_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Cancel appointment error:', error);
            throw error;
        }
    }

    // Get all appointments (admin)
    async getAllAppointments() {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*, users(name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get all appointments error:', error);
            throw error;
        }
    }

    // Get appointment statistics (admin)
    async getAppointmentStats() {
        try {
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('status, urgency');

            if (error) throw error;

            const stats = {
                total: appointments.length,
                scheduled: appointments.filter(a => a.status === 'scheduled').length,
                completed: appointments.filter(a => a.status === 'completed').length,
                cancelled: appointments.filter(a => a.status === 'cancelled').length,
                critical: appointments.filter(a => a.urgency === 'critical').length,
                high: appointments.filter(a => a.urgency === 'high').length,
                medium: appointments.filter(a => a.urgency === 'medium').length,
                low: appointments.filter(a => a.urgency === 'low').length
            };

            return stats;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }
}

module.exports = new AppointmentService();