// backend/models/userModel.js

/**
 * User Model
 *
 * This module provides database operations for user management:
 * - Creating users
 * - Fetching users
 * - Authentication
 * - Profile updates
 */
const db = require('../config/db');

/**
 * Creates a new user in the database
 *
 * @param {string} username - The username for the new user
 * @param {string} password - The user's password (stored as plain text for now)
 * @returns {Object} - The created user object
 * @throws Will throw an error if database operation fails
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
 * Gets a user by ID
 *
 * @param {number} userId - The user ID to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
};

/**
 * Updates a user's profile information
 *
 * @param {number} userId - The ID of the user to update
 * @param {Object} updateData - The data to update
 * @param {string} [updateData.username] - New username
 * @param {string} [updateData.password] - New password
 * @returns {Promise<Object>} - The updated user object
 * @throws Will throw an error if database operation fails
 */
const updateUser = async (userId, updateData) => {
    const { username, password } = updateData;

    const query = `
        UPDATE users 
        SET username = $1, password = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, username
    `;

    try {
        const result = await db.query(query, [username, password, userId]);

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

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

/**
 * Deletes a user from the database
 *
 * @param {number} userId - The ID of the user to delete
 * @returns {Promise<boolean>} - True if user was deleted, false if not found
 */
const deleteUser = async (userId) => {
    const query = 'DELETE FROM users WHERE id = $1';

    const result = await db.query(query, [userId]);
    return result.rowCount > 0;
};

module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
    updateUser,
    authenticateUser,
    deleteUser
};