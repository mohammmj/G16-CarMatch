// backend/models/carModel.js

const db = require('../config/db');

/**
 * Gets complete car details by ID including details and equipment
 */
const getCarById = async (carId) => {
    const query = `
        SELECT 
            c.*,
            cd.transmission,
            cd.transmission_sv,
            cd.fuel_type_sv,
            cd.drive_type,
            cd.drive_type_sv,
            cd.body_type,
            cd.body_type_sv,
            cd.engine_size,
            cd.service_history,
            json_agg(
                json_build_object(
                    'id', ce.id,
                    'name', ce.equipment_name,
                    'category', ce.equipment_category
                ) ORDER BY ce.equipment_name
            ) FILTER (WHERE ce.id IS NOT NULL) as equipment
        FROM cars c
        LEFT JOIN car_details cd ON c.id = cd.car_id
        LEFT JOIN car_equipment ce ON c.id = ce.car_id
        WHERE c.id = $1
        GROUP BY c.id, cd.transmission, cd.transmission_sv, cd.fuel_type_sv, 
                 cd.drive_type, cd.drive_type_sv, cd.body_type, cd.body_type_sv, 
                 cd.engine_size, cd.service_history
    `;

    try {
        const result = await db.query(query, [parseInt(carId)]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error in getCarById:', error);
        throw error;
    }
};

/**
 * Gets all equipment for a specific car
 */
const getCarEquipment = async (carId) => {
    const query = `
        SELECT 
            id,
            equipment_name,
            equipment_category
        FROM car_equipment
        WHERE car_id = $1
        ORDER BY equipment_category, equipment_name
    `;

    try {
        const result = await db.query(query, [parseInt(carId)]);
        return result.rows;
    } catch (error) {
        console.error('Error in getCarEquipment:', error);
        throw error;
    }
};

/**
 * Gets detailed information for a specific car
 */
const getCarDetails = async (carId) => {
    const query = `SELECT * FROM car_details WHERE car_id = $1`;

    try {
        const result = await db.query(query, [parseInt(carId)]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getCarDetails:', error);
        throw error;
    }
};

module.exports = {
    getCarById,
    getCarEquipment,
    getCarDetails
};