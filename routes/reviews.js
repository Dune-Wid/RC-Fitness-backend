const router = require('express').Router();
const Review = require('../models/Review');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Submit a new review
router.post('/', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
