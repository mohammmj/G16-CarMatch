// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/search - Search for cars based on criteria
router.get('/', async (req, res) => {
    try {
        // Extract search parameters from query string
        const {
            brand,
            model,
            year,
            horsepower,
            minPrice,
            maxPrice,
            seats,
            fuelType,
            engineType
        } = req.query;

        // Build the SQL query dynamically
        let query = `
      SELECT * FROM cars
      WHERE 1=1
    `;

        const queryParams = [];
        let paramIndex = 1;

        // Add filters based on provided parameters
        if (brand) {
            query += ` AND brand = $${paramIndex++}`;
            queryParams.push(brand);
        }

        if (model) {
            query += ` AND model ILIKE $${paramIndex++}`;
            queryParams.push(`%${model}%`);
        }

        if (year) {
            query += ` AND year = $${paramIndex++}`;
            queryParams.push(parseInt(year));
        }

        if (horsepower) {
            query += ` AND horsepower >= $${paramIndex++}`;
            queryParams.push(parseInt(horsepower));
        }

        if (minPrice) {
            query += ` AND price >= $${paramIndex++}`;
            queryParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ` AND price <= $${paramIndex++}`;
            queryParams.push(parseFloat(maxPrice));
        }

        if (seats) {
            query += ` AND seats >= $${paramIndex++}`;
            queryParams.push(parseInt(seats));
        }

        if (fuelType) {
            query += ` AND fuel_type = $${paramIndex++}`;
            queryParams.push(fuelType);
        }

        if (engineType) {
            query += ` AND engine_type ILIKE $${paramIndex++}`;
            queryParams.push(`%${engineType}%`);
        }

        // Execute the query
        const result = await db.query(query, queryParams);

        // Calculate match percentage for each car
        const carsWithMatchPercentage = result.rows.map(car => {
            // Simple match calculation - you should implement your own logic
            let matchScore = 100; // Start with perfect score

            // Reduce match score based on differences (example logic)
            if (brand && car.brand !== brand) matchScore -= 10;
            if (model && !car.model.includes(model)) matchScore -= 10;
            if (year && car.year !== parseInt(year)) matchScore -= 5;

            // Ensure match percentage is between 0 and 100
            const matchPercentage = Math.max(0, Math.min(100, matchScore));

            return {
                ...car,
                matchPercentage
            };
        });

        // Sort by match percentage (highest first)
        carsWithMatchPercentage.sort((a, b) => b.matchPercentage - a.matchPercentage);

        // Return the results
        res.json(carsWithMatchPercentage);

    } catch (error) {
        console.error('Error searching for cars:', error);
        res.status(500).json({ message: 'Error searching for cars', error: error.message });
    }
});

// GET /api/search/:id - Get a specific car by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('SELECT * FROM cars WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).json({ message: 'Error fetching car details', error: error.message });
    }
});

module.exports = router;