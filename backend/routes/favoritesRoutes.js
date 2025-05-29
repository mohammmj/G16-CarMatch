// backend/routes/favoritesRoutes.js

/**
 * Favorites Routes
 *
 * This module provides API endpoints for managing user favorites:
 * - GET /api/favorites - Get user's favorite cars
 * - POST /api/favorites - Add a car to favorites
 * - DELETE /api/favorites/:carId - Remove a car from favorites
 * - GET /api/favorites/check/:carId - Check if car is favorited
 */
const express = require('express');
const router = express.Router();
const favoritesModel = require('../models/favoritesModel');

/**
 * Authentication middleware
 * Extracts user ID from Authorization header
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = authHeader.substring(7); // Remove 'Bearer ' prefix
    req.userId = userId;
    next();
}

/**
 * GET /api/favorites - Get user's favorite cars
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @returns {Object} - JSON response with favorite car IDs
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const favorites = await favoritesModel.getUserFavoriteDetails(req.userId);

        res.json({
            success: true,
            favorites: favorites,
            count: favorites.length
        });
    } catch (error) {
        console.error('Error getting user favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving favorites',
            error: error.message
        });
    }
});

/**
 * POST /api/favorites - Add a car to favorites
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @param {Object} req.body - Request body
 * @param {number} req.body.carId - The ID of the car to favorite
 * @returns {Object} - JSON response with success status
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { carId } = req.body;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message: 'Car ID is required'
            });
        }

        const favorite = await favoritesModel.addFavorite(req.userId, carId);

        res.status(201).json({
            success: true,
            message: 'Car added to favorites',
            favorite: favorite
        });
    } catch (error) {
        console.error('Error adding favorite:', error);

        if (error.message === 'Car is already in favorites') {
            return res.status(409).json({
                success: false,
                message: 'Car is already in your favorites'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error adding to favorites',
            error: error.message
        });
    }
});

/**
 * DELETE /api/favorites/:carId - Remove a car from favorites
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @param {number} req.params.carId - The ID of the car to remove from favorites
 * @returns {Object} - JSON response with success status
 */
router.delete('/:carId', authenticate, async (req, res) => {
    try {
        const carId = req.params.carId;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message: 'Car ID is required'
            });
        }

        const removed = await favoritesModel.removeFavorite(req.userId, carId);

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Car not found in favorites'
            });
        }

        res.json({
            success: true,
            message: 'Car removed from favorites'
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from favorites',
            error: error.message
        });
    }
});

/**
 * GET /api/favorites/check/:carId - Check if car is favorited
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @param {number} req.params.carId - The ID of the car to check
 * @returns {Object} - JSON response with favorite status
 */
router.get('/check/:carId', authenticate, async (req, res) => {
    try {
        const carId = req.params.carId;

        if (!carId) {
            return res.status(400).json({
                success: false,
                message: 'Car ID is required'
            });
        }

        const isFavorited = await favoritesModel.isFavorited(req.userId, carId);

        res.json({
            success: true,
            isFavorited: isFavorited
        });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking favorite status',
            error: error.message
        });
    }
});

/**
 * GET /api/favorites/count - Get user's favorites count
 *
 * @param {Object} req.headers.authorization - Bearer token with user ID
 * @returns {Object} - JSON response with favorites count
 */
router.get('/count', authenticate, async (req, res) => {
    try {
        const count = await favoritesModel.getFavoritesCount(req.userId);

        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error getting favorites count:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting favorites count',
            error: error.message
        });
    }
});

module.exports = router;