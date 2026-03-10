// backend/add-user.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ===== CONFIGURE THESE =====
const YOUR_EMAIL = 'subhiksha278@gmail.com';
const YOUR_PASSWORD = 'yourpassword'; // CHANGE THIS TO YOUR ACTUAL PASSWORD
const YOUR_NAME = 'Subhiksha';
// ===========================

const USERS_FILE = path.join(__dirname, 'src/data/users.json');

// Ensure directory exists
const dataDir = path.join(__dirname, 'src/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Hash the password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function addUser() {
    try {
        // Load existing users
        let users = [];
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            users = JSON.parse(data);
            console.log(`📂 Loaded ${users.length} existing users`);
        }

        // Hash the password
        const hashedPassword = await hashPassword(YOUR_PASSWORD);
        console.log('🔐 Password hashed successfully');

        // Check if your user exists
        const existingIndex = users.findIndex(u => u.email.toLowerCase() === YOUR_EMAIL.toLowerCase());

        if (existingIndex >= 0) {
            // Update existing user with hashed password
            users[existingIndex] = {
                ...users[existingIndex],
                name: YOUR_NAME,
                password: hashedPassword,
                isVerified: true
            };
            console.log(`✅ Updated existing user: ${YOUR_EMAIL}`);
        } else {
            // Add new user
            users.push({
                id: uuidv4(),
                name: YOUR_NAME,
                email: YOUR_EMAIL,
                password: hashedPassword,
                role: 'patient',
                isVerified: true,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Added new user: ${YOUR_EMAIL}`);
        }

        // Save to file
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        console.log(`💾 Saved ${users.length} users to database`);

        console.log('\n📋 Current users:');
        users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

        console.log('\n✨ DONE!');
        console.log(`You can now login with:`);
        console.log(`   Email: ${YOUR_EMAIL}`);
        console.log(`   Password: ${YOUR_PASSWORD}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addUser();