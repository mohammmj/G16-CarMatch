// backend/config/db.js

/**
 * Database Configuration Module
 *
 * This module establishes and manages the connection to the PostgreSQL database.
 */
const { Pool } = require('pg');


/**
 * PostgreSQL connection pool configuration
 *
 * Creates a connection pool.
 */
const pool = new Pool({
    user: 'aq6340',
    host: 'pgserver.mau.se',
    database: 'g16_carmatch',
    password: 'gamznngr',
    port: 5432,
});

/**
 * Test database connection
 *
 * @returns {Promise<boolean>} True if connection succeeds, false if it fails
 */
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

/**
 * Module exports
 *
 * Exports the following:
 * - query: A function to execute SQL queries with inputs
 * - testConnection: Function to test database connectivity
 * - pool: The connection pool object
 */
module.exports = {
    query: (text, params) => pool.query(text, params),
    testConnection,
    pool
};

testConnection();