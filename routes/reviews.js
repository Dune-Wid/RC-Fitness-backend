const router = require('express').Router();
const Review = require('../models/Review');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) { res.status(500).send(err.message); }
});

// Post a review
router.post('/', async (req, res) => {
    const review = new Review(req.body);
    try {
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (err) { res.status(400).send(err.message); }
});

// Delete a review (simplified for now, ideally needs auth)
router.delete('/:id', async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review deleted" });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
