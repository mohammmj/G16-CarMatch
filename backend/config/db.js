// backend/config/db.js
const { Pool } = require('pg');


// Database configuration
const pool = new Pool({
    user: 'aq6340',
    host: 'pgserver.mau.se',
    database: 'g16_carmatch',
    password: 'gamznngr',
    port: 5432,
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
        return true;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return false;
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    testConnection,
    pool
};

testConnection();