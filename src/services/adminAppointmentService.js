// src/services/adminAppointmentService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

class AdminAppointmentService {
  // Get all appointments (admin only)
  async getAllAppointments() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get pending appointments
  async getPendingAppointments() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/appointments/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get all doctors
  async getAllDoctors() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Assign doctor to appointment
  async assignDoctor(appointmentId, doctorId, appointmentDate, appointmentTime) {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_URL}/admin/appointments/${appointmentId}/assign`,
      { doctorId, appointmentDate, appointmentTime },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Get appointment statistics
  async getAppointmentStats() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/admin/appointments/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export default new AdminAppointmentService();