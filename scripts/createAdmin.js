// scripts/createAdmin.js
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const pool = require('../db');

async function createAdmin() {
    const username = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASSWORD;
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
        [username, hash, hash]
    );
    console.log('Admin creado:', username);
    process.exit(0);
}
createAdmin().catch(console.error);