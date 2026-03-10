// backend/verify-password.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, 'src/data/users.json');

// ===== TEST WITH YOUR PASSWORD =====
const TEST_EMAIL = 'subhiksha278@gmail.com';
const TEST_PASSWORD = 'yourpassword'; // Type the password you want to test
// ====================================

async function verifyPassword() {
    try {
        // Read users file
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(data);

        // Find your user
        const user = users.find(u => u.email.toLowerCase() === TEST_EMAIL.toLowerCase());

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('Found user:', user.email);
        console.log('Stored password hash:', user.password);
        console.log('Testing password:', TEST_PASSWORD);

        // Verify the password
        const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);

        if (isValid) {
            console.log('✅ Password is correct! Login will work.');
        } else {
            console.log('❌ Password is incorrect!');
            console.log('\n💡 Run: node update-password.js to set a new password');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyPassword();