// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Mock data
let appointments = [
  {
    id: 'apt_1',
    patientId: 'p1',
    patientName: 'John Doe',
    patientEmail: 'john.doe@email.com',
    patientPhone: '+1 234 567 890',
    doctorId: 'doc_1',
    doctorName: 'Dr. Sarah Chen',
    doctorSpecialty: 'Cardiology',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    reason: 'Severe headache and dizziness',
    symptoms: ['headache', 'dizziness', 'nausea'],
    urgency: 'high',
    status: 'scheduled',
    bookedAt: new Date().toISOString()
  },
  {
    id: 'apt_2',
    patientId: 'p2',
    patientName: 'Jane Smith',
    patientEmail: 'jane.smith@email.com',
    patientPhone: '+1 987 654 321',
    doctorId: 'doc_3',
    doctorName: 'Dr. Emily Watson',
    doctorSpecialty: 'Dermatology',
    appointmentDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    appointmentTime: '2:30 PM',
    reason: 'Skin rash',
    symptoms: ['rash', 'itching'],
    urgency: 'medium',
    status: 'scheduled',
    bookedAt: new Date().toISOString()
  }
];

let doctors = [
  {
    id: 'doc_1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    email: 'sarah.chen@hospital.com',
    status: 'available',
    currentPatients: 3,
    maxPatients: 8,
    availableTimeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM']
  },
  {
    id: 'doc_2',
    name: 'Dr. Michael Rodriguez',
    specialty: 'Internal Medicine',
    email: 'michael.rodriguez@hospital.com',
    status: 'busy',
    currentPatients: 6,
    maxPatients: 8,
    availableTimeSlots: ['9:30 AM', '2:30 PM']
  },
  {
    id: 'doc_3',
    name: 'Dr. Emily Watson',
    specialty: 'Dermatology',
    email: 'emily.watson@hospital.com',
    status: 'available',
    currentPatients: 2,
    maxPatients: 6,
    availableTimeSlots: ['9:00 AM', '11:00 AM', '2:00 PM']
  }
];

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all appointments
router.get('/appointments', (req, res) => {
  try {
    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch appointments' 
    });
  }
});

// Get pending appointments
router.get('/appointments/pending', (req, res) => {
  try {
    const pending = appointments.filter(apt => apt.status === 'scheduled');
    res.json({
      success: true,
      data: pending,
      count: pending.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending appointments' 
    });
  }
});

// Get all doctors
router.get('/doctors', (req, res) => {
  try {
    res.json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch doctors' 
    });
  }
});

// Get appointment statistics
router.get('/appointments/stats', (req, res) => {
  try {
    const stats = {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
      availableDoctors: doctors.filter(d => d.status === 'available').length,
      totalDoctors: doctors.length,
      urgentCases: appointments.filter(a => a.urgency === 'critical' || a.urgency === 'high').length,
      byUrgency: {
        critical: appointments.filter(a => a.urgency === 'critical').length,
        high: appointments.filter(a => a.urgency === 'high').length,
        medium: appointments.filter(a => a.urgency === 'medium').length,
        low: appointments.filter(a => a.urgency === 'low').length
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    });
  }
});

// Assign doctor to appointment
router.patch('/appointments/:id/assign', (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doctor not found' 
      });
    }
    
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      appointmentDate,
      appointmentTime,
      status: 'allocated',
      allocatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Doctor assigned successfully',
      data: appointments[appointmentIndex]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to assign doctor' 
    });
  }
});

module.exports = router;