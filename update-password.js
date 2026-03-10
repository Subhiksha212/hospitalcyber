// backend/update-password.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'src/data/users.json');

// ===== SET YOUR PASSWORD HERE =====
const YOUR_EMAIL = 'subhiksha278@gmail.com';
const YOUR_NEW_PASSWORD = 'yourpassword'; // Change this to the password you want to use
// ==================================

async function updatePassword() {
    try {
        // Read users file
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(data);

        // Find your user
        const userIndex = users.findIndex(u => u.email.toLowerCase() === YOUR_EMAIL.toLowerCase());

        if (userIndex === -1) {
            console.log('❌ User not found!');
            return;
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(YOUR_NEW_PASSWORD, salt);

        // Update password
        users[userIndex].password = hashedPassword;

        // Save back to file
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        console.log('✅ Password updated successfully!');
        console.log(`Email: ${YOUR_EMAIL}`);
        console.log(`New password: ${YOUR_NEW_PASSWORD}`);
        console.log('\nYou can now login with these credentials.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updatePassword();