// backend/models/userModel.js

/**
 * User Model
 *
 * This module provides database for user management:
 * - Creating users
 * - Fetching users
 * - Authentication
 */
const db = require('../config/db');

/**
 * Creates a new user in the database
 *
 * @param {string} username - The username for the new user
 * @param {string} password - The user's password (stored as plain text for now)
 * @returns {Object} - The created user object
 * @throws Will throw an error if database fail
 */
const createUser = async (username, password) => {
    const query = `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING id, username
  `;

    try {
        const result = await db.query(query, [username, password]);
        return result.rows[0];
    } catch (error) {
        // Check for unique violation (username already exists)
        if (error.code === '23505') {
            throw new Error('Username already exists');
        }
        throw error;
    }
};

/**
 * Gets a user by username
 *
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
const getUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';

    const result = await db.query(query, [username]);
    return result.rows[0] || null;
};

/**
 * Authenticates a user by checking username and password
 *
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to check
 * @returns {Promise<Object|null>} - The user object if authentication succeeds, null otherwise
 */
const authenticateUser = async (username, password) => {
    const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';

    const result = await db.query(query, [username, password]);
    return result.rows[0] || null;
};

module.exports = {
    createUser,
    getUserByUsername,
    authenticateUser
};