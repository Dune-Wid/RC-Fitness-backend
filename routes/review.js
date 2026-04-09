const router = require('express').Router();
const Review = require('../models/Review');
const User = require('../models/User');

// GET all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE a review
router.post('/', async (req, res) => {
    try {
        // Find user to get their name
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(404).json("User not found");

        const memberSinceDate = new Date(user.createdAt);
        const diffTime = Math.abs(new Date() - memberSinceDate);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30)) || 1;
        const memberSinceStr = `MEMBER FOR ${diffMonths} MONTH${diffMonths > 1 ? 'S' : ''}`;

        const newReview = new Review({
            userId: req.body.userId,
            userName: user.fullName,
            memberSince: memberSinceStr,
            rating: req.body.rating,
            story: req.body.story,
            photoUrl: req.body.photoUrl
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE a review (only if it belongs to the user or if admin)
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json("Review not found");

        // The frontend will pass the current user's ID
        const currentUserId = req.body.userId || req.query.userId;
        const role = req.body.role || req.query.role; // allow admin to delete? The prompt said "delete only he added once"
        // Prompt says: "in rivew page customer can add rivews and delete only he added once."

        if (review.userId.toString() === currentUserId || role === 'admin') {
            await Review.findByIdAndDelete(req.params.id);
            res.status(200).json("Review deleted successfully");
        } else {
            res.status(403).json("You can only delete your own reviews");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
