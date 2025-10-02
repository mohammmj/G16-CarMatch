
const express = require('express');
const router = express.Router();
const carModel = require('../models/carModel');

/**
 * GET /api/cars/:id - Get detailed information about a specific car
 */
router.get('/:id', async (req, res) => {
    try {
        const carId = req.params.id;

        if (!carId || isNaN(carId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid car ID'
            });
        }

        const car = await carModel.getCarById(carId);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            car: car
        });

    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car details',
            error: error.message
        });
    }
});

/**
 * GET /api/cars/:id/equipment - Get equipment for a specific car
 */
router.get('/:id/equipment', async (req, res) => {
    try {
        const carId = req.params.id;

        if (!carId || isNaN(carId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid car ID'
            });
        }

        const equipment = await carModel.getCarEquipment(carId);

        res.json({
            success: true,
            equipment: equipment
        });

    } catch (error) {
        console.error('Error fetching car equipment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching equipment',
            error: error.message
        });
    }
});

module.exports = router;