// backend/routes/profileRoutes.js

/**
 * Profile Management Routes
 *
 * This module provides API endpoints for user profile management:
 * - Get user profile information
 * - Update user profile (username, password)
 */
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

/**
 * GET /api/auth/profile - Get user profile information
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 *
 * @returns {Object} - JSON response with user profile data
 */
router.get('/profile', async (req, res) => {
    try {
        // Simple authentication - extract user ID from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userId = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Get user by ID
        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return user profile (without password)
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ success: false, message: 'Error retrieving profile', error: error.message });
    }
});

/**
 * PUT /api/auth/update-profile - Update user profile
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @param {Object} req.body - Request body
 * @param {string} [req.body.username] - New username
 * @param {string} [req.body.password] - New password
 *
 * @returns {Object} - JSON response with success status and updated user data
 */
router.put('/update-profile', async (req, res) => {
    try {
        // Simple authentication - extract user ID from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userId = authHeader.substring(7); // Remove 'Bearer ' prefix
        const { username, password } = req.body;

        // Validate that at least one field is provided
        if (!username && !password) {
            return res.status(400).json({ success: false, message: 'At least one field (username or password) must be provided' });
        }

        // Validate username if provided
        if (username && username.trim().length < 3) {
            return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long' });
        }

        // Validate password if provided
        if (password && password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        // Check if user exists
        const existingUser = await userModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if new username is already taken (if username is being changed)
        if (username && username.trim() !== existingUser.username) {
            const usernameExists = await userModel.getUserByUsername(username.trim());
            if (usernameExists) {
                return res.status(409).json({ success: false, message: 'Username already exists' });
            }
        }

        // Update user profile
        const updatedUser = await userModel.updateUser(userId, {
            username: username ? username.trim() : existingUser.username,
            password: password || existingUser.password
        });

        // Return success response
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);

        // Check for specific error types
        if (error.message === 'Username already exists') {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
});

module.exports = router;