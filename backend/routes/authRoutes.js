// backend/routes/authRoutes.js

/**
 * Authentication Routes
 *
 * This module provides API endpoints for user authentication:
 * - User registration
 * - User login
 */
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

/**
 * POST /api/auth/register - Register a new user
 *
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - The username for registration
 * @param {string} req.body.password - The password for registration
 *
 * @returns {Object} - JSON response with success status and user data
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        // Check if username is at least 3 characters
        if (username.length < 3) {
            return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
        }

        // Check if password is at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        // Create user
        const user = await userModel.createUser(username, password);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);

        // Check for specific error types
        if (error.message === 'Username already exists') {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
    }
});

/**
 * POST /api/auth/login - Login a user
 *
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - The username for login
 * @param {string} req.body.password - The password for login
 *
 * @returns {Object} - JSON response with success status and user data
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        // Authenticate user
        const user = await userModel.authenticateUser(username, password);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Return success response with user data
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
});

module.exports = router;