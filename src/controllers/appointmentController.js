// backend/src/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-availability');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = appointments.map(apt => apt.appointmentTime);
    
    const allTimeSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
    ];
    
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));
    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      doctorId: req.body.doctorId,
      doctorName: req.body.doctorName,
      doctorSpecialty: req.body.doctorSpecialty,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      reason: req.body.reason
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({ error: 'Failed to create appointment' });
  }
};

// Get user appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get upcoming appointments
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointments = await Appointment.find({
      patientId: req.user.id,
      appointmentDate: { $gte: today },
      status: 'scheduled'
    }).sort({ appointmentDate: 1 }).limit(5);
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(400).json({ error: 'Failed to cancel appointment' });
  }
};