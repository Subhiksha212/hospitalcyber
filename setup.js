// backend/setup.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ==================== CONFIGURATION ====================
// CHANGE THESE TO YOUR ACTUAL LOGIN CREDENTIALS
const YOUR_EMAIL = 'subhiksha278@gmail.com';
const YOUR_PASSWORD = 'yourpassword'; // <-- CHANGE THIS TO YOUR PASSWORD
const YOUR_NAME = 'Subhiksha';
// ======================================================

console.log('\n🔧 SECUREMED SETUP SCRIPT');
console.log('='.repeat(50));

// Create data directory
const dataDir = path.join(__dirname, 'src/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
}

const USERS_FILE = path.join(dataDir, 'users.json');

// Default users
const defaultUsers = [
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

let users = [];

// Check if users file exists
if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(`📂 Loaded ${users.length} existing users`);
} else {
    users = [...defaultUsers];
    console.log('📂 Created default users');
}

// Check if your user exists
const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === YOUR_EMAIL.toLowerCase());

if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
        ...users[existingUserIndex],
        name: YOUR_NAME,
        password: YOUR_PASSWORD,
        isVerified: true
    };
    console.log(`✅ Updated existing user: ${YOUR_EMAIL}`);
} else {
    // Add new user
    const newUser = {
        id: uuidv4(),
        name: YOUR_NAME,
        email: YOUR_EMAIL,
        password: YOUR_PASSWORD,
        role: 'patient',
        isVerified: true,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    console.log(`✅ Added new user: ${YOUR_EMAIL}`);
}

// Save to file
fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
console.log(`💾 Saved ${users.length} users to database`);

console.log('\n📋 Current users in database:');
users.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
});

console.log('\n✨ SETUP COMPLETE!');
console.log('='.repeat(50));
console.log('\n🔐 You can now login with:');
console.log(`   Email: ${YOUR_EMAIL}`);
console.log(`   Password: ${YOUR_PASSWORD}`);
console.log(`   Role: patient\n`);