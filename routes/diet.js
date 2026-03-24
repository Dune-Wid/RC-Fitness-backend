const router = require('express').Router();
const DietAssignment = require('../models/DietAssignment');

// Assign a diet plan
router.post('/assign', async (req, res) => {
    try {
        const { memberName, goal, dietDetails } = req.body;
        
        const newAssignment = new DietAssignment({
            memberName,
            goal,
            dietDetails
        });

        const savedAssignment = await newAssignment.save();
        res.status(201).json({ message: "Diet plan assigned successfully!", assignment: savedAssignment });
    } catch (err) {
        res.status(500).json({ error: "Failed to assign diet plan", details: err });
    }
});

module.exports = router;
