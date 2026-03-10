// backend/src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// Mock doctors data
const doctors = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    email: 'sarah.chen@hospital.com',
    color: 'emerald',
    image_code: 'SC',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTimeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
    experience: 15,
    rating: 4.8,
    status: 'available',
    currentPatients: 3,
    maxPatients: 8
  },
  {
    id: '2',
    name: 'Dr. Michael Rodriguez',
    specialty: 'Internal Medicine',
    email: 'michael.rodriguez@hospital.com',
    color: 'blue',
    image_code: 'MR',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableTimeSlots: ['9:30 AM', '10:30 AM', '11:30 AM', '1:00 PM', '2:30 PM', '3:30 PM'],
    experience: 12,
    rating: 4.6,
    status: 'available',
    currentPatients: 5,
    maxPatients: 8
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    specialty: 'Dermatology',
    email: 'emily.watson@hospital.com',
    color: 'purple',
    image_code: 'EW',
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    availableTimeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:30 PM', '4:30 PM'],
    experience: 8,
    rating: 4.9,
    status: 'available',
    currentPatients: 2,
    maxPatients: 6
  },
  {
    id: '4',
    name: 'Dr. James Kim',
    specialty: 'Family Medicine',
    email: 'james.kim@hospital.com',
    color: 'amber',
    image_code: 'JK',
    availableDays: ['Wednesday', 'Friday', 'Saturday'],
    availableTimeSlots: ['8:30 AM', '9:30 AM', '10:30 AM', '1:30 PM', '3:00 PM', '4:00 PM'],
    experience: 20,
    rating: 4.9,
    status: 'available',
    currentPatients: 4,
    maxPatients: 8
  }
];

// In-memory storage for appointments
let appointments = [];

// ==================== PUBLIC ENDPOINTS ====================

// Get all doctors
router.get('/doctors', (req, res) => {
  console.log('📋 Fetching doctors list');
  res.json(doctors);
});

// Get available time slots
router.get('/available-slots', (req, res) => {
  try {
    const { doctorId, date } = req.query;
    console.log(`🕐 Fetching available slots for doctor ${doctorId} on ${date}`);

    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const bookedAppointments = appointments.filter(apt => 
      apt.doctorId === doctorId && 
      apt.appointmentDate === date && 
      apt.status === 'scheduled'
    );

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
    const availableSlots = doctor.availableTimeSlots.filter(
      slot => !bookedTimes.includes(slot)
    );

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// ==================== PATIENT ENDPOINTS ====================

// Create new appointment
router.post('/', authMiddleware, (req, res) => {
  try {
    console.log('📝 Creating new appointment:', req.body);
    
    const { 
      doctorId, 
      doctorName, 
      doctorSpecialty, 
      appointmentDate, 
      appointmentTime, 
      reason,
      symptoms 
    } = req.body;

    if (!doctorId || !doctorName || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['doctorId', 'doctorName', 'appointmentDate', 'appointmentTime', 'reason']
      });
    }

    // Check if slot is available
    const existingAppointment = appointments.find(apt => 
      apt.doctorId === doctorId && 
      apt.appointmentDate === appointmentDate && 
      apt.appointmentTime === appointmentTime &&
      apt.status === 'scheduled'
    );

    if (existingAppointment) {
      return res.status(409).json({ 
        error: 'This time slot is no longer available',
        message: 'Please choose another time'
      });
    }

    // Determine urgency
    const urgency = determineUrgency(symptoms || [], reason);

    const newAppointment = {
      id: uuidv4(),
      patientId: req.user.id,
      patientName: req.user.name || 'Patient',
      patientEmail: req.user.email,
      doctorId,
      doctorName,
      doctorSpecialty,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms: symptoms || [],
      urgency,
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    
    console.log('✅ New appointment booked:', newAppointment.id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: newAppointment
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get my appointments
router.get('/my-appointments', authMiddleware, (req, res) => {
  try {
    const userAppointments = appointments.filter(
      apt => apt.patientId === req.user.id
    ).sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    
    res.json({
      success: true,
      data: userAppointments,
      count: userAppointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get upcoming appointments
router.get('/upcoming', authMiddleware, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const userAppointments = appointments.filter(apt => {
      return apt.patientId === req.user.id && 
             apt.appointmentDate >= today && 
             apt.status === 'scheduled';
    }).sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
    
    res.json({
      success: true,
      data: userAppointments,
      count: userAppointments.length
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointments[appointmentIndex].patientId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointments[appointmentIndex]
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Helper function
function determineUrgency(symptoms, reason) {
  const criticalKeywords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'difficulty breathing'];
  const highKeywords = ['severe pain', 'high fever', 'broken bone', 'fracture', 'head injury', 'burn'];
  const mediumKeywords = ['moderate pain', 'infection', 'rash', 'cough', 'cold', 'fever', 'headache'];
  
  const text = (symptoms.join(' ') + ' ' + reason).toLowerCase();
  
  if (criticalKeywords.some(keyword => text.includes(keyword))) {
    return 'critical';
  }
  if (highKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  return 'low';
}

module.exports = router;