//API route för recensionerna

const express = require('express');
const router = express.Router();
const reviewModels = require('../models/reviewModels');

//Inloggning från de andra routes kanske ändra

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization header not found' });
    }
    req.userId = parseInt(authHeader.substring(7));

    next();
}

//skapa recension

router.post('/', authenticate, async (req, res) => {
    try {
        const {carId, rating, title, comment} = req.body;
        const review = await reviewModels.createReview(
            req.userId, carId, rating, title, comment
        );

        res.json({success: true, review});
    } catch (error) {
        res.status(500).json({success: false});
    }
});

    //delete en recension

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const deletedReview = await reviewModels.deleteReview(req.params.id, req.userId);
        if (deletedReview) {
            res.json({success: true});
        } else {
            res.status(404).json({success: false});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false });
    }
});
    module.exports = router;