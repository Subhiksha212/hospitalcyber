// backend/src/scripts/addUser.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Your user details - CHANGE THESE TO YOUR ACTUAL PASSWORD
const MY_EMAIL = 'subhiksha278@gmail.com';
const MY_PASSWORD = 'yourpassword'; // <-- CHANGE THIS TO YOUR ACTUAL PASSWORD
const MY_NAME = 'Subhiksha';

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Read existing users or create new array
let users = [];
if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(`📂 Found ${users.length} existing users`);
} else {
    // Create default users if file doesn't exist
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
    console.log('📂 Created default users');
}

// Check if your user already exists
const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === MY_EMAIL.toLowerCase());

if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
        ...users[existingUserIndex],
        name: MY_NAME,
        password: MY_PASSWORD,
        isVerified: true
    };
    console.log(`✅ Updated existing user: ${MY_EMAIL}`);
} else {
    // Add new user
    const newUser = {
        id: uuidv4(),
        name: MY_NAME,
        email: MY_EMAIL,
        password: MY_PASSWORD,
        role: 'patient',
        isVerified: true,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    console.log(`✅ Added new user: ${MY_EMAIL}`);
}

// Save back to file
fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
console.log(`💾 Saved ${users.length} users to file`);

// Display all users (without passwords)
console.log('\n📋 Current users:');
users.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
});

console.log('\n✨ Done! You can now login with:');
console.log(`   Email: ${MY_EMAIL}`);
console.log(`   Password: ${MY_PASSWORD}`);