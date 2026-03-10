// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Validation rules
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const registerValidation = [
    body('name')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

// ==================== EMAIL CHECK ENDPOINT ====================
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Read users from file
        const usersFile = path.join(__dirname, '../data/users.json');
        
        let exists = false;
        
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf8');
            const users = JSON.parse(data);
            exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        }

        res.json({ exists });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== SEND VERIFICATION EMAIL ====================
router.post('/send-verification', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        // In production, you would send an actual email here
        console.log(`📧 Verification email sent to ${email} with code: ${code}`);
        
        // You can integrate with a real email service like SendGrid, NodeMailer, etc.
        
        res.json({ success: true, message: 'Verification code sent' });
    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;