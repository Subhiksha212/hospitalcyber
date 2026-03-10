// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// File path for persistent storage
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
// This should already be in your authController.js
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: name || email.split('@')[0],
      email: email,
      password: hashedPassword,
      role: 'patient',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: 'patient',
        name: newUser.name
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'patient',
        isVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};// Load users from file or initialize with defaults
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(`✅ Loaded ${users.length} users from file`);
  } else {
    // Initialize with default users
    users = [
      {
        id: 'admin123',
        name: 'Admin User',
        email: 'admin@securemed.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'patient123',
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'patient123',
        role: 'patient',
        isVerified: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    // Save to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('✅ Created default users file');
  }
} catch (error) {
  console.error('Error loading users:', error);
  users = [];
}

// Save users to file
const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('✅ Users saved to file');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const passwordOk = await verifyPassword(req.body.password, user.password);
    if (!passwordOk) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', email, 'Role:', user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// ==================== PATIENT REGISTRATION ====================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: name || email.split('@')[0],
      email: email,
      password: password,
      role: 'patient',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    console.log('✅ New patient created:', newUser.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: 'patient',
        name: newUser.name
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'patient',
        isVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// ==================== ADMIN REGISTRATION ====================
exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, adminCode } = req.body;

    console.log('📝 Admin registration attempt:', { fullName, email });

    // Validate admin code
    if (adminCode !== 'ADMIN2024') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid admin registration code' 
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Create new admin user
    const newUser = {
      id: uuidv4(),
      name: fullName,
      email: email,
      password: password,
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();

    console.log('✅ New admin created:', newUser.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: 'admin',
        name: newUser.name
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'admin',
        isVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Admin registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// ==================== GET CURRENT USER ====================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = users.map(({ password, ...user }) => user);
    res.json({
      success: true,
      data: allUsers,
      count: allUsers.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

const verifyPassword = async (inputPassword, storedPassword) => {
  const input = String(inputPassword ?? '');
  const stored = String(storedPassword ?? '');

  const isBcrypt =
    stored.startsWith('$2a$') ||
    stored.startsWith('$2b$') ||
    stored.startsWith('$2y$');

  if (isBcrypt) return bcrypt.compare(input, stored);

  // legacy/plain fallback
  return input === stored;
};