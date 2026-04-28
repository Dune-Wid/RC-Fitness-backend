const router = require('express').Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
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

// Get user's workout plan
router.get('/me', verifyUser, async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ userId: req.user._id });
        if (!plan) return res.status(404).send('Workout plan not found');
        res.json(plan);
    } catch (err) { res.status(500).send(err.message); }
});

// Update or Create workout plan (Admin only)
router.post('/update', verifyUser, async (req, res) => {
    try {
        const updated = await WorkoutPlan.findOneAndUpdate(
            { userId: req.body.userId },
            { $set: req.body },
            { new: true, upsert: true }
        );
        await User.findByIdAndUpdate(req.body.userId, { workoutPlanRequested: false });
        res.json(updated);
    } catch (err) { res.status(400).send(err.message); }
});

// Get user's workout plan request status
router.get('/status', verifyUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('User not found');
        res.json({ workoutPlanRequested: user.workoutPlanRequested || false });
    } catch (err) { res.status(500).send(err.message); }
});

// Request a workout plan
router.post('/request', verifyUser, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { workoutPlanRequested: true });
        res.json({ message: 'Workout plan requested successfully' });
    } catch (err) { res.status(500).send(err.message); }
});

// Cancel a workout plan request
router.post('/cancel-request', verifyUser, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { workoutPlanRequested: false });
        res.json({ message: 'Workout plan request cancelled successfully' });
    } catch (err) { res.status(500).send(err.message); }
});

// Get all workout plans (Admin)
router.get('/all', verifyUser, async (req, res) => {
    try {
        const plans = await WorkoutPlan.find();
        res.json(plans);
    } catch (err) { res.status(500).send(err.message); }
});

// Delete a workout plan (Admin)
router.delete('/delete/:userId', verifyUser, async (req, res) => {
    try {
        await WorkoutPlan.findOneAndDelete({ userId: req.params.userId });
        res.json({ message: 'Workout plan deleted' });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
