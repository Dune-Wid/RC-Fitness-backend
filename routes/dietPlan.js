const router = require('express').Router();
const DietPlan = require('../models/DietPlan');
const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).send('Invalid Token'); }
};

// Get user's diet plan
router.get('/me', verifyUser, async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ userId: req.user._id });
        if (!plan) return res.status(404).send('Diet plan not found');
        res.json(plan);
    } catch (err) { res.status(500).send(err.message); }
});

// Update or Create diet plan (Admin only)
router.post('/update', verifyUser, async (req, res) => {
    // Ideally this would have verifyAdmin middleware
    try {
        const updated = await DietPlan.findOneAndUpdate(
            { userId: req.body.userId },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) { res.status(400).send(err.message); }
});

module.exports = router;
