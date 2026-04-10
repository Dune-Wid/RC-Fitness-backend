const router = require('express').Router();
const WorkoutLog = require('../models/WorkoutLog');
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

// Log a completed workout
router.post('/complete', verifyUser, async (req, res) => {
    const log = new WorkoutLog({
        userId: req.user._id,
        programName: req.body.programName,
        week: req.body.week,
        day: req.body.day,
        exercisesCompleted: req.body.exercisesCompleted,
        completionPercentage: req.body.completionPercentage
    });
    try {
        const savedLog = await log.save();
        res.status(201).json(savedLog);
    } catch (err) { res.status(400).send(err.message); }
});

// Get member's workout history
router.get('/history', verifyUser, async (req, res) => {
    try {
        const history = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(history);
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
