// backend/models/favoritesModel.js

/**
 * Favorites Model
 *
 * This module provides database operations for managing user favorites:
 * - Adding cars to favorites
 * - Removing cars from favorites
 * - Getting user's favorite cars
 * - Checking if a car is favorited by a user
 */
const db = require('../config/db');

/**
 * Adds a car to user's favorites
 *
 * @param {number} userId - The ID of the user
 * @param {number} carId - The ID of the car to favorite
 * @returns {Promise<Object>} - The created favorite record
 * @throws Will throw an error if database operation fails or if already favorited
 */
const addFavorite = async (userId, carId) => {
    const query = `
        INSERT INTO favorites (user_id, car_id)
        VALUES ($1, $2)
        RETURNING id, user_id, car_id, created_at
    `;

    try {
        const result = await db.query(query, [userId, carId]);
        return result.rows[0];
    } catch (error) {
        // Check for unique violation (already favorited)
        if (error.code === '23505') {
            throw new Error('Car is already in favorites');
        }
        throw error;
    }
};

/**
 * Removes a car from user's favorites
 *
 * @param {number} userId - The ID of the user
 * @param {number} carId - The ID of the car to remove from favorites
 * @returns {Promise<boolean>} - True if favorite was removed, false if not found
 */
const removeFavorite = async (userId, carId) => {
    const query = 'DELETE FROM favorites WHERE user_id = $1 AND car_id = $2';

    const result = await db.query(query, [userId, carId]);
    return result.rowCount > 0;
};

/**
 * Gets all favorite cars for a user
 *
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} - Array of favorite car IDs with timestamps
 */
const getUserFavorites = async (userId) => {
    const query = `
        SELECT car_id, created_at
        FROM favorites
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Gets detailed information about user's favorite cars
 * This would need to be modified based on your cars table structure
 *
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} - Array of car IDs (you'll need to fetch car details separately)
 */
const getUserFavoriteDetails = async (userId) => {
    const query = `
        SELECT f.car_id, f.created_at
        FROM favorites f
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Checks if a car is favorited by a user
 *
 * @param {number} userId - The ID of the user
 * @param {number} carId - The ID of the car
 * @returns {Promise<boolean>} - True if car is favorited, false otherwise
 */
const isFavorited = async (userId, carId) => {
    const query = 'SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2';

    const result = await db.query(query, [userId, carId]);
    return result.rows.length > 0;
};

/**
 * Gets the count of favorites for a user
 *
 * @param {number} userId - The ID of the user
 * @returns {Promise<number>} - Number of favorited cars
 */
const getFavoritesCount = async (userId) => {
    const query = 'SELECT COUNT(*) FROM favorites WHERE user_id = $1';

    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count);
};

/**
 * Removes all favorites for a user (useful for account deletion)
 *
 * @param {number} userId - The ID of the user
 * @returns {Promise<number>} - Number of favorites removed
 */
const removeAllUserFavorites = async (userId) => {
    const query = 'DELETE FROM favorites WHERE user_id = $1';

    const result = await db.query(query, [userId]);
    return result.rowCount;
};

module.exports = {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    getUserFavoriteDetails,
    isFavorited,
    getFavoritesCount,
    removeAllUserFavorites
};