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

        // Build the SQL query to return ALL cars
        let query = `SELECT * FROM cars`;
        const queryParams = [];

        // Execute the query
        const result = await db.query(query, queryParams);

        // Calculate match percentage for each car
        const carsWithMatchPercentage = result.rows.map(car => {
            // Keep track of criteria weights and scores
            const criteria = {
                brand: { weight: 15, score: 15 },
                model: { weight: 15, score: 15 },
                year: { weight: 10, score: 10 },
                horsepower: { weight: 10, score: 10 },
                price: { weight: 20, score: 20 },
                seats: { weight: 10, score: 10 },
                fuelType: { weight: 10, score: 10 },
                engineType: { weight: 10, score: 10 }
            };

            let totalWeight = 0;
            let totalScore = 0;

            // Check brand match
            if (brand) {
                totalWeight += criteria.brand.weight;
                if (car.brand.toLowerCase() !== brand.toLowerCase()) {
                    criteria.brand.score = 0; // Zero points for wrong brand
                }
            }

            // Check model match
            if (model) {
                totalWeight += criteria.model.weight;
                const carModel = car.model.toLowerCase();
                const searchModel = model.toLowerCase();

                if (!carModel.includes(searchModel)) {
                    criteria.model.score = 0; // No match
                } else if (carModel !== searchModel) {
                    // Partial match - award partial points
                    criteria.model.score = Math.floor(criteria.model.weight * 0.5);
                }
            }

            // Check year match
            if (year) {
                totalWeight += criteria.year.weight;
                const yearDiff = Math.abs(car.year - parseInt(year));

                if (yearDiff === 0) {
                    // Exact match - full points
                } else if (yearDiff === 1) {
                    criteria.year.score = Math.floor(criteria.year.weight * 0.7); // 1 year off
                } else if (yearDiff <= 3) {
                    criteria.year.score = Math.floor(criteria.year.weight * 0.4); // 2-3 years off
                } else {
                    criteria.year.score = 0; // More than 3 years off
                }
            }

            // Check horsepower match
            if (horsepower) {
                totalWeight += criteria.horsepower.weight;
                const requestedHP = parseInt(horsepower);
                const hpDiff = ((car.horsepower - requestedHP) / requestedHP) * 100;

                if (car.horsepower < requestedHP) {
                    // Less powerful than requested
                    const deficit = (requestedHP - car.horsepower) / requestedHP;
                    // If within 30% of requested, partial points
                    criteria.horsepower.score = deficit <= 0.3 ?
                        Math.floor(criteria.horsepower.weight * (1 - deficit)) : 0;
                } else if (hpDiff > 30) {
                    // Way more powerful than requested (inefficient)
                    criteria.horsepower.score = Math.floor(criteria.horsepower.weight * 0.5);
                }
            }

            // Check price match
            if (minPrice || maxPrice) {
                totalWeight += criteria.price.weight;
                const carPrice = parseFloat(car.price);
                let priceScore = criteria.price.weight;

                if (minPrice && carPrice < parseFloat(minPrice)) {
                    // Below minimum - might lack features
                    const belowMin = (parseFloat(minPrice) - carPrice) / parseFloat(minPrice);
                    priceScore -= Math.floor(criteria.price.weight * Math.min(1, belowMin * 2));
                }

                if (maxPrice && carPrice > parseFloat(maxPrice)) {
                    // Above maximum - budget concerns
                    const overBudget = (carPrice - parseFloat(maxPrice)) / parseFloat(maxPrice);
                    // Deduct 5% of price score for each 1% over budget
                    priceScore -= Math.min(criteria.price.weight, Math.floor(overBudget * 5 * criteria.price.weight));
                }

                criteria.price.score = Math.max(0, priceScore);
            }

            // Check seats match
            if (seats) {
                totalWeight += criteria.seats.weight;
                if (car.seats < parseInt(seats)) {
                    // Not enough seats is a big problem
                    criteria.seats.score = 0;
                }
            }

            // Check fuel type match
            if (fuelType) {
                totalWeight += criteria.fuelType.weight;
                if (car.fuel_type.toLowerCase() !== fuelType.toLowerCase()) {
                    // Wrong fuel type - zero points
                    criteria.fuelType.score = 0;
                }
            }

            // Check engine type match
            if (engineType) {
                totalWeight += criteria.engineType.weight;
                if (!car.engine_type.toLowerCase().includes(engineType.toLowerCase())) {
                    // Engine type doesn't match
                    criteria.engineType.score = 0;
                } else if (car.engine_type.toLowerCase() !== engineType.toLowerCase()) {
                    // Partial match
                    criteria.engineType.score = Math.floor(criteria.engineType.weight * 0.7);
                }
            }

            // Calculate final match percentage
            let matchPercentage = 100;

            if (totalWeight > 0) {
                // Add up scores from all criteria that were evaluated
                if (brand) totalScore += criteria.brand.score;
                if (model) totalScore += criteria.model.score;
                if (year) totalScore += criteria.year.score;
                if (horsepower) totalScore += criteria.horsepower.score;
                if (minPrice || maxPrice) totalScore += criteria.price.score;
                if (seats) totalScore += criteria.seats.score;
                if (fuelType) totalScore += criteria.fuelType.score;
                if (engineType) totalScore += criteria.engineType.score;

                // Calculate percentage
                matchPercentage = Math.round((totalScore / totalWeight) * 100);
            }

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