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
        // Ensure parameters are integers
        const userIdInt = parseInt(userId);
        const carIdInt = parseInt(carId);

        console.log(`Adding favorite: userId=${userIdInt}, carId=${carIdInt}`);

        const result = await db.query(query, [userIdInt, carIdInt]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in addFavorite:', error);
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

    try {
        // Ensure parameters are integers
        const userIdInt = parseInt(userId);
        const carIdInt = parseInt(carId);

        console.log(`Attempting to remove favorite: userId=${userIdInt}, carId=${carIdInt}`);

        // First check if the favorite exists
        const checkQuery = 'SELECT * FROM favorites WHERE user_id = $1 AND car_id = $2';
        const checkResult = await db.query(checkQuery, [userIdInt, carIdInt]);

        console.log(`Found ${checkResult.rows.length} matching favorites before deletion`);

        if (checkResult.rows.length === 0) {
            console.log('No matching favorite found to delete');
            return false;
        }

        // Perform the deletion
        const result = await db.query(query, [userIdInt, carIdInt]);
        console.log(`Delete operation affected ${result.rowCount} rows`);

        return result.rowCount > 0;
    } catch (error) {
        console.error('Error in removeFavorite:', error);
        throw error;
    }
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

    try {
        const userIdInt = parseInt(userId);
        console.log(`Getting favorites for userId=${userIdInt}`);

        const result = await db.query(query, [userIdInt]);
        console.log(`Found ${result.rows.length} favorites for user`);

        return result.rows;
    } catch (error) {
        console.error('Error in getUserFavorites:', error);
        throw error;
    }
};

/**
 * Gets detailed information about user's favorite cars
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

    try {
        const userIdInt = parseInt(userId);
        console.log(`Getting favorite details for userId=${userIdInt}`);

        const result = await db.query(query, [userIdInt]);
        console.log(`Found ${result.rows.length} favorite details for user`);

        return result.rows;
    } catch (error) {
        console.error('Error in getUserFavoriteDetails:', error);
        throw error;
    }
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

    try {
        const userIdInt = parseInt(userId);
        const carIdInt = parseInt(carId);

        console.log(`Checking if favorited: userId=${userIdInt}, carId=${carIdInt}`);

        const result = await db.query(query, [userIdInt, carIdInt]);
        const isFav = result.rows.length > 0;

        console.log(`Is favorited: ${isFav}`);
        return isFav;
    } catch (error) {
        console.error('Error in isFavorited:', error);
        throw error;
    }
};

/**
 * Gets the count of favorites for a user
 *
 * @param {number} userId - The ID of the user
 * @returns {Promise<number>} - Number of favorited cars
 */
const getFavoritesCount = async (userId) => {
    const query = 'SELECT COUNT(*) FROM favorites WHERE user_id = $1';

    try {
        const userIdInt = parseInt(userId);
        console.log(`Getting favorites count for userId=${userIdInt}`);

        const result = await db.query(query, [userIdInt]);
        const count = parseInt(result.rows[0].count);

        console.log(`Favorites count: ${count}`);
        return count;
    } catch (error) {
        console.error('Error in getFavoritesCount:', error);
        throw error;
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    getUserFavoriteDetails,
    isFavorited,
    getFavoritesCount
};