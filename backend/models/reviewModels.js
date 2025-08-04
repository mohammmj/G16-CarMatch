const db = require('../config/db');


//skapar en review//
const createReview = async (userId, carId, rating, title, comment = null) => {
    const query = `
        INSERT INTO reviews (user_id, car_id, rating, title, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, car_id, rating, title, comment, created_at, updated_at
    `;

    try {
        // fel hantering av parameterar
        const userIdInt = parseInt(userId);
        const carIdInt = parseInt(carId);
        const ratingInt = parseInt(rating);

        console.log(`Creating review: userId=${userIdInt}, carId=${carIdInt}, rating=${ratingInt}`);

        const result = await db.query(query, [userIdInt, carIdInt, ratingInt, title, comment]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in createReview:', error);
        throw error;
    }
};

//hämtar reviews för en bil ock ska sortera efter nyaste, kanske behövs fixas
const getReviewsByCarId = async (carId) => {
    const query = `
        SELECT 
            r.id,
            r.user_id,
            r.car_id,
            r.rating,
            r.title,
            r.comment,
            r.created_at,
            r.updated_at,
            u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.car_id = $1
        ORDER BY r.created_at DESC
    `;

    const carIdInt = parseInt(carId);
    console.log(`Getting reviews for carId=${carIdInt}`);

    const result = await db.query(query, [carIdInt]);
    console.log(`Found ${result.rows.length} reviews for car`);

    return result.rows;
};

//Statestik

const getReviewStats = async (carid) => {
    const query = `
    SELECT
    COUNT(*) AS total_reviews,
    AVG(rating) as average_rating
    FROM reviews r
    WHERE car_id = $1
    `;

    const result = await db.query(query, [carid]);
    const stats = result.rows[0];
    return{
        total_reviews: parseInt(stats.total_reviews),
        average_rating: stats.average_rating ? stats.average_rating : 0,
    };
};

//Ta bort receension

const deleteReview = async (reviewId, carId) => {
    const query = `DELETE FROM reviews WHERE id = $1 AND user_id = $2`;
    try{ const result = await db.query(query, [parseInt(reviewId), parseInt(carId)]);
    return result.rowCount > 0;
    } catch (error) {

    }
    const result = await db.query(query, [carId]);
    return result.rows[0];
};

module.exports = {
    createReview,
    getReviewsByCarId,
    getReviewStats,
    deleteReview,
};
