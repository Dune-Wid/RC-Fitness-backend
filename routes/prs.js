const router = require('express').Router();
const PR = require('../models/PR');

// Log a new PR
router.post('/log', async (req, res) => {
    try {
        const { liftName, weight, unit } = req.body;
        
        const newPR = new PR({
            liftName,
            weight,
            unit
        });

        const savedPR = await newPR.save();
        res.status(201).json({ message: "Personal Record logged successfully!", pr: savedPR });
    } catch (err) {
        res.status(500).json({ error: "Failed to log PR", details: err });
    }
});

// Get all PRs
router.get('/', async (req, res) => {
    try {
        const prs = await PR.find().sort({ createdAt: -1 });
        res.status(200).json(prs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch PRs", details: err });
    }
});

// Delete a PR
router.delete('/:id', async (req, res) => {
    try {
        await PR.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "PR deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete PR", details: err });
    }
});

module.exports = router;
