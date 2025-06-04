// backend/routes/favoritesRoutes.js

const express = require('express');
const router = express.Router();
const favoritesModel = require('../models/favoritesModel');

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = authHeader.substring(7);

    // Validate that userId is a number
    if (!userId || isNaN(userId) || parseInt(userId) <= 0) {
        return res.status(401).json({ success: false, message: 'Invalid user ID' });
    }

    req.userId = parseInt(userId);
    next();
}

/**
 * Validates car ID parameter
 */
function validateCarId(carId) {
    return carId && !isNaN(carId) && parseInt(carId) > 0;
}

/**
 * GET /api/favorites/count - Get user's favorites count
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

/**
 * GET /api/favorites/check/:carId - Check if car is favorited
 */
router.get('/check/:carId', authenticate, async (req, res) => {
    try {
        const carId = req.params.carId;

        if (!validateCarId(carId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid car ID'
            });
        }

        const isFavorited = await favoritesModel.isFavorited(req.userId, parseInt(carId));

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
 * GET /api/favorites - Get user's favorite cars
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
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { carId } = req.body;

        if (!validateCarId(carId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid car ID'
            });
        }

        const favorite = await favoritesModel.addFavorite(req.userId, parseInt(carId));

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
 */
router.delete('/:carId', authenticate, async (req, res) => {
    try {
        const carId = req.params.carId;

        if (!validateCarId(carId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid car ID'
            });
        }

        const removed = await favoritesModel.removeFavorite(req.userId, parseInt(carId));

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

module.exports = router;