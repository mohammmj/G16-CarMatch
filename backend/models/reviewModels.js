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
