const router = require('express').Router();
const WorkoutLog = require('../models/WorkoutLog');

// Complete a workout
router.post('/complete', async (req, res) => {
    try {
        const { programName, week, day, exercisesCompleted, completionPercentage } = req.body;
        
        const newLog = new WorkoutLog({
            programName,
            week,
            day,
            exercisesCompleted,
            completionPercentage
        });

        const savedLog = await newLog.save();
        res.status(201).json({ message: "Workout successfully logged!", log: savedLog });
    } catch (err) {
        res.status(500).json({ error: "Failed to log workout", details: err });
    }
});

module.exports = router;
